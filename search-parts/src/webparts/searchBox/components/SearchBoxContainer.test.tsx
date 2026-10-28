jest.mock('./SearchBoxContainer.module.scss', () => ({}));
jest.mock('./SearchBoxAutoComplete/SearchBoxAutoComplete', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../helpers/DomPurifyHelper', () => ({ DomPurifyHelper: {} }));
jest.mock('../../../components/StyledWebPartTitle', () => ({ StyledWebPartTitle: () => null }));
jest.mock('../../../services/tokenService/TokenService', () => ({ BuiltinTokenNames: { inputQueryText: 'inputQueryText' } }));
jest.mock('SearchBoxWebPartStrings', () => ({ SearchBox: { DefaultPlaceholder: 'Search', SearchButtonLabel: 'Search', ClearButtonLabel: 'Clear search' } }), { virtual: true });
jest.mock('CommonStrings', () => ({ AdvancedSearch: { All: 'All', Scope: 'Scope', InvalidScope: 'Invalid scope' } }), { virtual: true });
jest.mock('@microsoft/sp-core-library', () => ({ DisplayMode: { Read: 1 } }));

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { DisplayMode } from '@microsoft/sp-core-library';
import SearchBoxContainer from './SearchBoxContainer';
import { ISearchBoxContainerProps } from './ISearchBoxContainerProps';
import { PageOpenBehavior, QueryPathBehavior } from '../../../helpers/UrlHelper';
import { createTheme } from '@fluentui/react';

const createProps = (overrides: Partial<ISearchBoxContainerProps> = {}): ISearchBoxContainerProps => ({
    advancedSearch: true,
    searchScopes: [{ key: 'caseId', label: 'CaseId', managedProperty: 'zfm_CaseNumber' }],
    selectedScopeKey: 'all',
    queryStringParameter: 'q',
    scopeQueryStringParameter: 'scope',
    inputValue: '',
    onSearch: jest.fn(),
    enableQuerySuggestions: false,
    searchInNewPage: false,
    reQueryOnClear: true,
    pageUrl: 'https://example.com/search?keep=yes#section',
    queryPathBehavior: QueryPathBehavior.URLFragment,
    inputTemplate: '{inputQueryText}',
    openBehavior: PageOpenBehavior.Self,
    suggestionProviders: [],
    numberOfSuggestionsPerGroup: 5,
    themeVariant: undefined,
    domElement: document.createElement('div'),
    placeholderText: 'Search',
    webPartTitleProps: { title: '', displayMode: DisplayMode.Read, updateProperty: jest.fn() },
    tokenService: {
        setTokenValue: jest.fn(),
        getTokenValue: jest.fn(),
        resolveTokens: jest.fn(async text => text),
        getPageProperties: jest.fn(),
        getUserProfileProperties: jest.fn()
    },
    ...overrides
});

describe('advanced Search Box', () => {
    let host: HTMLDivElement;
    let component: SearchBoxContainer;
    const render = (element: React.ReactElement) => {
        act(() => {
            ReactDom.render(element, host);
        });
    };
    const mount = (props: ISearchBoxContainerProps) =>
        render(<SearchBoxContainer {...props} ref={value => { component = value; }} />);
    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });
    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
        jest.restoreAllMocks();
    });

    it('does not add a scope selector when advanced mode is off', () => {
        mount(createProps({ advancedSearch: false }));
        expect(host.querySelector('[role="combobox"]')).toBeNull();
        expect(host.querySelector('button[aria-haspopup="menu"]')).toBeNull();
    });

    it.each([false, true])('uses a 32px default input height with advanced mode=%s', advancedSearch => {
        mount(createProps({ advancedSearch }));
        const wrapper = host.querySelector<HTMLElement>('.ms-SearchBox').parentElement;
        expect(wrapper.style.minHeight).toBe('32px');
        expect(host.firstElementChild.getAttribute('style')).toContain('--search-focus:');
    });

    it('preserves an explicitly configured taller input height', () => {
        mount(createProps({ searchBoxHeight: 44 }));
        const input = host.querySelector<HTMLElement>('.ms-SearchBox');
        expect(input.parentElement.style.minHeight).toBe('44px');
        expect(input.parentElement.style.height).toBe('44px');
        expect(getComputedStyle(input).height).toBe('42px');
    });

    it.each([false, true])('uses semantic section colors with inverted=%s', isInverted => {
        const theme = createTheme({
            isInverted,
            semanticColors: {
                inputBackground: isInverted ? '#202020' : '#ffffff',
                inputText: isInverted ? '#eeeeee' : '#222222',
                inputBorder: '#888888',
                inputPlaceholderText: '#999999',
                primaryButtonBackground: '#005a9e',
                primaryButtonText: '#ffffff',
                menuBackground: isInverted ? '#242424' : '#ffffff',
                menuItemText: isInverted ? '#eeeeee' : '#222222'
            }
        });
        mount(createProps({ themeVariant: theme, inputValue: 'test', selectedScopeKey: 'caseId' }));
        const root = host.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue('--search-background')).toBe(theme.semanticColors.inputBackground);
        expect(root.style.getPropertyValue('--search-text')).toBe(theme.semanticColors.inputText);
        expect(root.style.getPropertyValue('--placeholder-color')).toBe(theme.semanticColors.inputPlaceholderText);
        expect(root.style.getPropertyValue('--suggestion-background')).toBe(theme.semanticColors.menuBackground);
        expect(root.style.getPropertyValue('--search-button-text')).toBe(theme.semanticColors.primaryButtonText);
        const scope = host.querySelector<HTMLElement>('button[aria-label="Scope: CaseId"]');
        expect(getComputedStyle(scope).backgroundColor).toBe(isInverted ? 'rgb(32, 32, 32)' : 'rgb(255, 255, 255)');
        expect(host.querySelector('label').textContent).toBe('CaseId:');
    });

    it('retains explicit author color overrides over section defaults', () => {
        mount(createProps({
            searchBoxBorderColor: '#123456', searchBoxTextColor: '#234567',
            placeholderTextColor: '#345678', searchButtonColor: '#456789'
        }));
        const root = host.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue('--search-border')).toBe('#123456');
        expect(root.style.getPropertyValue('--search-border-hover')).toBe('#123456');
        expect(root.style.getPropertyValue('--search-text')).toBe('#234567');
        expect(root.style.getPropertyValue('--placeholder-color')).toBe('#345678');
        expect(root.style.getPropertyValue('--search-button-background')).toBe('#456789');
        expect(root.style.getPropertyValue('--search-button-hover')).toBe('#456789');
    });

    it('uses the thin magnifier for the empty input without a clear or submit button', () => {
        mount(createProps({ advancedSearch: false }));
        expect(host.querySelector('.ms-SearchBox-icon svg')).not.toBeNull();
        expect(host.querySelector('button[aria-label="Clear search"]')).toBeNull();
        expect(host.querySelector('button[aria-label="Search"]')).toBeNull();
    });

    it('shows a back-arrow clear action and magnifier submit action for populated input', async () => {
        const props = createProps({ inputValue: 'test', selectedScopeKey: 'caseId' });
        mount(props);
        const clearButton = host.querySelector<HTMLButtonElement>('button[aria-label="Clear search"]');
        const submitButton = host.querySelector<HTMLButtonElement>('button[aria-label="Search"]');
        expect(clearButton.querySelector('[data-icon-name="Back"]')).not.toBeNull();
        expect(submitButton.querySelector('svg')).not.toBeNull();
        await act(async () => { Simulate.click(submitButton); });
        expect(props.onSearch).toHaveBeenCalledWith('test', 'caseId');
        await act(async () => { Simulate.click(clearButton); });
        expect(props.onSearch).toHaveBeenCalledWith('', 'caseId');
        expect(host.querySelector<HTMLInputElement>('input').value).toBe('');
        expect(document.activeElement).toBe(host.querySelector('input'));
    });

    it.each(['icon', 'both'] as const)('preserves a configured submit icon in %s mode', mode => {
        mount(createProps({ inputValue: 'test', searchIconName: 'Forward', searchButtonDisplayMode: mode }));
        const button = host.querySelector('button[aria-label="Search"]');
        expect(button.querySelector('[data-icon-name="Forward"]')).not.toBeNull();
        expect(button.querySelector('svg')).toBeNull();
    });

    it('changes scope without searching, then submits raw text with that scope', async () => {
        const props = createProps();
        mount(props);
        const scopeButton = host.querySelector<HTMLElement>('button[aria-label="Scope: All"]');
        expect(scopeButton).not.toBeNull();
        const input = host.querySelector('input');
        expect(input.compareDocumentPosition(scopeButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(scopeButton.textContent).not.toContain('All');
        expect(scopeButton.querySelector('[data-icon-name="ChevronDown"]')).toBeNull();
        act(() => { Simulate.click(scopeButton); });
        const scopeItem = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
            .find(item => item.textContent.includes('CaseId'));
        expect(scopeItem).toBeDefined();
        act(() => { Simulate.click(scopeItem); });
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
        expect(props.onSearch).not.toHaveBeenCalled();
        expect(component.state.selectedScopeKey).toBe('caseId');
        expect(host.querySelector('button[aria-label="Scope: CaseId"]').textContent).not.toContain('CaseId');
        expect(host.querySelector('label').textContent).toBe('CaseId:');
        await act(async () => { await component._onSearch('23432432'); });
        expect(props.onSearch).toHaveBeenCalledWith('23432432', 'caseId');
    });

    it('restores URL-derived text and scope without decoding the input again', () => {
        mount(createProps({ inputValue: '100% %22', selectedScopeKey: 'caseId' }));
        expect(component.state.searchInputValue).toBe('100% %22');
        expect(component.state.selectedScopeKey).toBe('caseId');
        expect(host.querySelector('label').textContent).toBe('CaseId:');
        expect(host.querySelector<HTMLInputElement>('input').value).toBe('100% %22');
        mount(createProps({ inputValue: 'Contoso', selectedScopeKey: 'all' }));
        expect(component.state.searchInputValue).toBe('Contoso');
        expect(component.state.selectedScopeKey).toBe('all');
        expect(host.querySelector('button[aria-label="Scope: All"]')).not.toBeNull();
        expect(host.querySelector('label')).toBeNull();
    });

    it('keeps the protected prefix outside editable text and submits only the typed value', async () => {
        const props = createProps({ inputValue: 'test*', selectedScopeKey: 'caseId' });
        mount(props);
        const input = host.querySelector<HTMLInputElement>('input');
        const prefix = host.querySelector('label');
        expect(prefix.htmlFor).toBe(input.id);
        expect(prefix.textContent).toBe('CaseId:');
        expect(input.getAttribute('aria-label')).toBe('CaseId: Search');
        act(() => {
            input.value = 'updated*';
            Simulate.change(input);
        });
        expect(input.value).toBe('updated*');
        expect(prefix.textContent).toBe('CaseId:');
        await act(async () => { Simulate.keyDown(input, { which: 13, keyCode: 13 }); });
        expect(props.onSearch).toHaveBeenCalledWith('updated*', 'caseId');
    });

    it('removes the prefix when selecting All without changing the draft text or submitting', async () => {
        const props = createProps({ inputValue: 'test*', selectedScopeKey: 'caseId' });
        mount(props);
        act(() => { Simulate.click(host.querySelector('button[aria-label="Scope: CaseId"]')); });
        const all = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
            .find(item => item.textContent.includes('All'));
        act(() => { Simulate.click(all); });
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
        expect(host.querySelector('label')).toBeNull();
        expect(host.querySelector<HTMLInputElement>('input').value).toBe('test*');
        expect(props.onSearch).not.toHaveBeenCalled();
    });

    it('renders the same protected prefix and trailing scope menu with suggestions enabled', async () => {
        const ActualAutoComplete = jest.requireActual<typeof import('./SearchBoxAutoComplete/SearchBoxAutoComplete')>('./SearchBoxAutoComplete/SearchBoxAutoComplete').default;
        mount(createProps({ inputValue: 'test*', selectedScopeKey: 'caseId' }));
        const menu = <button aria-label="Scope: CaseId">Filter</button>;
        const element = component['renderSearchBoxWithAutoComplete']('CaseId', menu);
        const onSearch = jest.fn();
        render(<ActualAutoComplete {...element.props} onSearch={onSearch} />);
        const input = host.querySelector<HTMLInputElement>('input');
        expect(input.value).toBe('test*');
        expect(host.querySelector('label').textContent).toBe('CaseId:');
        const scopeButton = host.querySelector('button[aria-label="Scope: CaseId"]');
        expect(input.compareDocumentPosition(scopeButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        await act(async () => { Simulate.click(host.querySelector('button[aria-label="Search"]')); });
        expect(onSearch).toHaveBeenCalledWith('test*');
        render(<ActualAutoComplete {...element.props} scopeLabel={undefined} onSearch={onSearch} />);
        expect(host.querySelector('label')).toBeNull();
        expect(host.querySelector<HTMLInputElement>('input').value).toBe('test*');
    });

    it('uses the UI-language translation in the selector and popup without changing the scope key', async () => {
        const props = createProps({
            uiLanguage: 'da-DK', selectedScopeKey: 'caseId',
            searchScopes: [{ key: 'caseId', label: 'CaseId', managedProperty: 'zfm_CaseNumber', labels: { 'da-DK': 'Sagsnummer' } }]
        });
        mount(props);
        const button = host.querySelector<HTMLElement>('button[aria-label="Scope: Sagsnummer"]');
        expect(host.querySelector('label').textContent).toBe('Sagsnummer:');
        expect(button.textContent).not.toContain('Sagsnummer');
        act(() => { Simulate.click(button); });
        const item = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
            .find(element => element.textContent.includes('Sagsnummer'));
        expect(item).toBeDefined();
        act(() => { Simulate.click(item); });
        await act(async () => { await component._onSearch('123'); });
        expect(props.onSearch).toHaveBeenCalledWith('123', 'caseId');
    });

    it('clears text without clearing the selected scope', async () => {
        const props = createProps({ inputValue: '234', selectedScopeKey: 'caseId' });
        mount(props);
        await act(async () => { await component._onSearch('', true); });
        expect(props.onSearch).toHaveBeenCalledWith('', 'caseId');
        expect(component.state.selectedScopeKey).toBe('caseId');
        expect(host.querySelector('label').textContent).toBe('CaseId:');
    });

    it('restores submitted URL state even when only unsubmitted drafts have changed', () => {
        const props = createProps({ inputValue: 'budget', searchStateVersion: 0 });
        mount(props);
        act(() => { component.setState({ searchInputValue: 'draft', selectedScopeKey: 'caseId' }); });
        mount({ ...props, searchStateVersion: 1 });
        expect(component.state.searchInputValue).toBe('budget');
        expect(component.state.selectedScopeKey).toBe('all');
    });

    it('submits a property prefix search without a validation error', async () => {
        const props = createProps({ selectedScopeKey: 'caseId' });
        mount(props);
        await act(async () => { await component._onSearch('203004*'); });
        expect(props.onSearch).toHaveBeenCalledWith('203004*', 'caseId');
        expect(component.state.errorMessage).toBeNull();
    });

    it('shows a validation error instead of submitting property query syntax', async () => {
        const props = createProps({ selectedScopeKey: 'caseId' });
        mount(props);
        await act(async () => { await component._onSearch('a" OR Path:*'); });
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
        expect(props.onSearch).not.toHaveBeenCalled();
        expect(host.textContent).toContain('Invalid scope');
    });

    it('sends raw text and the stable scope key to a new page using custom parameters', async () => {
        const open = jest.spyOn(window, 'open').mockImplementation(() => null);
        const props = createProps({
            searchInNewPage: true, selectedScopeKey: 'caseId',
            queryStringParameter: 'text', scopeQueryStringParameter: 'field'
        });
        mount(props);
        await act(async () => { await component._onSearch('123 & 456'); });
        const url = new URL(String(open.mock.calls[0][0]));
        expect(url.searchParams.get('text')).toBe('123 & 456');
        expect(url.searchParams.get('field')).toBe('caseId');
        expect(url.searchParams.get('keep')).toBe('yes');
        expect(url.hash).toBe('#section');
        expect(props.onSearch).not.toHaveBeenCalled();
        expect(props.tokenService.resolveTokens).toHaveBeenCalledTimes(1);
    });

    it('keeps the submitted scope when it changes during destination URL resolution', async () => {
        const open = jest.spyOn(window, 'open').mockImplementation(() => null);
        let resolvePageUrl: (url: string) => void;
        const pageUrl = new Promise<string>(resolve => { resolvePageUrl = resolve; });
        const props = createProps({ searchInNewPage: true, selectedScopeKey: 'caseId' });
        jest.spyOn(props.tokenService, 'resolveTokens').mockReturnValue(pageUrl);
        mount(props);
        let submission: Promise<void>;
        act(() => { submission = component._onSearch('123'); });
        act(() => { component.setState({ selectedScopeKey: 'all' }); });
        await act(async () => {
            resolvePageUrl(props.pageUrl);
            await submission;
        });
        const url = new URL(String(open.mock.calls[0][0]));
        expect(url.searchParams.get('q')).toBe('123');
        expect(url.searchParams.get('scope')).toBe('caseId');
        expect(component.state.selectedScopeKey).toBe('all');
    });
});
