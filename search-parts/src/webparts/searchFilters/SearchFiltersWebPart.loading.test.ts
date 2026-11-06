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
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('../../helpers/DynamicPropertyHelper', () => ({
    DynamicPropertyHelper: { tryGetValueSafe: jest.fn() }
}));

import SearchFiltersWebPart from './SearchFiltersWebPart';
import { DynamicPropertyHelper } from '../../helpers/DynamicPropertyHelper';

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
