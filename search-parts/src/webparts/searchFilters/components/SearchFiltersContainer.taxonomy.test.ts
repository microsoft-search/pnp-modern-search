jest.mock('../../../controls/TemplateRenderer/TemplateRenderer', () => ({}));
jest.mock('../../../components/StyledWebPartTitle', () => ({}));
jest.mock('SearchFiltersWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({ Filters: {} }), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseWebComponent: class {},
    FilterComparisonOperator: { Eq: 0 },
    FilterConditionOperator: { OR: 'or', AND: 'and' },
    FilterType: { Refiner: 'Refiner' }
}));
jest.mock('@microsoft/sp-core-library', () => ({}));
jest.mock('../../../services/tokenService/TokenService', () => ({ BuiltinTokenNames: { filters: 'filters' } }));
jest.mock('../../../helpers/UrlHelper', () => ({ UrlHelper: {} }));
jest.mock('../../../helpers/DateHelper', () => ({ DateHelper: {} }));
jest.mock('../../../layouts/AvailableTemplates', () => ({
    BuiltinFilterTemplates: { Hierarchical: 'Hierarchical' }
}));
jest.mock('../../../styles/Common.module.scss', () => ({}));
jest.mock('../../../components/filters/FilterHierarchicalComponent.module.scss', () => ({}));
jest.mock('../../../components/filters/SelectedFiltersComponent.module.scss', () => ({}));

import * as React from 'react';
import type { IDataFilter, IDataFilterInternal } from '@pnp/modern-search-extensibility';
import { FilterHierarchicalComponent } from '../../../components/filters/FilterHierarchicalComponent';
import { SelectedFiltersComponent } from '../../../components/filters/SelectedFiltersComponent';
import { DataFilterHelper } from '../../../helpers/DataFilterHelper';
import { TaxonomyHelper } from '../../../helpers/TaxonomyHelper';
import SearchFiltersContainer from './SearchFiltersContainer';

const guid = 'eaca65c4-1053-48f1-8f1b-894229befaf5';
const encodeToken = (token: string): string => `"ǂǂ${encodeURIComponent(token).replace(/%([0-9a-f]{2})|([^%])/gi,
    (_match, byte: string, character: string) => byte ? byte.toLowerCase() : character.charCodeAt(0).toString(16).padStart(2, '0'))}"`;
const exactTermToken = encodeToken(`GP0|#${guid}`);

function createContainer(): SearchFiltersContainer {
    return Object.create(SearchFiltersContainer.prototype);
}

function publishSelection(value: string, name: string = 'Child'): IDataFilter[] {
    const filter: IDataFilterInternal = {
        filterName: 'RefinableString121',
        displayName: 'Category',
        expandByDefault: false,
        showCount: true,
        sortIdx: 0,
        selectedTemplate: 'Hierarchical',
        isMulti: false,
        values: [{ name, value, selected: true, selectedOnce: true }]
    };
    return createContainer()['getSelectedFiltersFromUIFilters']([filter]);
}

