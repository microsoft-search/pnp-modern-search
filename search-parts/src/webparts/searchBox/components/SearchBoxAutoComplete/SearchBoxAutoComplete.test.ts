jest.mock('../SearchBoxContainer.module.scss', () => ({}), { virtual: true });
jest.mock('SearchBoxWebPartStrings', () => ({}), { virtual: true });
jest.mock('@fluentui/react', () => ({ getId: jest.fn(() => 'search-input') }));
jest.mock('../../../../helpers/DomPurifyHelper', () => ({ DomPurifyHelper: {} }));

import { ISuggestion, ISuggestionProvider, ISuggestionProviderContext } from '@pnp/modern-search-extensibility';
import SearchBoxAutoComplete from './SearchBoxAutoComplete';
import { debounce } from '@microsoft/sp-lodash-subset';

const context = (key: string): ISuggestionProviderContext => ({
    verticals: { selectedVertical: { key, name: key, value: key } }
});

const deferred = <T>() => {
    let resolvePromise: (value: T) => void;
    let rejectPromise: (reason: Error) => void;
    const promise = new Promise<T>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
    return { promise, resolve: resolvePromise, reject: rejectPromise };
};

const createProvider = (overrides: Partial<ISuggestionProvider>): ISuggestionProvider => ({
    properties: {},
    context: {},
    isZeroTermSuggestionsEnabled: false,
    onInit: jest.fn(),
    getSuggestions: jest.fn().mockResolvedValue([]),
    getZeroTermSuggestions: jest.fn().mockResolvedValue([]),
    getPropertyPaneGroupsConfiguration: jest.fn().mockReturnValue([]),
    onPropertyUpdate: jest.fn(),
    ...overrides
});

const createComponent = (provider: ISuggestionProvider, inputValue: string) => {
    const component = new SearchBoxAutoComplete({
        placeholderText: '',
        suggestionProviders: [provider],
        suggestionProviderContext: context('first'),
        inputValue,
        onSearch: jest.fn(),
        domElement: document.createElement('div'),
        numberOfSuggestionsPerGroup: 5,
        themeVariant: undefined
    });

    jest.spyOn(component, 'setState').mockImplementation((update) => {
        const nextState = typeof update === 'function' ? update(component.state, component.props) : update;
        if (nextState) {
            Object.defineProperty(component, 'state', {
                configurable: true,
                value: { ...component.state, ...nextState }
            });
        }
    });

    return component;
};

const switchVertical = (component: SearchBoxAutoComplete) => {
    const previousProps = component.props;
    Object.defineProperty(component, 'props', {
        configurable: true,
        value: { ...previousProps, suggestionProviderContext: context('second') }
    });
    component.componentDidUpdate(previousProps);
};

