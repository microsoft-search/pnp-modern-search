jest.mock('../../common/BaseWebPart', () => ({ BaseWebPart: class { protected renderCompleted(): void {} } }));
jest.mock('../../services/tokenService/TokenService', () => ({ BuiltinTokenNames: { inputQueryText: 'inputQueryText' } }));
jest.mock('../../services/dynamicDataService/DynamicDataService', () => ({ DynamicDataService: {} }));
jest.mock('../../providers/AvailableSuggestionProviders', () => ({ AvailableSuggestionProviders: { BuiltinSuggestionProviders: [] } }));
jest.mock('../../helpers/ServiceScopeHelper', () => ({ ServiceScopeHelper: {} }));
jest.mock('@pnp/telemetry-js', () => ({}));
jest.mock('../../styles/Common.module.scss', () => ({}));
jest.mock('SearchBoxWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({
    AdvancedSearch: { InvalidConfiguration: 'Invalid settings', InvalidScope: 'Invalid scope' },
    General: {
        Extensibility: { DefaultExtensibilityLibraryName: 'Library' },
        Resources: { PleaseReferToDocumentationMessage: 'Read the documentation' }
    }
}), { virtual: true });
jest.mock('@microsoft/sp-component-base', () => ({ DynamicProperty: class {} }));
jest.mock('@microsoft/sp-core-library', () => ({ Log: { warn: jest.fn() } }));
jest.mock('@microsoft/sp-property-pane', () => ({
    PropertyPaneToggle: jest.fn(),
    PropertyPaneTextField: jest.fn()
}));
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('react-dom', () => ({ ...jest.requireActual('react-dom'), render: jest.fn() }));

import SearchBoxWebPart from './SearchBoxWebPart';
import { ComponentType } from '../../common/ComponentType';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { MessageBar, MessageBarType } from '@fluentui/react';

class TestSearchBoxWebPart extends SearchBoxWebPart {
    public renderCompleted(): void {
        this['syncAdvancedSearchFromUrl']();
    }

