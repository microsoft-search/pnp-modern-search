jest.mock('../../../controls/TemplateRenderer/TemplateRenderer', () => ({}));
jest.mock('../../../components/StyledWebPartTitle', () => ({}));
jest.mock('SearchFiltersWebPartStrings', () => ({
    PropertyPane: { LayoutPage: { ClearAllActionText: 'Clear all' } }
}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({
    FilterComparisonOperator: { Eq: 'eq' },
    FilterConditionOperator: { OR: 'or' }
}));
jest.mock('@microsoft/sp-core-library', () => ({ DisplayMode: { Edit: 2, Read: 1 } }));
jest.mock('../../../helpers/DataFilterHelper', () => ({
    DataFilterHelper: { getConfigurationForFilter: jest.fn() }
}));
jest.mock('../../../helpers/TaxonomyHelper', () => ({}));
jest.mock('../../../helpers/UrlHelper', () => ({
    UrlHelper: {
        getQueryStringParam: jest.fn()
    }
}));
jest.mock('../../../layouts/AvailableTemplates', () => ({
    BuiltinFilterTemplates: {
        People: 'People',
        StaticPeople: 'StaticPeopleTemplate',
        DateRange: 'DateRangeFilterTemplate',
        Hierarchical: 'HierarchicalFilterTemplate'
    }
}));
jest.mock('@fluentui/react/lib/MessageBar', () => ({}));
jest.mock('../../../styles/Common.module.scss', () => ({ linkButton: 'linkButton' }));
jest.mock('@microsoft/sp-lodash-subset', () => ({
    cloneDeep: require('lodash/cloneDeep'),
    sortBy: require('lodash/sortBy'),
    isEqual: require('lodash/isEqual'),
    flatten: require('lodash/flatten')
}));

import type { IDataFilter, IDataFilterConfiguration, IDataFilterInternal } from '@pnp/modern-search-extensibility';
import { DataFilterHelper } from '../../../helpers/DataFilterHelper';
import { UrlHelper } from '../../../helpers/UrlHelper';
import type { IStaticPeopleFilterConfiguration, IStaticPeopleFilterEventInfo } from '../IStaticPeopleFilterConfiguration';
import SearchFiltersContainer from './SearchFiltersContainer';

describe('SearchFiltersContainer deep-link compatibility', () => {
    const instanceId = 'filter-instance-1';
    const createFilterHost = (id: string, mounted: boolean = true): string =>
        `<div data-sp-feature-tag="pnpSearchFiltersWebPart web part (PnP - Search Filters)" data-sp-feature-instance-id="${id}">${mounted ? `<div data-instance-id="${id}"></div>` : ''}</div>`;

    function createDeepLinkContainer(): SearchFiltersContainer {
        const container: SearchFiltersContainer = Object.create(SearchFiltersContainer.prototype);
        (container as any).props = { instanceId };
        (container as any).deeplinkQueryStringParam = `f_${instanceId}`;
        return container;
    }

    beforeEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('prefers the scoped parameter when it and legacy f are both present', () => {
        document.body.innerHTML = `${createFilterHost('filter-instance-1')}${createFilterHost('filter-instance-2')}`;
        globalThis.history.replaceState({}, '', '/?f_filter-instance-1=scoped-value&f=legacy-value');
        (UrlHelper.getQueryStringParam as jest.Mock).mockImplementation((key: string) => key === 'f_filter-instance-1' ? 'scoped-value' : 'legacy-value');

        const queryString = (createDeepLinkContainer() as any).getFiltersDeepLinkQueryString();

        expect(queryString).toBe('scoped-value');
        expect(UrlHelper.getQueryStringParam).toHaveBeenCalledWith('f_filter-instance-1', globalThis.location.href);
        expect(UrlHelper.getQueryStringParam).not.toHaveBeenCalledWith('f', globalThis.location.href);
    });

    it('recognizes mixed-case scoped parameter names', () => {
        document.body.innerHTML = `${createFilterHost('filter-instance-1')}${createFilterHost('filter-instance-2')}`;
        globalThis.history.replaceState({}, '', '/?F_FILTER-INSTANCE-1=scoped-value&f=legacy-value');
        (UrlHelper.getQueryStringParam as jest.Mock).mockImplementation((key: string) => key.toLowerCase() === 'f_filter-instance-1' ? 'scoped-value' : 'legacy-value');

        const queryString = (createDeepLinkContainer() as any).getFiltersDeepLinkQueryString();

        expect(queryString).toBe('scoped-value');
        expect(UrlHelper.getQueryStringParam).toHaveBeenCalledWith('F_FILTER-INSTANCE-1', globalThis.location.href);
    });

    it('does not fall back to legacy f when a mixed-case scoped parameter is empty', () => {
        document.body.innerHTML = createFilterHost('filter-instance-1');
        globalThis.history.replaceState({}, '', '/?F_FILTER-INSTANCE-1=&f=legacy-value');
        (UrlHelper.getQueryStringParam as jest.Mock).mockImplementation((key: string) => key.toLowerCase() === 'f_filter-instance-1' ? '' : 'legacy-value');

        const queryString = (createDeepLinkContainer() as any).getFiltersDeepLinkQueryString();

        expect(queryString).toBe('');
        expect(UrlHelper.getQueryStringParam).not.toHaveBeenCalledWith('f', globalThis.location.href);
    });

    it('falls back to legacy f when this is the only Search Filters instance', () => {
        document.body.innerHTML = createFilterHost('filter-instance-1');
        globalThis.history.replaceState({}, '', '/?f=legacy-value');
        (UrlHelper.getQueryStringParam as jest.Mock).mockImplementation((key: string) => key === 'f' ? 'legacy-value' : null);

        const queryString = (createDeepLinkContainer() as any).getFiltersDeepLinkQueryString();

        expect(queryString).toBe('legacy-value');
    });

    it('ignores ambiguous legacy f when multiple Search Filters instances are present', () => {
        document.body.innerHTML = `${createFilterHost('filter-instance-1')}${createFilterHost('filter-instance-2', false)}`;
        globalThis.history.replaceState({}, '', '/?f=legacy-value');
        (UrlHelper.getQueryStringParam as jest.Mock).mockImplementation((key: string) => key === 'f' ? 'legacy-value' : null);
        const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const container = createDeepLinkContainer() as any;
        const queryString = container.getFiltersDeepLinkQueryString();
        container.getFiltersDeepLinkQueryString();

        expect(queryString).toBeNull();
        expect(warning).toHaveBeenCalledTimes(1);
        expect(warning).toHaveBeenCalledWith(expect.stringContaining('Use \'f_<instanceId>\' to target a specific web part.'));
    });

    it('preserves spaces and plus signs in scoped URL values when removing legacy f', () => {
        document.body.innerHTML = createFilterHost('filter-instance-1');
        const container = createDeepLinkContainer() as any;
        const url = 'https://example.test/page.aspx?f=legacy&f_filter-instance-1=North%20America%2BGroup#section';

        expect(container.removeLegacyFiltersDeepLink(url))
            .toBe('https://example.test/page.aspx?f_filter-instance-1=North%20America%2BGroup#section');
    });

    it('removes uppercase legacy F when clearing filters', () => {
        document.body.innerHTML = createFilterHost('filter-instance-1');
        const container = createDeepLinkContainer() as any;
        const url = 'https://example.test/page.aspx?F=legacy&f_filter-instance-1=North%20America%2BGroup#section';

        expect(container.removeLegacyFiltersDeepLink(url))
            .toBe('https://example.test/page.aspx?f_filter-instance-1=North%20America%2BGroup#section');
    });
});

describe('SearchFiltersContainer.getFiltersToDisplay', () => {
    const configuration: IDataFilterConfiguration = {
        filterName: 'Category',
        selectedTemplate: 'Checkbox',
        displayValue: 'Category',
        showCount: true,
        operator: 'or' as IDataFilterConfiguration['operator'],
        isMulti: true,
        sortBy: 'ByName' as IDataFilterConfiguration['sortBy'],
        sortDirection: 'Ascending' as IDataFilterConfiguration['sortDirection'],
        sortIdx: 0,
        maxBuckets: 10,
        rangeDefinition: 0
    };

    function createUiFilter(selected: boolean): IDataFilterInternal {
        return {
            filterName: 'Category',
            displayName: 'Category',
            selectedTemplate: 'Checkbox',
            values: [{ name: 'Marketing', value: 'Marketing', selected, selectedOnce: true, count: 0 }],
            expandByDefault: true,
            showCount: true,
            isMulti: true,
            sortIdx: 0,
            hasSelectedValues: selected,
            canApply: !selected,
            canClear: true
        };
    }

    function createContainer(uiFilter: IDataFilterInternal, submittedFilters: IDataFilter[]): SearchFiltersContainer {
        const container: SearchFiltersContainer = Object.create(SearchFiltersContainer.prototype);
        container.state = { currentUiFilters: [uiFilter], submittedFilters };
        jest.spyOn(container, 'setState').mockImplementation((state, callback) => {
            const nextState = typeof state === 'function' ? state(container.state, (container as any).props) : state;
            Object.assign(container.state, nextState);
            callback?.();
        });

        return container;
    }

    const submittedFilter: IDataFilter = {
        filterName: 'Category',
        values: [{ name: 'Marketing', value: 'Marketing' }]
    };

    it('retains a pending last-value removal when the refiner is missing but still committed', async () => {
        const uiFilter = createUiFilter(false);
        const container = createContainer(uiFilter, [submittedFilter]);

        await container['getFiltersToDisplay']([], [uiFilter], [configuration]);

        expect(container.state.currentUiFilters).toEqual([uiFilter]);
        expect(container.state.currentUiFilters[0].values[0].selected).toBe(false);
        expect(container.state.currentUiFilters[0].canApply).toBe(true);
        expect(container.state.submittedFilters).toEqual([submittedFilter]);
    });

    it('retains selected UI values even before they have been submitted', async () => {
        const uiFilter = createUiFilter(true);
        const container = createContainer(uiFilter, []);

        await container['getFiltersToDisplay']([], [uiFilter], [configuration]);

        expect(container.state.currentUiFilters).toEqual([uiFilter]);
    });

    it('drops the missing refiner after the pending removal has been applied', async () => {
        const uiFilter = createUiFilter(false);
        const container = createContainer(uiFilter, [{ ...submittedFilter, values: [] }]);

        await container['getFiltersToDisplay']([], [uiFilter], [configuration]);

        expect(container.state.currentUiFilters).toEqual([]);
    });

    it.each([true, false])('resets retained bucket counts without mutating selections (selected: %s)', async selected => {
        const uiFilter = createUiFilter(selected);
        uiFilter.values[0].count = 12;
        const container = createContainer(uiFilter, [submittedFilter]);

        await container['getFiltersToDisplay']([], [uiFilter], [configuration]);

        const retainedFilter = container.state.currentUiFilters[0];
        expect(retainedFilter).not.toBe(uiFilter);
        expect(retainedFilter.values[0]).not.toBe(uiFilter.values[0]);
        expect(retainedFilter.values[0].count).toBe(0);
        expect(retainedFilter.values[0].selected).toBe(selected);
        expect(retainedFilter.canApply).toBe(uiFilter.canApply);
        expect(uiFilter.values[0].count).toBe(12);
        expect(container.state.submittedFilters).toEqual([submittedFilter]);
    });

    it('does not retain a filter removed from the configuration', async () => {
        const uiFilter = createUiFilter(false);
        const container = createContainer(uiFilter, [submittedFilter]);

        await container['getFiltersToDisplay']([], [uiFilter], []);

        expect(container.state.currentUiFilters).toEqual([]);
    });

    it('renders the global clear action when enabled and disables it when no filters are applied', () => {
        const container = createContainer(createUiFilter(true), [submittedFilter]);
        (container as any).props = { properties: { showClearAllFilters: false } };

        expect(container['getClearAllFiltersAction']()).toBeNull();

        (container as any).props.properties.showClearAllFilters = true;
        const action = container['getClearAllFiltersAction']();

        expect(action).not.toBeNull();
        expect(action?.props.children).toBe('Clear all');
        expect(action?.props.disabled).toBe(false);

        Object.assign(container.state, { submittedFilters: [] });
        const disabledAction = container['getClearAllFiltersAction']();
        expect(disabledAction).not.toBeNull();
        expect(disabledAction?.props.disabled).toBe(true);
    });

    it('does not reset active filters when showClearAllFilters toggle changes in properties', () => {
        const uiFilter = createUiFilter(true);
        const container = createContainer(uiFilter, [submittedFilter]);
        const onUpdateFilters = jest.fn();
        (container as any).props = {
            properties: { showClearAllFilters: true },
            selectedLayoutKey: 'Vertical',
            availableFilters: [],
            filtersConfiguration: [configuration],
            onUpdateFilters
        };
        const prevProps = {
            properties: { showClearAllFilters: false },
            selectedLayoutKey: 'Vertical',
            availableFilters: [],
            filtersConfiguration: [configuration],
            onUpdateFilters
        };
        const prevState = { ...container.state };

        container.componentDidUpdate(prevProps as any, prevState as any);

        expect(onUpdateFilters).not.toHaveBeenCalled();
        expect(container.state.currentUiFilters).toEqual([uiFilter]);
        expect(container.state.submittedFilters).toEqual([submittedFilter]);
    });

    it('clears all applied refiners and invalidates a queued filter update', () => {
        const container = createContainer(createUiFilter(true), [submittedFilter]);
        const otherUiFilter = {
            ...createUiFilter(true),
            filterName: 'Owner',
            values: [{ name: 'Adele', value: 'Adele', selected: true, selectedOnce: true, count: 0 }]
        } as IDataFilterInternal;
        const otherSubmittedFilter: IDataFilter = {
            filterName: 'Owner',
            values: [{ name: 'Adele', value: 'Adele' }]
        };
        container.state.currentUiFilters.push(otherUiFilter);
        container.state.submittedFilters.push(otherSubmittedFilter);

        const onUpdateFilters = jest.fn();
        (container as any).props = {
            properties: { showClearAllFilters: true },
            availableFilters: [],
            filtersConfiguration: [configuration],
            onUpdateFilters
        };
        (container as any)._filterUpdateVersion = 4;
        (container as any)._latestDeferredSubmittedFilters = [submittedFilter];
        (container as any)._deferredSubmittedUpdateTimer = setTimeout(() => undefined, 10000);

        jest.spyOn(container as any, 'beginResultsUpdate').mockImplementation((...args: unknown[]) => {
            const onReady = args[1] as (() => void) | undefined;
            onReady?.();
        });
        jest.spyOn(container as any, 'getFiltersToDisplay').mockResolvedValue(undefined);
        jest.spyOn(container as any, 'resetFiltersDeepLink').mockImplementation(() => undefined);

        container['clearAllFilters']();

        expect(container.state.submittedFilters).toEqual([]);
        expect(container.state.currentUiFilters.every(filter => filter.values.length === 0)).toBe(true);
        expect(onUpdateFilters).toHaveBeenCalledWith([]);
        expect(container['resetFiltersDeepLink']).toHaveBeenCalled();
        expect(container['getFiltersToDisplay']).toHaveBeenCalledWith([], container.state.currentUiFilters, [configuration]);
        expect((container as any)._filterUpdateVersion).toBe(5);
        expect((container as any)._latestDeferredSubmittedFilters).toBeNull();
        expect((container as any)._deferredSubmittedUpdateTimer).toBeNull();
    });
});

describe('SearchFiltersContainer static People domain restrictions', () => {
    const configuration: IStaticPeopleFilterConfiguration = {
        filterName: 'Owner',
        displayValue: 'Owner',
        selectedTemplate: 'StaticPeopleTemplate',
        allowedEmailDomains: 'contoso.com',
        isMulti: true,
        showCount: false,
        operator: 'or' as IDataFilterConfiguration['operator'],
        sortBy: 'ByName' as IDataFilterConfiguration['sortBy'],
        sortDirection: 'Ascending' as IDataFilterConfiguration['sortDirection'],
        sortIdx: 0,
        maxBuckets: 10,
        rangeDefinition: 0
    };

    function createContainer(uiFilters: IDataFilterInternal[] = [], submittedFilters: IDataFilter[] = []): SearchFiltersContainer {
        const container: SearchFiltersContainer = Object.create(SearchFiltersContainer.prototype);
        container.state = { currentUiFilters: uiFilters, submittedFilters };
        (container as any).props = {
            filtersConfiguration: [configuration],
            availableFilters: [],
            webPartTitleProps: { displayMode: 1 },
            onUpdateFilters: jest.fn()
        };
        (container as any).areFilterValuesEquivalent = (left: string, right: string) => left === right;
        jest.spyOn(container, 'setState').mockImplementation((state, callback) => {
            const nextState = typeof state === 'function' ? state(container.state, (container as any).props) : state;
            if (nextState) {
                Object.assign(container.state, nextState);
            }
            callback?.();
        });
        jest.spyOn(container as any, 'queueDeferredSubmittedFiltersUpdate').mockImplementation(() => undefined);
        jest.spyOn(container as any, 'endResultsUpdate').mockImplementation(() => undefined);
        jest.spyOn(container as any, 'resolveFilterDisplayName').mockImplementation((...args: unknown[]) => String(args[0] || args[1]));
        return container;
    }

    function peopleUiFilter(values: Array<{ name: string; value: string; selected: boolean }>): IDataFilterInternal & { allowedEmailDomains: string; domainSelectionRemoved?: boolean } {
        return {
            filterName: 'Owner',
            displayName: 'Owner',
            selectedTemplate: 'StaticPeopleTemplate',
            values: values.map(value => ({ ...value, selectedOnce: true })),
            isMulti: true,
            expandByDefault: false,
            showCount: false,
            sortIdx: 0,
            allowedEmailDomains: 'contoso.com'
        };
    }

    it('passes the setting to the template for displayed and newly created filters', () => {
        const container = createContainer();
        const available = { filterName: 'Owner', values: [] };
        const display = container['buildFilterResultInternal'](
            available,
            configuration,
            [],
            [],
            -1,
            available,
            { selectedOnce: false, hasSelectedValues: false, canApply: false, canClear: false }
        );
        const created = container['createNewUiFilter']({
            filterName: 'Owner',
            instanceId: 'test-instance',
            filterValues: [{ name: 'Alice', value: 'alice@contoso.com', selected: true }]
        }, configuration);

        expect(display.allowedEmailDomains).toBe('contoso.com');
        expect(created.allowedEmailDomains).toBe('contoso.com');
    });

    it('strips the allowlist and warning from submitted filters while preserving display-name queries', () => {
        const filter = peopleUiFilter([{ name: 'Alice', value: 'alice@contoso.com', selected: true }]);
        filter.domainSelectionRemoved = true;
        const container = createContainer([filter]);
        const submitted = container['getSelectedFiltersFromUIFilters']([filter]);

        expect(submitted).toHaveLength(1);
        expect(submitted[0].values[0]).toEqual({ name: 'Alice', value: 'Alice', operator: 'eq' });
        expect(submitted[0]).not.toHaveProperty('allowedEmailDomains');
        expect(submitted[0]).not.toHaveProperty('domainSelectionRemoved');
    });

    it('restores the configured allowlist on a deep-linked filter', () => {
        const container = createContainer();
        const filters: IDataFilter[] = [{ filterName: 'Owner', values: [{ name: 'Alex Smith', value: 'Alex Smith' }] }];
        (DataFilterHelper.getConfigurationForFilter as jest.Mock).mockReturnValue(configuration);
        jest.spyOn(container as any, 'getFiltersDeepLinkQueryString').mockReturnValue(encodeURIComponent(JSON.stringify(filters)));
        jest.spyOn(container as any, 'sanitizeTaxonomyRefinementValue').mockImplementation((...args: unknown[]) => String(args[0]));
        jest.spyOn(container as any, 'getFiltersToDisplay').mockResolvedValue(undefined);

        container['getFiltersDeepLink']();

        expect(container.state.currentUiFilters[0]).toMatchObject({
            allowedEmailDomains: 'contoso.com',
            values: [{ name: 'Alex Smith', value: 'Alex Smith', selected: true }]
        });
        expect(container.state.submittedFilters).toMatchObject(filters);
        expect(container.state.submittedFilters[0]).not.toHaveProperty('allowedEmailDomains');
    });

    it('removes only disallowed submitted values without applying pending changes', () => {
        const owner = peopleUiFilter([
            { name: 'Alice', value: 'alice@contoso.com', selected: true },
            { name: 'Bob', value: 'bob@fabrikam.com', selected: true },
            { name: 'Charlie', value: 'charlie@contoso.com', selected: true }
        ]);
        const other = {
            filterName: 'Category',
            selectedTemplate: 'Checkbox',
            values: [{ name: 'Pending', value: 'Pending', selected: true }],
            isMulti: true,
            sortIdx: 1
        } as IDataFilterInternal;
        const submitted = [
            { filterName: 'Owner', values: [{ name: 'Alice', value: 'Alice' }, { name: 'Bob', value: 'Bob' }] },
            { filterName: 'Category', values: [{ name: 'Applied', value: 'Applied' }] }
        ];
        const container = createContainer([owner, other], submitted);
        const event: IStaticPeopleFilterEventInfo = {
            filterName: 'Owner',
            instanceId: 'test-instance',
            reconcileAllowedEmailDomains: true,
            filterValues: [{ name: 'Bob', value: 'bob@fabrikam.com', selected: false }]
        };

        container['processFilterValuesUpdated'](event, configuration);

        expect(container.state.currentUiFilters[0].values.map(value => value.selected)).toEqual([true, true, false]);
        expect(container.state.currentUiFilters[0].canApply).toBe(true);
        expect(container.state.currentUiFilters[1].values[0].value).toBe('Pending');
        expect(container.state.submittedFilters).toEqual([
            { filterName: 'Owner', values: [{ name: 'Alice', value: 'Alice' }] },
            { filterName: 'Category', values: [{ name: 'Applied', value: 'Applied' }] }
        ]);
        expect(container['queueDeferredSubmittedFiltersUpdate']).toHaveBeenCalledWith(container.state.submittedFilters, 'Owner');
    });

    it('preserves an ambiguous submitted display name shared with a retained person', () => {
        const owner = peopleUiFilter([
            { name: 'Alex Smith', value: 'alex@contoso.com', selected: true },
            { name: 'Alex Smith', value: 'alex@fabrikam.com', selected: true }
        ]);
        const submitted = [{ filterName: 'Owner', values: [{ name: 'Alex Smith', value: 'Alex Smith' }] }];
        const container = createContainer([owner], submitted);

        container['reconcilePeopleDomainSelections']({
            filterName: 'Owner',
            instanceId: 'test-instance',
            filterValues: [{ name: 'Alex Smith', value: 'alex@fabrikam.com', selected: false }]
        }, configuration);

        expect(container.state.submittedFilters).toEqual(submitted);
        expect(container['queueDeferredSubmittedFiltersUpdate']).not.toHaveBeenCalled();
        expect(container['endResultsUpdate']).toHaveBeenCalled();
    });

    it('ignores a stale reconciliation if the domain has since been allowed', () => {
        const owner = peopleUiFilter([{ name: 'Bob', value: 'bob@fabrikam.com', selected: true }]);
        const container = createContainer([owner]);
        container['reconcilePeopleDomainSelections']({
            filterName: 'Owner',
            instanceId: 'test-instance',
            filterValues: [{ name: 'Bob', value: 'bob@fabrikam.com', selected: false }]
        }, { ...configuration, allowedEmailDomains: 'contoso.com; fabrikam.com' } as IStaticPeopleFilterConfiguration);

        expect(container.state.currentUiFilters[0].values[0].selected).toBe(true);
        expect(container['queueDeferredSubmittedFiltersUpdate']).not.toHaveBeenCalled();
    });

    it('clears the domain warning along with selections', () => {
        const owner = peopleUiFilter([{ name: 'Alice', value: 'alice@contoso.com', selected: true }]);
        owner.domainSelectionRemoved = true;
        const container = createContainer([owner]);
        const cleared = container['resetSelectedFilterValues']([owner]);

        expect(cleared[0].values).toEqual([]);
        expect(cleared[0]).toHaveProperty('domainSelectionRemoved', false);
    });
});
