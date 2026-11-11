jest.mock('../../common/BaseWebPart', () => ({ BaseWebPart: class {} }));
jest.mock('../../services/dynamicDataService/DynamicDataService', () => ({}));
jest.mock('../../controls/PropertyPaneAsyncCombo/components/AsyncCombo', () => ({}));
jest.mock('../../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo', () => ({}));
jest.mock('../../layouts/AvailableLayouts', () => ({ AvailableLayouts: { BuiltinLayouts: [] } }));
jest.mock('../../layouts/AvailableTemplates', () => ({}));
jest.mock('../../helpers/LayoutHelper', () => ({}));
jest.mock('../../services/templateService/TemplateService', () => ({}));
jest.mock('../../services/taxonomyService/TaxonomyService', () => ({}));
jest.mock('../../helpers/TaxonomyHelper', () => ({}));
jest.mock('../../helpers/FilterControlHelper', () => ({}));
jest.mock('../../helpers/ExtensibilityUsageHelper', () => ({}));
jest.mock('../../helpers/ExtensibilityConfigurationHelper', () => ({}));
jest.mock('../../helpers/HandlebarsCustomizationTracker', () => ({ HandlebarsCustomizationTracker: class {} }));
jest.mock('../../dataSources/AvailableDataSources', () => ({}));
jest.mock('./components/MaxBucketsEditor', () => ({}));
jest.mock('@pnp/telemetry-js', () => ({}));
jest.mock('../../styles/Common.module.scss', () => ({}));
jest.mock('SearchFiltersWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('@microsoft/sp-core-library', () => ({}));
jest.mock('@microsoft/sp-component-base', () => ({}));
jest.mock('@microsoft/sp-property-pane', () => ({}));
jest.mock('@pnp/modern-search-extensibility', () => ({
    FilterSortType: { ByCount: 1 },
    FilterSortDirection: { Ascending: 0, Descending: 1 }
}));
jest.mock('../../helpers/DynamicPropertyHelper', () => ({
    DynamicPropertyHelper: { tryGetValueSafe: jest.fn() }
}));

import SearchFiltersWebPart from './SearchFiltersWebPart';
import { DynamicPropertyHelper } from '../../helpers/DynamicPropertyHelper';
import { FilterSortType } from '@pnp/modern-search-extensibility';
import { IDataResultSourceData } from '../../models/dynamicData/IDataResultSourceData';

class TestSearchFiltersWebPart extends SearchFiltersWebPart {
    public completions: { isLoading: boolean; version: number }[] = [];

    public renderCompleted(): void {
        this.completions.push({
            isLoading: this['captureResultsLoadingState'](),
            version: this['_resultsLoadingCompletionVersion']
        });
    }
}

describe('SearchFiltersWebPart loading notifications', () => {
    it('merges current limit signals without contaminating source snapshots across queries or vertical changes', () => {
        const part = new TestSearchFiltersWebPart();
        Object.defineProperty(part, 'properties', {
            value: { filtersConfiguration: [{ filterName: 'Title', sortBy: FilterSortType.ByCount }] }
        });
        const filter = (limited: boolean, count: number) => ({
            filterName: 'Title',
            values: count ? [{ name: 'Document', value: 'Document', count }] : [],
            returnedValueCount: limited ? 100 : count,
            configuredMaxBuckets: 100,
            isMaxBucketsExceeded: limited,
            isEditModeCapApplied: limited
        });
        const first: IDataResultSourceData = { availableFieldsFromResults: [], availablefilters: [filter(false, 2)] };
        const second: IDataResultSourceData = { availableFieldsFromResults: [], availablefilters: [filter(true, 1)] };
        const firstSnapshot = JSON.parse(JSON.stringify(first));
        const secondSnapshot = JSON.parse(JSON.stringify(second));
        const source = jest.mocked(DynamicPropertyHelper.tryGetValueSafe);
        const properties = [{} as Parameters<typeof part['mergeFiltersDataFromSources']>[0][number],
            {} as Parameters<typeof part['mergeFiltersDataFromSources']>[0][number]];
        source.mockImplementation(property => property === properties[0] ? first : second);
        const merge = () => part['mergeFiltersDataFromSources'](properties).availablefilters[0];
        expect(merge()).toMatchObject({ isMaxBucketsExceeded: true, returnedValueCount: 100, values: [{ count: 3 }] });
        expect(merge()).toMatchObject({ values: [{ count: 3 }] });
        expect(first).toEqual(firstSnapshot);
        expect(second).toEqual(secondSnapshot);

        // An inactive vertical publishes no applicable filters.
        second.availablefilters = [];
        expect(merge()).toMatchObject({ isMaxBucketsExceeded: false, returnedValueCount: 2, values: [{ count: 2 }] });
        first.availablefilters = [filter(false, 0)];
        expect(merge()).toMatchObject({ isMaxBucketsExceeded: false, returnedValueCount: 0, values: [] });
        second.availablefilters = [filter(true, 1)];
        expect(merge()).toMatchObject({ isMaxBucketsExceeded: true, returnedValueCount: 100 });
    });

    it('captures completion before pending external template renders resume', async () => {
        const part = new TestSearchFiltersWebPart();
        let isLoading = true;
        (DynamicPropertyHelper.tryGetValueSafe as jest.Mock).mockImplementation(() => ({ isLoading }));
        part['_dataSourceDynamicProperties'] = [{} as typeof part['_dataSourceDynamicProperties'][number]];

        let finishTemplate: () => void = () => undefined;
        const template = new Promise<void>(resolve => { finishTemplate = resolve; });
        const initTemplate = jest.fn(() => template);
        Object.defineProperties(part, {
            properties: { value: { selectedLayoutKey: 'Vertical' } },
            lastLayoutKey: { value: 'Vertical' },
            context: { value: { propertyPane: { isPropertyPaneOpen: () => false } } },
            isInAudience: { value: jest.fn().mockResolvedValue(true) },
            ensureExtensionsLoaded: { value: jest.fn().mockResolvedValue(undefined) },
            initTemplate: { value: initTemplate },
            _resetFiltersForChangedVertical: { value: () => false }
        });

        const firstRender = part.render();
        await Promise.resolve();
        await Promise.resolve();
        expect(initTemplate).toHaveBeenCalledTimes(1);

        isLoading = false;
        const secondRender = part.render();
        finishTemplate();
        await Promise.all([firstRender, secondRender]);

        expect(part.completions).toEqual([
            { isLoading: false, version: 1 },
            { isLoading: false, version: 1 }
        ]);
    });
});
