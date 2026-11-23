jest.mock('SearchResultsWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('../../common/BaseWebPart', () => ({ BaseWebPart: class {} }));
jest.mock('../../dataSources/AvailableDataSources', () => ({}));
jest.mock('../../layouts/AvailableLayouts', () => ({}));
jest.mock('../../services/templateService/TemplateService', () => ({}));
jest.mock('../../services/tokenService/TokenService', () => ({}));
jest.mock('../../services/taxonomyService/TaxonomyService', () => ({}));
jest.mock('../../services/searchService/SharePointSearchService', () => ({}));
jest.mock('../../services/dynamicDataService/DynamicDataService', () => ({}));
jest.mock('../../helpers/LayoutHelper', () => ({}));
jest.mock('../../helpers/ExtensibilityUsageHelper', () => ({}));
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
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('@microsoft/sp-core-library', () => ({ Log: { error: jest.fn() } }));
jest.mock('@microsoft/sp-component-base', () => ({ DynamicProperty: class {} }));
jest.mock('@microsoft/sp-property-pane', () => ({}));
jest.mock('@microsoft/sp-lodash-subset', () => ({ isEqual: require('lodash/isEqual') }));

import SearchResultsWebPart from './SearchResultsWebPart';
import { ServiceScopeHelper } from '../../helpers/ServiceScopeHelper';

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
            properties: { value: { dataSourceKey: 'source', queryModifierConfiguration: configuration } },
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