describe('hierarchical leaf refinement tokens (issue #5032)', () => {
    it.each(['Verksamhetsnyhet - HR', 'Verksamhetsnyhet HR', 'Anställning och arbetsgivarfrågor', '1008604.141'])('preserves the original exact leaf token for %s through selection, publication and FQL', label => {
        const token = encodeToken(`L0|#0${guid}|${label}`);
        const onChecked = jest.fn();
        const component = new FilterHierarchicalComponent({
            filter: { filterName: 'RefinableString121', values: [{ name: label, value: token }] },
            onChecked
        });

        component['handleLeafTermSelection']({ id: guid }, label, true);
        const selected = onChecked.mock.calls[0][1];
        expect(selected.value).toBe(token);
        const filters = publishSelection(selected.value, label);
        expect(filters[0].values[0].name).toBe(label);
        expect(filters[0].values[0].value).toBe(token);
        expect(DataFilterHelper.buildFqlRefinementString(filters, undefined))
            .toEqual([`RefinableString121:${token}`]);
    });

    it('uses the hyphenated term GUID when no matching refiner exists', () => {
        const onChecked = jest.fn();
        const component = new FilterHierarchicalComponent({
            filter: { filterName: 'RefinableString121', values: [] },
            onChecked
        });
        component['handleLeafTermSelection']({ id: `/Guid(${guid})/` }, 'Child', true);
        const value = onChecked.mock.calls[0][1].value;
        expect(TaxonomyHelper.decodeHexString(value)).toBe(`GP0|#${guid}`);
        expect(DataFilterHelper.buildFqlRefinementString(publishSelection(value), undefined))
            .toEqual([`RefinableString121:${exactTermToken}`]);
    });

    it.each([
        `L0|#0${guid}|Verksamhetsnyhet HR`,
        `"L0|#0${guid}|Verksamhetsnyhet HR"`
    ])('repairs a previously decoded leaf token: %s', value => {
        expect(publishSelection(value)[0].values[0].value).toBe(exactTermToken);
    });

    it.each([
        `or(${exactTermToken},${encodeToken(`L0|#0${guid}|Verksamhetsnyhet - HR`)})`,
        `or(GP0|#${guid},L0|#0${guid})`
    ])('preserves compound refinement expressions: %s', value => {
        expect(publishSelection(value)[0].values[0].value).toBe(value);
        expect(DataFilterHelper.buildFqlRefinementString(publishSelection(value), undefined))
            .toEqual([`RefinableString121:${value}`]);
    });

    it('repairs decoded leaf members without decoding other compound tokens', () => {
        const value = `or(${exactTermToken},"L0|#0${guid}|Verksamhetsnyhet HR")`;
        expect(publishSelection(value)[0].values[0].value).toBe(`or(${exactTermToken},${exactTermToken})`);
    });

    it.each([
        `"L0|#0${guid}|Child \\"HR\\""`,
        `"L0|#0${guid}|Child \\\\ \\"HR\\""`
    ])('repairs escaped quoted labels through publication and FQL: %s', value => {
        for (const [input, expected] of [
            [value, exactTermToken],
            [`or(${exactTermToken},${value})`, `or(${exactTermToken},${exactTermToken})`]
        ]) {
            const filters = publishSelection(input);
            expect(filters[0].values[0].value).toBe(expected);
            expect(DataFilterHelper.buildFqlRefinementString(filters, undefined))
                .toEqual([`RefinableString121:${expected}`]);
        }
    });

    it.each([
        [encodeToken(`L0|#0${guid}|Verksamhetsnyhet - HR`), encodeToken(`L0|#0${guid}|Verksamhetsnyhet - HR`)],
        [`L0|#0${guid}|Verksamhetsnyhet HR`, exactTermToken],
        [`"L0|#0${guid}|Child \\"HR\\""`, exactTermToken],
        [`or(${exactTermToken},"L0|#0${guid}|Child \\\\ \\"HR\\"")`, `or(${exactTermToken},${exactTermToken})`]
    ])('restores a deep link with exact-token semantics: %s', (value, expected) => {
        const container = createContainer();
        const configuration = { filterName: 'RefinableString121', selectedTemplate: 'Hierarchical', isMulti: false };
        Object.defineProperty(container, 'props', {
            value: { filtersConfiguration: [configuration], availableFilters: [], onUpdateFilters: jest.fn() }
        });
        Object.defineProperty(container, 'state', { writable: true, value: { submittedFilters: [], currentUiFilters: [] } });
        jest.spyOn(container, 'setState').mockImplementation((update, callback) => {
            const nextState = typeof update === 'function' ? update(container.state, container.props) : update;
            Object.assign(container.state, nextState);
            callback?.();
        });
        Object.defineProperty(container, 'getFiltersToDisplay', { value: jest.fn().mockResolvedValue(undefined) });
        Object.defineProperty(container, 'getFiltersDeepLinkQueryString', {
            value: () => encodeURIComponent(JSON.stringify([
                { filterName: 'RefinableString121', values: [{ name: 'Child', value }] }
            ]))
        });
        container['getFiltersDeepLink']();
        expect(container.state.submittedFilters[0].values[0].value).toBe(expected);
        expect(container.props.onUpdateFilters).toHaveBeenCalledWith(container.state.submittedFilters);
        expect(DataFilterHelper.buildFqlRefinementString(container.state.submittedFilters, undefined))
            .toEqual([`RefinableString121:${expected}`]);
    });
});

