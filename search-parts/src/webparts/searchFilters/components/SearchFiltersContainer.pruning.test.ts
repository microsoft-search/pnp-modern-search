jest.mock('../../../controls/TemplateRenderer/TemplateRenderer', () => ({}));
jest.mock('../../../components/StyledWebPartTitle', () => ({}));
jest.mock('SearchFiltersWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseWebComponent: class {},
    FilterComparisonOperator: { Eq: 0 },
    FilterConditionOperator: { OR: 'or', AND: 'and' },
    FilterType: { Refiner: 'Refiner' }
}));
jest.mock('@microsoft/sp-core-library', () => ({
    Log: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), verbose: jest.fn() }
}));
jest.mock('../../../services/tokenService/TokenService', () => ({ BuiltinTokenNames: { filters: 'filters' } }));
jest.mock('../../../helpers/UrlHelper', () => ({ UrlHelper: {} }));
jest.mock('../../../layouts/AvailableTemplates', () => ({
    BuiltinFilterTemplates: { Hierarchical: 'Hierarchical' }
}));
jest.mock('../../../styles/Common.module.scss', () => ({}));
jest.mock('../../../components/filters/FilterHierarchicalComponent.module.scss', () => ({}));

import SearchFiltersContainer from './SearchFiltersContainer';
import { TaxonomyHelper } from '../../../helpers/TaxonomyHelper';

const encodeToken = (token: string): string => `"ǂǂ${token.split('').map(char => (char.codePointAt(0) || 0).toString(16).padStart(2, '0')).join('')}"`;

const europeGuid = '11111111-1111-1111-1111-111111111111';
const franceGuid = '22222222-2222-2222-2222-222222222222';
const lyonGuid = '33333333-3333-3333-3333-333333333333';
const asiaGuid = '44444444-4444-4444-4444-444444444444';
const thailandGuid = '55555555-5555-5555-5555-555555555555';

interface ITestTerm {
    id: string;
    name: string;
    label: string;
    parentId: string;
    pathOfTerm: string;
    children: ITestTerm[];
}

function term(id: string, label: string, children: ITestTerm[] = [], parentId: string = ''): ITestTerm {
    return { id, name: label, label, parentId, pathOfTerm: label, children };
}

function buildTestHierarchy(): ITestTerm[] {
    return [
        term(europeGuid, 'Europe', [
            term(franceGuid, 'France', [
                term(lyonGuid, 'Lyon', [], franceGuid)
            ], europeGuid)
        ]),
        term(asiaGuid, 'Asia', [
            term(thailandGuid, 'Thailand', [], asiaGuid)
        ])
    ];
}

function flattenLabels(terms: ITestTerm[]): string[] {
    return (terms || []).reduce((labels: string[], current) => {
        return labels.concat(current.label, flattenLabels(current.children));
    }, []);
}

function createContainer(): any {
    const props: any = {
        instanceId: 'test-instance',
        taxonomyService: {
            getTermsByTermSetId: jest.fn().mockResolvedValue([])
        },
        context: { pageContext: { web: { absoluteUrl: 'https://contoso.sharepoint.com' } } }
    };
    return new (SearchFiltersContainer as any)(props);
}

const hierarchicalFilterConfiguration: any = {
    filterName: 'RefinableString10',
    selectedTemplate: 'Hierarchical',
    termSetId: 'termset-1',
    termGroupId: 'termgroup-1',
    hideNodesNotInDataSet: true
};

async function populate(container: any, availableFilter: any, values: any[], configurationOverrides: any = {}, hierarchy: ITestTerm[] = buildTestHierarchy()): Promise<any> {
    // Seed the term hierarchy cache so no taxonomy fetch is required
    const cacheKey = container['getHierarchyCacheKey'](availableFilter.filterName, hierarchicalFilterConfiguration.termSetId, hierarchicalFilterConfiguration.termGroupId);
    container._hierarchyCacheByFilterKey.set(cacheKey, hierarchy);

    const filterResultInternal: any = {};
    await container['populateHierarchicalTerms'](
        filterResultInternal,
        availableFilter,
        values,
        { ...hierarchicalFilterConfiguration, ...configurationOverrides }
    );
    return filterResultInternal;
}

