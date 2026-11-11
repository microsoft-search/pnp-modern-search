jest.mock('../../../controls/TemplateRenderer/TemplateRenderer', () => ({}));
jest.mock('../../../components/StyledWebPartTitle', () => ({}));
jest.mock('../../../services/templateService/TemplateService', () => ({}));
jest.mock('../../../layouts/AvailableLayouts', () => ({}));
jest.mock('../../../dataSources/AvailableDataSources', () => ({}));
jest.mock('../../../styles/Common.module.scss', () => ({}));
jest.mock('./SearchResultsContainer.module.scss', () => ({}));
jest.mock('@microsoft/sp-core-library', () => ({ Log: { error: jest.fn() } }));
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('SearchResultsWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });

import SearchResultsContainer from './SearchResultsContainer';
import { ISearchResultsContainerProps } from './ISearchResultsContainerProps';
import { IDataFilterResult, IDataSourceData } from '@pnp/modern-search-extensibility';
import { CsvExportController } from '../../../helpers/CsvExportHelper';
import { Selection } from '@fluentui/react/lib/Selection';

describe('Results refiner metadata after empty responses (#5064)', () => {
    it('clears stale counts and warning flags, then uses fresh metadata on subsequent responses', async () => {
        const container: SearchResultsContainer = Object.create(SearchResultsContainer.prototype);
        const response = (count: number): IDataFilterResult & {
            returnedValueCount: number; configuredMaxBuckets: number; isMaxBucketsExceeded: boolean; isEditModeCapApplied: boolean;
        } => ({
            filterName: 'RefinableString00',
            values: [{ name: 'Title', value: 'Title', count: 1 }],
            returnedValueCount: count,
            configuredMaxBuckets: 100,
            isMaxBucketsExceeded: count >= 100,
            isEditModeCapApplied: count >= 100
        });
        const broad = response(100);
        let data: IDataSourceData = { items: [], filters: [broad] };
        const onDataRetrieved = jest.fn();
        const props = {
            dataContext: { pageNumber: 1 },
            properties: { templateSlots: [] },
            dataSource: {
                getData: jest.fn(async () => data),
                getItemsPreview: jest.fn(async value => value),
                getItemCount: jest.fn(() => data.items.length)
            },
            onDataRetrieved,
            onDataLoadingChanged: jest.fn()
        };
        Object.defineProperty(container, 'props', { value: props });
        container['_exportController'] = new CsvExportController(async () => []);
        container['_selection'] = new Selection();
        container['_lastAvailableSearchFilters'] = [];
        container.state = { data: undefined, isLoading: true, errorMessage: '', renderedOnce: false, selectedItemKeys: [] };
        container.setState = jest.fn();
        container.forceUpdate = jest.fn();
        const load = async (): Promise<IDataFilterResult[]> => {
            await container['getDataFromDataSource'](1);
            return onDataRetrieved.mock.calls[onDataRetrieved.mock.calls.length - 1][1];
        };
        expect((await load())[0]).toMatchObject({ isMaxBucketsExceeded: true, returnedValueCount: 100 });
        data = { items: [], filters: [] };
        for (let i = 0; i < 2; i++) {
            expect((await load())[0]).toMatchObject({
                filterName: 'RefinableString00', values: [], returnedValueCount: 0,
                isMaxBucketsExceeded: false, isEditModeCapApplied: false, configuredMaxBuckets: 100
            });
        }
        expect(broad).toMatchObject({ returnedValueCount: 100, isMaxBucketsExceeded: true });
        data = { items: [], filters: [response(2)] };
        expect((await load())[0]).toMatchObject({ returnedValueCount: 2, isMaxBucketsExceeded: false });
        data = { items: [], filters: [response(100)] };
        expect((await load())[0]).toMatchObject({ returnedValueCount: 100, isMaxBucketsExceeded: true });
        expect((container.props as ISearchResultsContainerProps).onDataLoadingChanged).toHaveBeenLastCalledWith(false);
    });
});
