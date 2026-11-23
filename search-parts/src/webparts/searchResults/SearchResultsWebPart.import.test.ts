jest.mock('SearchResultsWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('../../common/BaseWebPart', () => ({ BaseWebPart: class {} }));
jest.mock('../../dataSources/AvailableDataSources', () => ({ AvailableDataSources: { BuiltinDataSources: [{ key: 'builtin' }] } }));
jest.mock('../../layouts/AvailableLayouts', () => ({ AvailableLayouts: { BuiltinLayouts: [{ key: 'builtin-layout', type: 'results', renderType: 'html' }] } }));
jest.mock('../../components/AvailableComponents', () => ({ AvailableComponents: { BuiltinComponents: [] } }));
jest.mock('../../services/templateService/TemplateService', () => ({}));
jest.mock('../../services/tokenService/TokenService', () => ({}));
jest.mock('../../services/taxonomyService/TaxonomyService', () => ({}));
jest.mock('../../services/searchService/SharePointSearchService', () => ({}));
jest.mock('../../services/dynamicDataService/DynamicDataService', () => ({}));
jest.mock('../../helpers/LayoutHelper', () => ({}));
jest.mock('../../helpers/ExtensibilityUsageHelper', () => ({ ExtensibilityUsageHelper: { debugLog: jest.fn() } }));
jest.mock('../../helpers/ServiceScopeHelper', () => ({ ServiceScopeHelper: { registerChildServices: jest.fn() } }));
jest.mock('../../common/Constants', () => ({}));
jest.mock('../../helpers/GraphToolKitHelper', () => ({}));
jest.mock('../../services/selectedItemsEditService/SelectedItemsEditService', () => ({}));
jest.mock('./services/TokenSetter', () => ({}));
jest.mock('../../layouts/resultTypes/default_simple_list.html', () => '');
jest.mock('../../layouts/resultTypes/default_cards.html', () => '');
jest.mock('../../layouts/resultTypes/default_custom.html', () => '');
jest.mock('../../layouts/resultTypes/default_people.html', () => '');
jest.mock('@pnp/telemetry-js', () => ({}));
jest.mock('@pnp/modern-search-extensibility', () => ({ LayoutType: { Results: 'results' } }));
jest.mock('@microsoft/sp-core-library', () => ({ Log: { error: jest.fn() } }));
jest.mock('@microsoft/sp-component-base', () => ({ DynamicProperty: class {} }));
jest.mock('@microsoft/sp-property-pane', () => ({}));
jest.mock('@microsoft/sp-lodash-subset', () => ({ isEqual: require('lodash/isEqual'), uniqBy: require('lodash/uniqBy') }));

import SearchResultsWebPart from './SearchResultsWebPart';
import { ServiceScopeHelper } from '../../helpers/ServiceScopeHelper';
import { HandlebarsCustomizationTracker } from '../../helpers/HandlebarsCustomizationTracker';

describe('SearchResultsWebPart imported query modifiers', () => {
    it('reinitializes modifiers with imported settings even when their keys are unchanged', async () => {
        const part: SearchResultsWebPart = Object.create(SearchResultsWebPart.prototype);
        const configuration = [
            { key: 'first', enabled: true, endWhenSuccessfull: true },
            { key: 'second', enabled: true, endWhenSuccessfull: false }
        ];
        const getModifier = jest.fn(async (key: string, endWhenSuccessfull: boolean) => ({
            endWhenSuccessfull,
            modifyQuery: async (query: string) => query + key
        }));
        Object.defineProperties(part, {
            properties: { value: { dataSourceKey: 'source', selectedLayoutKey: 'builtin-layout', extensibilityLibraryConfiguration: [], queryModifierConfiguration: configuration } },
            loadExtensions: { value: jest.fn().mockResolvedValue(undefined) },
            getDataSourceInstance: { value: jest.fn().mockResolvedValue({}) },
            loadComponentPropertyPaneResources: { value: jest.fn().mockResolvedValue(undefined) },
            getQueryModifierInstance: { value: getModifier },
            dataSource: { value: null, writable: true },
            lastDataSourceKey: { value: 'source', writable: true },
            lastQueryModifierKeys: { value: ['first', 'second'], writable: true },
            _selectedCustomQueryModifier: { value: [], writable: true },
            availableCustomQueryModifierDefinitions: { value: [] }
        });

        await part['onPropertiesImported']();
        expect(await part['getModifiedInputQueryText']('query-')).toBe('query-first');
        expect(part['lastQueryModifierKeys']).toEqual(['first', 'second']);

        configuration[0].endWhenSuccessfull = false;
        await part['onPropertiesImported']();
        expect(await part['getModifiedInputQueryText']('query-')).toBe('query-firstsecond');

        configuration[1].enabled = false;
        await part['onPropertiesImported']();
        expect(part['lastQueryModifierKeys']).toEqual(['first']);
        expect(await part['getModifiedInputQueryText']('query-')).toBe('query-first');
    });

    it('loads the imported libraries before resolving providers and replaces previous definitions', async () => {
        const part: SearchResultsWebPart = Object.create(SearchResultsWebPart.prototype);
        const modifierConfiguration = [{ key: 'new-modifier', enabled: true, endWhenSuccessfull: true }];
        const properties = {
            dataSourceKey: 'new-source',
            selectedLayoutKey: 'new-layout',
            layoutRenderType: 'html',
            extensibilityLibraryConfiguration: [{ id: 'new-library', enabled: true }],
            queryModifierConfiguration: modifierConfiguration,
            queryModifierProperties: { setting: 'imported' }
        };
        const helpers: { [key: string]: Function } = {};
        const partials = {};
        const handlebars = {
            helpers,
            partials,
            registerHelper: (name: string, value: Function) => { helpers[name] = value; },
            unregisterHelper: (name: string) => { delete helpers[name]; },
            registerPartial: jest.fn(),
            unregisterPartial: jest.fn()
        };
        const previousTracker = new HandlebarsCustomizationTracker();
        previousTracker.register(handlebars, () => handlebars.registerHelper('old-helper', () => 'old'));
        const library = {
            getCustomDataSources: () => [{ key: 'new-source' }],
            getCustomQueryModifiers: () => [{ key: 'new-modifier' }],
            getCustomLayouts: () => [{ key: 'new-layout', renderType: 'html' }],
            registerHandlebarsCustomizations: () => handlebars.registerHelper('new-helper', () => 'new'),
            invokeCardAction: jest.fn()
        };
        const loadLibraries = jest.fn(async (configuration: { enabled: boolean }[]) =>
            configuration.some(item => item.enabled) ? [library] : []);
        const getDataSource = jest.fn(async () => {
            expect(part['availableDataSourceDefinitions'].map(item => item.key)).toEqual(
                properties.dataSourceKey === 'new-source' ? ['builtin', 'new-source'] : ['builtin']
            );
            return {};
        });
        const getModifier = jest.fn(async (key: string, endWhenSuccessfull: boolean, definitions: { key: string }[]) => {
            expect(definitions.map(item => item.key)).toEqual(['new-modifier']);
            return { endWhenSuccessfull, modifyQuery: async (query: string) => query + key };
        });
        const templateService = { Handlebars: handlebars, AdaptiveCardsExtensibilityLibraries: [{}], registerWebComponents: jest.fn() };
        Object.defineProperties(part, {
            properties: { value: properties },
            extensibilityService: { value: { loadExtensibilityLibraries: loadLibraries } },
            templateService: { value: templateService },
            handlebarsCustomizationTracker: { value: previousTracker },
            getDataSourceInstance: { value: getDataSource },
            getQueryModifierInstance: { value: getModifier },
            loadComponentPropertyPaneResources: { value: jest.fn().mockResolvedValue(undefined) },
            tryGetInstanceId: { value: () => 'instance' },
            dataSource: { writable: true },
            lastDataSourceKey: { writable: true },
            lastLayoutKey: { value: 'new-layout', writable: true },
            lastQueryModifierKeys: { writable: true },
            _selectedCustomQueryModifier: { writable: true }
        });

        await part['onPropertiesImported']();
        expect(loadLibraries).toHaveBeenCalledWith(properties.extensibilityLibraryConfiguration);
        expect(properties.queryModifierConfiguration).toEqual(modifierConfiguration);
        expect(properties.queryModifierProperties).toEqual({ setting: 'imported' });
        expect(await part['getModifiedInputQueryText']('')).toBe('new-modifier');
        expect(part['lastLayoutKey']).toBeUndefined();
        expect(part['availableLayoutsInPropertyPane'].map(item => item.key)).toEqual(['builtin-layout', 'new-layout']);
        expect(Object.keys(helpers)).toEqual(['new-helper']);
        expect(templateService.AdaptiveCardsExtensibilityLibraries).toEqual([library]);

        await part['onPropertiesImported']();
        expect(part['availableDataSourceDefinitions'].map(item => item.key)).toEqual(['builtin', 'new-source']);
        expect(templateService.AdaptiveCardsExtensibilityLibraries).toEqual([library]);

        Object.assign(properties, {
            extensibilityLibraryConfiguration: [{ id: 'new-library', enabled: false }],
            dataSourceKey: 'builtin',
            selectedLayoutKey: 'builtin-layout',
            queryModifierConfiguration: []
        });
        await part['onPropertiesImported']();
        expect(part['availableDataSourceDefinitions'].map(item => item.key)).toEqual(['builtin']);
        expect(part['availableCustomQueryModifierDefinitions']).toEqual([]);
        expect(part['availableLayoutsInPropertyPane'].map(item => item.key)).toEqual(['builtin-layout']);
        expect(Object.keys(helpers)).toEqual([]);
        expect(templateService.AdaptiveCardsExtensibilityLibraries).toEqual([]);
    });

    it('propagates modifier initialization failures instead of leaving the import pending', async () => {
        const part: SearchResultsWebPart = Object.create(SearchResultsWebPart.prototype);
        const error = new Error('modifier initialization failed');
        const modifier = {
            getPropertyPaneGroupsConfiguration: jest.fn(),
            modifyQuery: jest.fn(),
            onPropertyUpdate: jest.fn(),
            onInit: jest.fn().mockRejectedValue(error)
        };
        const scope: ReturnType<typeof ServiceScopeHelper.registerChildServices> = Object.create(null);
        Object.defineProperties(scope, {
            whenFinished: { value: (callback: () => void) => callback() },
            consume: { value: () => modifier }
        });
        jest.mocked(ServiceScopeHelper.registerChildServices).mockReturnValue(scope);
        Object.defineProperties(part, {
            properties: { value: { queryModifierProperties: { example: true } } },
            availableCustomQueryModifierDefinitions: { value: [{ key: 'first', serviceKey: {} }] }
        });

        await expect(part['initializeQueryModifiers']([
            { key: 'first', enabled: true, endWhenSuccessfull: true, name: 'First', description: '' }
        ])).rejects.toBe(error);
        expect(modifier).toMatchObject({ properties: { example: true }, endWhenSuccessfull: true });
    });
});
