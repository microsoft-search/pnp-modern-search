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
    Log: { warn: jest.fn() },
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
jest.mock('./AvailableDataSources', () => ({ BuiltinDataSourceProviderKeys: {} }));
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

    it('merges language variants per term, keeps the highest count and uses the page language label', async () => {
        const dataSource = createDataSource();

        const [filter] = await dataSource._getLocalizedFilters(rawFilters(), 1033, true);

        expect(filter.values.map((v: any) => [v.name, v.count])).toEqual([['Finance', 3], ['Infrastructure', 1]]);
        expect(filter.values[0].value).toBe(`or(GP0|#${FINANCE_ID},L0|#0${FINANCE_ID})`);
        expect(dataSource._taxonomyService.getTermStoreDefaultLanguage).not.toHaveBeenCalled();
    });

    it('falls back to the term store default language when the page language has no label', async () => {
        const dataSource = createDataSource(1030);

        const [filter] = await dataSource._getLocalizedFilters(rawFilters(), 1036, true);

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