    public renderUi(): void {
        super.renderCompleted();
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
            context: { value: {
                dynamicDataSourceManager: { sourceId: 'search-box', notifyPropertyChanged: notify, notifySourceChanged: jest.fn() },
                dynamicDataProvider: { getAvailableSources: jest.fn(() => []) }
            } }
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

    it('lets the collection panel manage keyboard navigation independently of SharePoint Tabster', () => {
        const part = create();
        const collection = jest.fn();
        part['_propertyFieldCollectionData'] = collection;
        part['_customCollectionFieldType'] = { string: 1, custom: 2 };
        part['_getAdvancedSearchFields']();
        expect(collection.mock.calls[0][1].panelProps['data-tabster'])
            .toBe('{"uncontrolled":{"completely":true}}');
    });

    it('combines selected properties only from connected Results sources without case duplicates', () => {
        const part = create();
        const source = (id: string, properties: string[]) => ({
            getPropertyDefinitions: () => [{ id: ComponentType.SearchResults }],
            getPropertyValue: () => ({ connectedSearchBoxSourceId: id, selectedProperties: properties })
        });
        Object.defineProperty(part['context'].dynamicDataProvider, 'getAvailableSources', {
            value: jest.fn(() => [
                source('search-box', ['Title', 'RefinableString00']),
                source('search-box', ['title', 'Author']),
                source('another-box', ['Path'])
            ])
        });
        const collection = jest.fn();
        part['_propertyFieldCollectionData'] = collection;
        part['_customCollectionFieldType'] = { string: 1, custom: 2 };
        part['_getAdvancedSearchFields']();
        const field = collection.mock.calls[0][1].fields.find(item => item.id === 'managedProperty');
        const update = jest.fn();
        const element = field.onCustomRender(field, 'Title', update);
        expect(element.props.children.props.properties).toEqual(['Title', 'RefinableString00', 'Author']);
        element.props.children.props.onChange('Author');
        expect(update).toHaveBeenCalledWith('managedProperty', 'Author');
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

    it('warns about unknown URL scopes and publishes the raw query using All', () => {
        const part = create();
        window.history.replaceState({}, '', '/?q=test*&scope=unknown');
        part['syncAdvancedSearchFromUrl']();
        expect(part['_advancedSearchError']).toBeUndefined();
        expect(part['_advancedSearchWarning']).toBe('Invalid scope');
        expect(part['_selectedSearchScope']).toBe('all');
        expect(part['_searchQueryText']).toBe('test*');
        expect(part.getPropertyValue(ComponentType.SearchBox)).toBe('test*');
        expect(notify).toHaveBeenCalledWith(ComponentType.SearchBox);
        expect(new URL(window.location.href).searchParams.get('scope')).toBe('unknown');
    });

    it('clears a previous scoped query when an unknown URL scope has no query', () => {
        const part = create();
        window.history.replaceState({}, '', '/?q=234&scope=caseId');
        part['syncAdvancedSearchFromUrl']();
        notify.mockClear();
        window.history.replaceState({}, '', '/?scope=unknown');
        part['syncAdvancedSearchFromUrl']();
        expect(part['_advancedSearchWarning']).toBe('Invalid scope');
        expect(part['_selectedSearchScope']).toBe('all');
        expect(part['_searchQueryText']).toBe('');
        expect(part.getPropertyValue(ComponentType.SearchBox)).toBe('');
        expect(notify).toHaveBeenCalledWith(ComponentType.SearchBox);
    });

    it('renders the search box with its URL text before the unknown-scope warning', () => {
        const part = create();
        Object.defineProperty(part, 'domElement', { value: document.createElement('div') });
        Object.defineProperty(part['context'], 'pageContext', {
            value: { cultureInfo: { currentUICultureName: 'en-US' } }
        });
        const render = jest.mocked(ReactDom.render);
        window.history.replaceState({}, '', '/?q=test*&scope=unknown');
        try {
            part.renderUi();
            const root = render.mock.calls[0][0];
            if (!React.isValidElement<{ children: React.ReactNode }>(root)) {
                throw new Error('Expected the Search Box render root to be a React element');
            }
            expect(root.type).toBe(React.Fragment);
            const [search, warning] = React.Children.toArray(root.props.children) as React.ReactElement[];
            expect(search.type).toBe(React.Suspense);
            expect(search.props.children.props.inputValue).toBe('test*');
            expect(search.props.children.props.selectedScopeKey).toBe('all');
            expect(warning.type).toBe(MessageBar);
            expect(warning.props.messageBarType).toBe(MessageBarType.warning);
            expect(warning.props.children[0]).toBe('Invalid scope');
        } finally {
            render.mockReset();
        }
    });

    it('clears the unknown-scope warning after submitting the default search', () => {
        const part = create();
        const render = jest.spyOn(part, 'renderCompleted').mockImplementation(() => undefined);
        window.history.replaceState({}, '', '/?q=test*&scope=unknown');
        part['syncAdvancedSearchFromUrl']();
        part['_onSearch']('test*', part['_selectedSearchScope']);
        expect(part['_advancedSearchWarning']).toBeUndefined();
        expect(new URL(window.location.href).searchParams.get('scope')).toBe('all');
        expect(part.getPropertyValue(ComponentType.SearchBox)).toBe('test*');
        render.mockRestore();
    });

    it.each([
        '/?q=test&q=other&scope=unknown',
        '/?q=test&scope=caseId&scope=unknown',
        '/?q=te*st&scope=caseId'
    ])('continues to reject ambiguous parameters and unsupported scoped values: %s', url => {
        const part = create();
        window.history.replaceState({}, '', url);
        part['syncAdvancedSearchFromUrl']();
        expect(part['_advancedSearchError']).toBe('Invalid scope');
        expect(part['_advancedSearchWarning']).toBeUndefined();
        expect(notify).not.toHaveBeenCalled();
    });

    it('continues to reject invalid configuration rather than using a fallback', () => {
        const part = create();
        part['properties'].scopeQueryStringParameter = 'q';
        window.history.replaceState({}, '', '/?q=test*&scope=unknown');
        part['syncAdvancedSearchFromUrl']();
        expect(part['_advancedSearchError']).toBe('Invalid settings');
        expect(part['_advancedSearchWarning']).toBeUndefined();
        expect(notify).not.toHaveBeenCalled();
    });
});
