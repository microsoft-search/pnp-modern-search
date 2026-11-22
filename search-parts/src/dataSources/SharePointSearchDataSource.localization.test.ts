jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseDataSource: class { },
    BuiltinTemplateSlots: {},
    FilterBehavior: {},
    FilterSortType: {},
    FilterSortDirection: {},
    FilterType: {},
    PagingBehavior: {},
    SortFieldDirection: {}
}));
jest.mock('@microsoft/sp-property-pane', () => ({}));
jest.mock('CommonStrings', () => ({
    General: {},
    DataSources: { SharePointSearch: { TermNotFound: 'Term not found {0}' } }
}), { virtual: true });
jest.mock('@microsoft/sp-core-library', () => ({
    Text: { format: (s: string, ...args: string[]) => args.reduce((acc, arg, i) => acc.replace(`{${i}}`, arg), s) },
    Log: { warn: jest.fn(), error: jest.fn() },
    Guid: {},
    ServiceScope: {}
}));
jest.mock('@microsoft/sp-page-context', () => ({}));
jest.mock('@fluentui/react', () => ({}));
jest.mock('@pnp/common/storage', () => ({ PnPClientStorage: class { } }));
jest.mock('../helpers/DataSourceHelper', () => ({}));
jest.mock('../services/searchService/SharePointSearchService', () => ({}));
jest.mock('../helpers/LocalizationHelper', () => ({}));
jest.mock('../services/tokenService/TokenService', () => ({}));
jest.mock('../services/taxonomyService/TaxonomyService', () => ({}));
jest.mock('../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo', () => ({}));
jest.mock('../controls/PropertyPaneAsyncCombo/components/AsyncCombo', () => ({}));
jest.mock('../helpers/DateHelper', () => ({}));
jest.mock('../controls/PropertyPaneNonReactiveTextField/PropertyPaneNonReactiveTextField', () => ({}));
jest.mock('../helpers/DataFilterHelper', () => ({}));
jest.mock('../helpers/EnumHelper', () => ({}));
jest.mock('./AvailableDataSources', () => ({ BuiltinDataSourceProviderKeys: {}, DEFAULT_SHAREPOINT_SEARCH_MAX_BUCKETS: 100 }));
jest.mock('../common/Constants', () => ({ AutoCalculatedDataSourceFields: {}, SortableFields: {} }));
jest.mock('../helpers/ObjectHelper', () => ({}));
jest.mock('../layouts/AvailableTemplates', () => ({ BuiltinFilterTemplates: {} }));
jest.mock('../styles/Common.module.scss', () => ({}));
jest.mock('@microsoft/sp-lodash-subset', () => ({
    sortBy: require('lodash/sortBy'),
    isEmpty: require('lodash/isEmpty'),
    uniq: require('lodash/uniq'),
    cloneDeep: require('lodash/cloneDeep')
}));

import { SharePointSearchDataSource } from './SharePointSearchDataSource';