describe('pruneHierarchy (issue #5060)', () => {

    const prune = (resultGuids: string[], selectedGuids: string[], selectedLabels: string[], isZeroResultResponse: boolean): ITestTerm[] => {
        const container = createContainer();
        // pruneHierarchy compares normalized GUIDs (no dashes, lowercase)
        const normalize = (guids: string[]): Set<string> => new Set(guids.map(g => TaxonomyHelper.normalizeGuid(g)));
        return container['pruneHierarchy'](
            buildTestHierarchy(),
            normalize(resultGuids),
            normalize(selectedGuids),
            new Set(selectedLabels),
            isZeroResultResponse
        );
    };

    it('returns an empty hierarchy on a zero-result response with no selection', () => {
        expect(prune([], [], [], true)).toEqual([]);
    });

    it('keeps a GUID-selected term and its ancestor path on a zero-result response', () => {
        const pruned = prune([], [lyonGuid], [], true);
        expect(flattenLabels(pruned)).toEqual(['Europe', 'France', 'Lyon']);
    });

    it('keeps a label-only selected term and its ancestor path on a zero-result response', () => {
        const pruned = prune([], [], ['lyon'], true);
        expect(flattenLabels(pruned)).toEqual(['Europe', 'France', 'Lyon']);
    });

    it('keeps matching terms and ancestor paths for non-empty results', () => {
        const pruned = prune([lyonGuid], [], [], false);
        expect(flattenLabels(pruned)).toContain('Lyon');
        expect(flattenLabels(pruned)).toContain('France');
        expect(flattenLabels(pruned)).toContain('Europe');
    });
});