describe('SearchBoxAutoComplete suggestion requests', () => {
    const restoreInput = (component: SearchBoxAutoComplete, inputValue: string) => {
        const previousProps = component.props;
        Object.defineProperty(component, 'props', {
            configurable: true,
            value: { ...previousProps, inputValue, searchStateVersion: (previousProps.searchStateVersion || 0) + 1 }
        });
        component.componentDidUpdate(previousProps);
    };

    it.each(['resolves', 'rejects'])('invalidates pending draft suggestions when navigation restores the same submitted query and the request %s', async outcome => {
        const pending = deferred<ISuggestion[]>();
        const provider = createProvider({ getSuggestions: jest.fn().mockReturnValue(pending.promise) });
        const component = createComponent(provider, 'query');
        component.setState({
            proposedQuerySuggestions: [{ displayText: 'Draft suggestion' }],
            termToSuggestFrom: 'draft',
            errorMessage: 'Draft error'
        });
        const request = component['_updateQuerySuggestions']('query');
        restoreInput(component, 'query');
        expect(component.state.searchInputValue).toBe('query');
        expect(component.state.proposedQuerySuggestions).toEqual([]);
        expect(component.state.termToSuggestFrom).toBeNull();
        expect(component.state.errorMessage).toBeNull();
        expect(component.state.isRetrievingSuggestions).toBe(false);
        expect(component.state.isSearchExecuted).toBe(true);

        if (outcome === 'resolves') {
            pending.resolve([{ displayText: 'Abandoned draft' }]);
        } else {
            pending.reject(new Error('Abandoned request failed'));
        }
        await request;
        expect(component.state.proposedQuerySuggestions).toEqual([]);
        expect(component.state.errorMessage).toBeNull();
    });

    it('cancels a debounced draft request when restoring a different query', () => {
        jest.useFakeTimers();
        try {
            const component = createComponent(createProvider({}), 'query');
            const update = jest.fn();
            component['_onChangeDebounced'] = debounce(update, 200);
            component['_onChangeDebounced']('draft');
            restoreInput(component, 'restored');
            jest.runAllTimers();
            expect(update).not.toHaveBeenCalled();
            expect(component.state.searchInputValue).toBe('restored');
        } finally {
            jest.useRealTimers();
        }
    });

    it('invalidates zero-term requests when restoring navigation input', async () => {
        const pending = deferred<ISuggestion[]>();
        const provider = createProvider({
            isZeroTermSuggestionsEnabled: true,
            getZeroTermSuggestions: jest.fn().mockReturnValue(pending.promise)
        });
        const component = createComponent(provider, '');
        const request = component['_ensureZeroTermQuerySuggestions'](false, true);
        restoreInput(component, 'restored');
        pending.resolve([{ displayText: 'Old zero-term suggestion' }]);
        await request;
        expect(component.state.isRetrievingZeroTermSuggestions).toBe(false);
        expect(component.state.proposedQuerySuggestions).toEqual([]);
        expect(component.state.zeroTermQuerySuggestions).toEqual([]);
    });

    it.each(['resolves', 'rejects'])('keeps the new typed request loading when the previous vertical %s', async outcome => {
        const first = deferred<ISuggestion[]>();
        const second = deferred<ISuggestion[]>();
        const provider = createProvider({
            getSuggestions: jest.fn()
                .mockReturnValueOnce(first.promise)
                .mockReturnValueOnce(second.promise)
        });
        const component = createComponent(provider, 'query');

        const oldRequest = component['_updateQuerySuggestions']('query');
        switchVertical(component);
        expect(component.state.isRetrievingSuggestions).toBe(true);

        if (outcome === 'resolves') {
            first.resolve([{ displayText: 'Old vertical' }]);
        } else {
            first.reject(new Error('Old vertical failed'));
        }
        await oldRequest;
        expect(component.state.isRetrievingSuggestions).toBe(true);
        expect(component.state.errorMessage).toBeNull();
        expect(component.state.proposedQuerySuggestions).toEqual([]);

        second.resolve([{ displayText: 'New vertical' }]);
        await Promise.resolve();
        expect(component.state.isRetrievingSuggestions).toBe(false);
        expect(component.state.proposedQuerySuggestions).toEqual([{ displayText: 'New vertical' }]);
        expect(provider.getSuggestions).toHaveBeenNthCalledWith(2, 'query', context('second'));
    });

    it('keeps the new zero-term request loading when the previous vertical finishes', async () => {
        const first = deferred<ISuggestion[]>();
        const second = deferred<ISuggestion[]>();
        const provider = createProvider({
            isZeroTermSuggestionsEnabled: true,
            getZeroTermSuggestions: jest.fn()
                .mockReturnValueOnce(first.promise)
                .mockReturnValueOnce(second.promise)
        });
        const component = createComponent(provider, '');

        const oldRequest = component['_ensureZeroTermQuerySuggestions']();
        switchVertical(component);
        expect(component.state.isRetrievingZeroTermSuggestions).toBe(true);

        first.resolve([{ displayText: 'Old vertical' }]);
        await oldRequest;
        expect(component.state.isRetrievingZeroTermSuggestions).toBe(true);
        expect(component.state.zeroTermQuerySuggestions).toEqual([]);

        second.resolve([{ displayText: 'New vertical' }]);
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        expect(component.state.isRetrievingZeroTermSuggestions).toBe(false);
        expect(component.state.zeroTermQuerySuggestions).toEqual([{ displayText: 'New vertical' }]);
        expect(provider.getZeroTermSuggestions).toHaveBeenNthCalledWith(2, context('second'));
    });
});