describe('SharePointSearchDataSource sort suggestions', () => {
    function createDataSource(getAvailableManagedProperties: jest.Mock, validateSortableProperty: jest.Mock): SharePointSearchDataSource {
        const source: SharePointSearchDataSource = Object.create(SharePointSearchDataSource.prototype);
        Object.defineProperties(source, {
            properties: { value: {
                sortList: [{ sortField: 'CustomAlias' }, { sortField: '{QueryString.sort}' }],
                selectedProperties: ['Title', 'TITLE', 'NotSortable', 'CheckFailed']
            } },
            _sortableFields: { value: [{ key: 'Created', text: 'Created' }] },
            _sharePointSearchService: { value: { getAvailableManagedProperties, validateSortableProperty } }
        });
        return source;
    }

    it.each(['verified', 'notSortable', 'failed', 'unknown'])('preserves a saved row casing and its %s status without duplicating the field', status => {
        const source = createDataSource(jest.fn(), jest.fn());
        const shared = [{ key: 'Title', text: 'Title', data: status }, { key: 'Created', text: 'Created' }];
        const firstRow = source['getSortOptionsForRow'](shared, 'Title');
        const secondRow = source['getSortOptionsForRow'](shared, 'TITLE');
        expect(firstRow[0]).toEqual({ key: 'Title', text: 'Title', data: status });
        expect(secondRow[0]).toEqual({ key: 'TITLE', text: 'TITLE', data: status });
        expect(secondRow.filter(option => String(option.key).toLowerCase() === 'title')).toHaveLength(1);
        expect(shared[0].key).toBe('Title');
        expect(secondRow[1]).toEqual(shared[1]);
    });

    it('merges suggestions, preserves aliases and tokens, and isolates failed sort checks', async () => {
        const validate = jest.fn().mockImplementation(async (field: string) => {
            if (field === 'NotSortable') {
                return false;
            }
            if (field === 'CheckFailed') {
                throw new Error('HTTP 400');
            }
            return true;
        });
        const source = createDataSource(jest.fn().mockResolvedValue([
            { name: 'RefinableString199' }, { name: 'title' }
        ]), validate);
        const options = await source['getCheckedSortFields']();
        expect(options.map(option => [option.key, option.data])).toEqual([
            ['CustomAlias', 'verified'],
            ['{QueryString.sort}', 'unknown'],
            ['Title', 'verified'],
            ['NotSortable', 'notSortable'],
            ['CheckFailed', 'failed'],
            ['RefinableString199', 'verified'],
            ['Created', 'verified']
        ]);
        expect(validate).toHaveBeenCalledTimes(6);
        expect(validate).not.toHaveBeenCalledWith('{QueryString.sort}');
    });

    it('limits checks to 100 fields and four concurrent requests, keeping the remaining suggestions', async () => {
        let active = 0;
        let peak = 0;
        const validate = jest.fn().mockImplementation(async () => {
            active++;
            peak = Math.max(peak, active);
            await Promise.resolve();
            active--;
            return true;
        });
        const source = createDataSource(jest.fn().mockResolvedValue(
            Array.from({ length: 110 }, (_, index) => ({ name: `Field${index}` }))
        ), validate);
        const options = await source['getCheckedSortFields']();
        expect(validate).toHaveBeenCalledTimes(100);
        expect(peak).toBe(4);
        expect(options.find(option => option.key === 'Field109').data).toBe('unknown');
    });

    it('retains configured and built-in suggestions when discovery fails', async () => {
        const source = createDataSource(jest.fn().mockRejectedValue(new Error('HTTP 403')),
            jest.fn().mockResolvedValue(true));
        const options = await source['getCheckedSortFields']();
        expect(options.map(option => option.key)).toEqual([
            'CustomAlias', '{QueryString.sort}', 'Title', 'NotSortable', 'CheckFailed', 'Created'
        ]);
    });
});

const FINANCE_ID = '8ead6aea-9b46-4831-9b06-1c4d8410f672';
const INFRA_ID = '8a7d788f-96d7-4b84-a005-0377dce115e1';

const term = (id: string, labels: { Language: number; Value: string; IsDefaultForLanguage?: boolean }[]) => ({
    Id: `/Guid(${id})/`,
    Labels: { _Child_Items_: labels.map(label => ({ IsDefaultForLanguage: true, ...label })) }
});

