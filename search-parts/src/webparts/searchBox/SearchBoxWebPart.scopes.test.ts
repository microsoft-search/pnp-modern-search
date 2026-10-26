jest.mock('../../common/BaseWebPart', () => ({ BaseWebPart: class {} }));
jest.mock('../../services/tokenService/TokenService', () => ({ BuiltinTokenNames: { inputQueryText: 'inputQueryText' } }));
jest.mock('../../services/dynamicDataService/DynamicDataService', () => ({ DynamicDataService: {} }));
jest.mock('../../providers/AvailableSuggestionProviders', () => ({ AvailableSuggestionProviders: { BuiltinSuggestionProviders: [] } }));
jest.mock('../../helpers/ServiceScopeHelper', () => ({ ServiceScopeHelper: {} }));
jest.mock('@pnp/telemetry-js', () => ({}));
jest.mock('../../styles/Common.module.scss', () => ({}));
jest.mock('SearchBoxWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({
    AdvancedSearch: { InvalidConfiguration: 'Invalid settings', InvalidScope: 'Invalid scope' },
    General: { Extensibility: { DefaultExtensibilityLibraryName: 'Library' } }
}), { virtual: true });
jest.mock('@microsoft/sp-component-base', () => ({ DynamicProperty: class {} }));
jest.mock('@microsoft/sp-core-library', () => ({ Log: { warn: jest.fn() } }));
jest.mock('@microsoft/sp-property-pane', () => ({}));
jest.mock('@pnp/modern-search-extensibility', () => ({}));

import SearchBoxWebPart from './SearchBoxWebPart';
import { ComponentType } from '../../common/ComponentType';

class TestSearchBoxWebPart extends SearchBoxWebPart {
    public renderCompleted(): void {
        this['syncAdvancedSearchFromUrl']();
    }
}

describe('Search Box scoped query publication', () => {
    const notify = jest.fn();
    const create = (advancedSearch = true) => {
        const part = new TestSearchBoxWebPart();
        Object.defineProperties(part, {
            properties: {
                value: {
                    advancedSearch,
                    queryStringParameter: 'q', scopeQueryStringParameter: 'scope',
                    searchScopes: [{ key: 'caseId', label: 'CaseId', managedProperty: 'zfm_CaseNumber' }]
                }
            },
            context: { value: { dynamicDataSourceManager: { notifyPropertyChanged: notify, notifySourceChanged: jest.fn() } } }
        });
        return part;
    };
    beforeEach(() => {
        notify.mockClear();
        window.history.replaceState({}, '', '/?keep=yes');
    });

    it('defaults Advanced Search box to Off', () => {
        const part = create(undefined);
        delete part['properties'].advancedSearch;
        part['initializeProperties']();
        expect(part['properties'].advancedSearch).toBe(false);
    });

    it('publishes scoped query text while retaining the raw display value', () => {
        const part = create();
        window.history.replaceState({}, '', '/?q=23432432&scope=caseId');
        part['syncAdvancedSearchFromUrl']();
        expect(part.getPropertyValue(ComponentType.SearchBox)).toBe('zfm_CaseNumber:"23432432"');
        expect(part['_searchQueryText']).toBe('23432432');
        expect(notify).toHaveBeenCalledWith(ComponentType.SearchBox);
    });

    it('resynchronizes scope and query when handling browser history navigation', () => {
        const part = create();
        const render = jest.spyOn(part, 'renderCompleted');
        window.history.replaceState({}, '', '/?q=234&scope=caseId');
        part['syncAdvancedSearchFromUrl']();
        window.history.replaceState({}, '', '/?q=budget&scope=all');
        part['_onScopedUrlChanged']();
        expect(render).toHaveBeenCalled();
        expect(part.getPropertyValue(ComponentType.SearchBox)).toBe('budget');
        expect(part['_selectedSearchScope']).toBe('all');
        render.mockRestore();
    });

    it('updates only its URL parameters and republishes identical submissions', () => {
        const part = create();
        const render = jest.spyOn(part, 'renderCompleted').mockImplementation(() => undefined);
        part['_onSearch']('234', 'caseId');
        expect(new URL(window.location.href).searchParams.get('keep')).toBe('yes');
        expect(new URL(window.location.href).searchParams.get('q')).toBe('234');
        expect(new URL(window.location.href).searchParams.get('scope')).toBe('caseId');
        notify.mockClear();
        part['_onSearch']('234', 'caseId');
        expect(notify).toHaveBeenCalledTimes(1);
        part['_onSearch']('', 'caseId');
        expect(new URL(window.location.href).searchParams.has('q')).toBe(false);
        expect(part.getPropertyValue(ComponentType.SearchBox)).toBe('');
        render.mockRestore();
    });

    it('reports unknown URL scopes without publishing a fallback query', () => {
        const part = create();
        window.history.replaceState({}, '', '/?q=234&scope=unknown');
        part['syncAdvancedSearchFromUrl']();
        expect(part['_advancedSearchError']).toBe('Invalid scope');
        expect(notify).not.toHaveBeenCalled();
    });
});
