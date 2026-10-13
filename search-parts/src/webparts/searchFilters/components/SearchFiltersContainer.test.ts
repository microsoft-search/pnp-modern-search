jest.mock('../../../controls/TemplateRenderer/TemplateRenderer', () => ({}));
jest.mock('../../../components/StyledWebPartTitle', () => ({}));
jest.mock('SearchFiltersWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('@microsoft/sp-core-library', () => ({}));
jest.mock('../../../helpers/DataFilterHelper', () => ({}));
jest.mock('../../../helpers/TaxonomyHelper', () => ({}));
jest.mock('../../../helpers/UrlHelper', () => ({}));
jest.mock('../../../layouts/AvailableTemplates', () => ({}));
jest.mock('@fluentui/react/lib/MessageBar', () => ({}));
jest.mock('@microsoft/sp-lodash-subset', () => ({
    sortBy: require('lodash/sortBy')
}));

import type { IDataFilter, IDataFilterConfiguration, IDataFilterInternal } from '@pnp/modern-search-extensibility';
import SearchFiltersContainer from './SearchFiltersContainer';

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
            values: [{ name: 'Marketing', value: 'Marketing', selected, selectedOnce: true }],
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
        jest.spyOn(container, 'setState').mockImplementation(state => {
            Object.assign(container.state, state);
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

    it('does not retain a filter removed from the configuration', async () => {
        const uiFilter = createUiFilter(false);
        const container = createContainer(uiFilter, [submittedFilter]);

        await container['getFiltersToDisplay']([], [uiFilter], []);

        expect(container.state.currentUiFilters).toEqual([]);
    });
});