describe('SharePointSearchDataSource taxonomy refiner labels', () => {
    beforeAll(() => {
        // jsdom does not expose TextEncoder, which is used to build the FQL filter values
        (globalThis as any).TextEncoder = (globalThis as any).TextEncoder || require('util').TextEncoder;
    });

    const terms = [
        term(FINANCE_ID, [{ Language: 1030, Value: 'Økonomi' }, { Language: 1033, Value: 'Finance' }]),
        term(INFRA_ID, [{ Language: 1030, Value: 'Infrastruktur' }, { Language: 1033, Value: 'Infrastructure' }])
    ];

    function createDataSource(termStoreDefaultLanguage = 1030) {
        const dataSource: any = Object.create(SharePointSearchDataSource.prototype);
        dataSource._pageContext = { site: { absoluteUrl: 'https://contoso.sharepoint.com/sites/hq' } };
        dataSource._taxonomyService = {
            getTermsById: jest.fn().mockResolvedValue(terms),
            getTermStoreDefaultLanguage: jest.fn().mockResolvedValue(termStoreDefaultLanguage)
        };
        return dataSource;
    }

    const rawFilters = () => [{
        filterName: 'RefinableString105',
        values: [
            { name: `GTSet|#2644c876-0cf6-4eae-ab88-8389afff4f01`, value: 'GTSet', count: 4 },
            { name: `L0|#0${FINANCE_ID}|Økonomi`, value: 'b', count: 1 },
            { name: `L0|#0${FINANCE_ID}|Finance`, value: 'a', count: 3 },
            { name: `L0|#0${INFRA_ID}|Infrastruktur`, value: 'c', count: 1 },
            { name: `L0|#0${INFRA_ID}|Infrastructure`, value: 'd', count: 1 }
        ]
    }];

    it('merges language variants per term, keeps the highest count and uses the term store default language label when localization is off', async () => {
        const dataSource = createDataSource(1030);

        const [filter] = await dataSource._getLocalizedFilters(rawFilters(), undefined, true);

        expect(filter.values.map((v: any) => [v.name, v.count])).toEqual([['Økonomi', 3], ['Infrastruktur', 1]]);
        expect(filter.values[0].value).toBe(`or(GP0|#${FINANCE_ID},L0|#0${FINANCE_ID})`);
    });

    it('ignores the page language when localization is off', async () => {
        const dataSource = createDataSource(1030);

        const [filter] = await dataSource._getLocalizedFilters(rawFilters(), 1033, true);

        expect(filter.values.map((v: any) => v.name)).toEqual(['Økonomi', 'Infrastruktur']);
        expect(dataSource._taxonomyService.getTermStoreDefaultLanguage).toHaveBeenCalled();
    });

    it('uses the first label when localization is off and the term store default language cannot be retrieved', async () => {
        const dataSource = createDataSource();
        dataSource._taxonomyService.getTermStoreDefaultLanguage = jest.fn().mockRejectedValue(new Error('boom'));

        const [filter] = await dataSource._getLocalizedFilters(rawFilters(), undefined, true);

        expect(filter.values.map((v: any) => v.name)).toEqual(['Økonomi', 'Infrastruktur']);
    });

    it('uses the page language label when localization is on', async () => {
        const dataSource = createDataSource(1030);

        const [filter] = await dataSource._getLocalizedFilters(rawFilters(), 1033);

        expect(filter.values.map((v: any) => v.name)).toEqual(['Finance', 'Infrastructure']);
        expect(dataSource._taxonomyService.getTermStoreDefaultLanguage).not.toHaveBeenCalled();
    });

    it('falls back to the term store default language when localization is on and the page language has no label', async () => {
        const dataSource = createDataSource(1030);

        const [filter] = await dataSource._getLocalizedFilters(rawFilters(), 1036);

        expect(filter.values.map((v: any) => v.name)).toEqual(['Økonomi', 'Infrastruktur']);
    });

    it('does not drop non-taxonomy values whose label contains GPP or GTSet', async () => {
        const dataSource = createDataSource();
        const filters = [
            ...rawFilters(),
            { filterName: 'RefinableString01', values: [{ name: 'GPP Program', value: 'GPP Program', count: 2 }, { name: 'GTSet review', value: 'GTSet review', count: 1 }] }
        ];

        const result = await dataSource._getLocalizedFilters(filters, 1033, true);

        expect(result[1].values.map((v: any) => v.name)).toEqual(['GPP Program', 'GTSet review']);
    });
});
