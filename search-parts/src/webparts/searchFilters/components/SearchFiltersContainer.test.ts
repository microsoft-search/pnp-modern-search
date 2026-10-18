jest.mock('../../../controls/TemplateRenderer/TemplateRenderer', () => ({}));
jest.mock('../../../components/StyledWebPartTitle', () => ({}));
jest.mock('SearchFiltersWebPartStrings', () => ({
    PropertyPane: { LayoutPage: { ClearAllActionText: 'Clear all' } }
}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('@microsoft/sp-core-library', () => ({}));
jest.mock('../../../helpers/DataFilterHelper', () => ({}));
jest.mock('../../../helpers/TaxonomyHelper', () => ({}));
jest.mock('../../../helpers/UrlHelper', () => ({
    UrlHelper: {
        getQueryStringParam: jest.fn()
    }
}));
jest.mock('../../../layouts/AvailableTemplates', () => ({
    BuiltinFilterTemplates: {
        People: 'People'
    }
}));
jest.mock('@fluentui/react/lib/MessageBar', () => ({}));
jest.mock('../../../styles/Common.module.scss', () => ({ linkButton: 'linkButton' }));
jest.mock('@microsoft/sp-lodash-subset', () => ({
    cloneDeep: require('lodash/cloneDeep'),
    sortBy: require('lodash/sortBy'),
    isEqual: require('lodash/isEqual')
}));

import type { IDataFilter, IDataFilterConfiguration, IDataFilterInternal } from '@pnp/modern-search-extensibility';
import { UrlHelper } from '../../../helpers/UrlHelper';
import SearchFiltersContainer from './SearchFiltersContainer';

describe('SearchFiltersContainer deep-link compatibility', () => {
    const instanceId = 'filter-instance-1';

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
        document.body.innerHTML = '<div data-search-filters-instance-id="filter-instance-1"></div><div data-search-filters-instance-id="filter-instance-2"></div>';
        globalThis.history.replaceState({}, '', '/?f_filter-instance-1=scoped-value&f=legacy-value');
        (UrlHelper.getQueryStringParam as jest.Mock).mockImplementation((key: string) => key === 'f_filter-instance-1' ? 'scoped-value' : 'legacy-value');

        const queryString = (createDeepLinkContainer() as any).getFiltersDeepLinkQueryString();

        expect(queryString).toBe('scoped-value');
        expect(UrlHelper.getQueryStringParam).toHaveBeenCalledWith('f_filter-instance-1', globalThis.location.href);
        expect(UrlHelper.getQueryStringParam).not.toHaveBeenCalledWith('f', globalThis.location.href);
    });

    it('falls back to legacy f when this is the only Search Filters instance', () => {
        document.body.innerHTML = '<div data-search-filters-instance-id="filter-instance-1"></div>';
        globalThis.history.replaceState({}, '', '/?f=legacy-value');
        (UrlHelper.getQueryStringParam as jest.Mock).mockImplementation((key: string) => key === 'f' ? 'legacy-value' : null);

        const queryString = (createDeepLinkContainer() as any).getFiltersDeepLinkQueryString();

        expect(queryString).toBe('legacy-value');
    });

    it('ignores ambiguous legacy f when multiple Search Filters instances are present', () => {
        document.body.innerHTML = '<div data-search-filters-instance-id="filter-instance-1"></div><div data-search-filters-instance-id="filter-instance-2"></div>';
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