describe('hierarchical terms with identical labels (issue #5088)', () => {
    const otherGuid = '83b928f3-b673-421c-974e-dab2b754540b';
    const firstTerm = { id: otherGuid, label: '123', children: [] };
    const targetTerm = { id: guid, label: '123', children: [] };
    const hierarchicalTerms = [
        { id: 'a', label: 'A', children: [firstTerm] },
        { id: 'b', label: 'B', children: [targetTerm] }
    ];
    const firstRefiner = { name: '123', value: encodeToken(`L0|#0${otherGuid}|123`) };
    const targetRefiner = { name: '123', value: encodeToken(`L0|#0${guid}|123`) };
    const textRefiner = { name: '123', value: '123' };
    const filterName = 'RefinableString121';

    it.each([[true, 'B:123'], [false, '123']])('renders %s with the configured summary label', (showParentInSelectionPill, expectedLabel) => {
        const filter = {
            filterName,
            displayName: 'Term Set',
            displayValue: 'Term Set',
            expandByDefault: false,
            showCount: true,
            sortIdx: 0,
            selectedTemplate: 'Hierarchical',
            isMulti: false,
            showParentInSelectionPill,
            hierarchicalTerms,
            values: [{ ...targetRefiner, selected: true, selectedOnce: true }]
        };
        const [submitted] = createContainer()['getSelectedFiltersFromUIFilters']([filter]);
        const component = new SelectedFiltersComponent({
            filters: [submitted],
            filtersConfiguration: [filter],
            dayjs: undefined
        });
        const text = (node: React.ReactNode): string => {
            if (typeof node === 'string') return node;
            if (Array.isArray(node)) return node.map(text).join('');
            return React.isValidElement(node) ? text(node.props.children) : '';
        };
        expect(text(component.render())).toContain(`[Term Set="${expectedLabel}"]`);
        expect(submitted.values[0]).toMatchObject(targetRefiner);
    });

    it('rebuilds the summary label for a deep link without changing the saved token', async () => {
        const container = createContainer();
        const values = [{ name: '123', value: exactTermToken }];
        const filters: IDataFilter[] = [{ filterName, values }];
        const onUpdateFilters = jest.fn();
        Object.defineProperty(container, 'props', {
            value: { filtersConfiguration: [{ filterName, selectedTemplate: 'Hierarchical', showParentInSelectionPill: true }], onUpdateFilters }
        });
        Object.defineProperty(container, 'state', { value: { submittedFilters: filters } });
        jest.spyOn(container, 'setState').mockImplementation(() => undefined);
        Object.defineProperty(container, 'populateHierarchicalTerms', {
            value: async (target: { hierarchicalTerms?: typeof hierarchicalTerms }) => { target.hierarchicalTerms = hierarchicalTerms; }
        });

        await container['publishHierarchicalDeepLinkLabels'](filters);

        expect(onUpdateFilters).toHaveBeenCalledWith([{ filterName, values: [{ ...values[0], displayLabel: 'B:123' }] }]);
        expect(filters[0].values[0]).not.toHaveProperty('displayLabel');
    });

    it('restores only the GUID-selected term and expands only its branch', () => {
        const component = new FilterHierarchicalComponent({
            filter: { filterName, hierarchicalTerms },
            selectedFilters: [{ filterName, values: [{ ...targetRefiner, value: exactTermToken }, textRefiner] }],
            onChecked: jest.fn()
        });

        expect(component.state.selectedTerms).toMatchObject({ [firstTerm.id]: false, [targetTerm.id]: true });
        expect(component.state.expandedTerms).toEqual({ b: true });
    });

    it.each([
        { refiners: [textRefiner, firstRefiner, targetRefiner], expectedToken: targetRefiner.value },
        { refiners: [firstRefiner, textRefiner], expectedToken: exactTermToken }
    ])('submits the clicked term GUID with or without a matching refiner bucket', ({ refiners, expectedToken }) => {
        const onChecked = jest.fn();
        const component = new FilterHierarchicalComponent({
            filter: { filterName, hierarchicalTerms, values: refiners },
            onChecked
        });

        component['handleLeafTermSelection'](targetTerm, targetTerm.label, true);

        const selected = onChecked.mock.calls[0][1];
        expect(selected.value).toBe(expectedToken);
        expect(DataFilterHelper.buildFqlRefinementString(publishSelection(selected.value, targetTerm.label), undefined))
            .toEqual([`${filterName}:${expectedToken}`]);
    });

    it('still restores and submits a plain-label refiner for an unambiguous term', () => {
        const onChecked = jest.fn();
        const component = new FilterHierarchicalComponent({
            filter: { filterName, hierarchicalTerms: [hierarchicalTerms[1]], values: [{ ...textRefiner, selected: true }] },
            onChecked
        });

        expect(component.state.selectedTerms[targetTerm.id]).toBe(true);
        component['handleLeafTermSelection'](targetTerm, targetTerm.label, true);
        expect(onChecked).toHaveBeenCalledWith(filterName, expect.objectContaining(textRefiner));
    });
});