describe('populateHierarchicalTerms (issue #5060)', () => {

    it('keeps the full hierarchy when hideNodesNotInDataSet is disabled', async () => {
        const container = createContainer();
        const result = await populate(
            container,
            { filterName: 'RefinableString10', values: [] },
            [],
            { hideNodesNotInDataSet: false }
        );
        expect(flattenLabels(result.hierarchicalTerms)).toEqual(['Europe', 'France', 'Lyon', 'Asia', 'Thailand']);
    });

    it('transitions from full hierarchy while loading to empty on a settled zero-result response with identical GUID signatures', async () => {
        const container = createContainer();

        // Loading state: empty values but result signals still pending
        const loadingResult = await populate(
            container,
            { filterName: 'RefinableString10', values: [], isAwaitingResultSignals: true },
            []
        );
        expect(flattenLabels(loadingResult.hierarchicalTerms)).toEqual(['Europe', 'France', 'Lyon', 'Asia', 'Thailand']);

        // Settled zero-result state: same empty GUID signatures, no pending signals
        const settledResult = await populate(
            container,
            { filterName: 'RefinableString10', values: [], isAwaitingResultSignals: false },
            []
        );
        expect(settledResult.hierarchicalTerms).toEqual([]);
    });

    it('retains a GUID-based selection and its ancestor path on a settled zero-result response', async () => {
        const container = createContainer();
        const result = await populate(
            container,
            { filterName: 'RefinableString10', values: [], isAwaitingResultSignals: false },
            [{ name: 'Lyon', value: `GP0|#${lyonGuid}`, selected: true }]
        );
        expect(flattenLabels(result.hierarchicalTerms)).toEqual(['Europe', 'France', 'Lyon']);
    });

    it('retains a label-only selection and its ancestor path on a settled zero-result response', async () => {
        const container = createContainer();
        const result = await populate(
            container,
            { filterName: 'RefinableString10', values: [], isAwaitingResultSignals: false },
            [{ name: 'Lyon', value: 'Lyon', selected: true }]
        );
        expect(flattenLabels(result.hierarchicalTerms)).toEqual(['Europe', 'France', 'Lyon']);
    });

    it('prunes to matching terms and ancestor paths for non-empty results', async () => {
        const container = createContainer();
        const result = await populate(
            container,
            {
                filterName: 'RefinableString10',
                values: [{ name: 'Lyon', value: `L0|#0${lyonGuid}|Lyon`, count: 4 }],
                isAwaitingResultSignals: false
            },
            []
        );
        const labels = flattenLabels(result.hierarchicalTerms);
        expect(labels).toContain('Lyon');
        expect(labels).toContain('Europe');
        expect(labels).not.toContain('Asia');
        expect(labels).not.toContain('Thailand');
    });

    it('keeps the full-tree fallback for non-empty plain-label refiners with a retained selection', async () => {
        const container = createContainer();
        // Plain label refiner values produce no result GUIDs; the label-based selection
        // retention must not defeat the full-hierarchy fallback in the non-empty branch
        const result = await populate(
            container,
            {
                filterName: 'RefinableString10',
                values: [{ name: 'Thailand', value: 'Thailand', count: 2 }],
                isAwaitingResultSignals: false
            },
            [{ name: 'Lyon', value: 'Lyon', selected: true }]
        );
        const labels = flattenLabels(result.hierarchicalTerms);
        expect(labels).toContain('Thailand');
        expect(labels).toContain('Lyon');
        expect(labels).toEqual(['Europe', 'France', 'Lyon', 'Asia', 'Thailand']);
    });

    it('does not retain unrelated branches sharing the label of a GUID-backed selection on a settled zero-result response', async () => {
        const duplicateLyonGuid = '66666666-6666-6666-6666-666666666666';
        const hierarchyWithDuplicateLabels: ITestTerm[] = [
            term(europeGuid, 'Europe', [
                term(franceGuid, 'France', [
                    term(lyonGuid, 'Lyon', [], franceGuid)
                ], europeGuid)
            ]),
            term(asiaGuid, 'Asia', [
                term(duplicateLyonGuid, 'Lyon', [], asiaGuid)
            ])
        ];
        const container = createContainer();
        const result = await populate(
            container,
            { filterName: 'RefinableString10', values: [], isAwaitingResultSignals: false },
            [{ name: 'Lyon', value: `GP0|#${lyonGuid}`, selected: true }],
            {},
            hierarchyWithDuplicateLabels
        );
        // Only the branch of the selected GUID is retained, not the Asia branch
        // whose distinct term shares the same 'Lyon' label
        expect(flattenLabels(result.hierarchicalTerms)).toEqual(['Europe', 'France', 'Lyon']);
    });

    it('produces unambiguous label signatures for the pruning cache key', () => {
        const container = createContainer();
        const signatureOfJoinedLabel = container['getLabelSetSignature'](new Set(['a,b']));
        const signatureOfSeparateLabels = container['getLabelSetSignature'](new Set(['a', 'b']));
        expect(signatureOfJoinedLabel).not.toEqual(signatureOfSeparateLabels);
    });

    it('does not treat the plain-label companion of a three-value parent selection as a label-only selection', async () => {
        const duplicateFranceGuid = '77777777-7777-7777-7777-777777777777';
        const hierarchyWithDuplicateNames: ITestTerm[] = [
            term(europeGuid, 'Europe', [
                term(franceGuid, 'France', [
                    term(lyonGuid, 'Lyon', [], franceGuid)
                ], europeGuid)
            ]),
            term(asiaGuid, 'Asia', [
                term(duplicateFranceGuid, 'France', [], asiaGuid)
            ])
        ];
        const container = createContainer();
        // handleParentTermSelection emits GPP + GP0 tokens plus a plain-label companion value
        const result = await populate(
            container,
            { filterName: 'RefinableString10', values: [], isAwaitingResultSignals: false },
            [
                { name: 'France', value: encodeToken(`GPP|#${franceGuid}`), selected: true },
                { name: 'France', value: encodeToken(`GP0|#${franceGuid}`), selected: true },
                { name: 'France', value: 'France', selected: true }
            ],
            {},
            hierarchyWithDuplicateNames
        );
        // Only the GUID-selected France branch is retained; the companion plain-label value
        // must not retain the unrelated 'France' term under Asia
        expect(flattenLabels(result.hierarchicalTerms)).toEqual(['Europe', 'France']);
    });
});
