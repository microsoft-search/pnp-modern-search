import {
    ALL_SEARCH_SCOPE, buildScopedSearchQuery, ISearchScope, readScopedSearchUrl,
    SearchScopeError, validateSearchScopes, writeScopedSearchUrl
} from './SearchScopeHelper';

const scopes: ISearchScope[] = [
    { key: 'caseId', label: 'CaseId', managedProperty: 'zfm_CaseNumber' },
    { key: 'customer', label: 'Customer', managedProperty: 'RefinableString10' }
];

describe('advanced search scopes', () => {
    it('accepts configured properties and distinct URL parameters', () => {
        expect(() => validateSearchScopes(scopes, 'q', 'scope')).not.toThrow();
        expect(() => validateSearchScopes([], 'text', 'field')).not.toThrow();
    });

    it.each([
        [{ key: 'all', label: 'Reserved', managedProperty: 'Title' }],
        [{ key: 'ALL', label: 'Reserved', managedProperty: 'Title' }],
        [scopes[0], { ...scopes[0], key: 'CASEID' }],
        [{ ...scopes[0], key: 'bad key' }],
        [{ ...scopes[0], label: ' ' }],
        [{ ...scopes[0], managedProperty: 'Title OR Path' }],
        [{ ...scopes[0], managedProperty: 'Title:foo' }]
    ])('rejects invalid scope definitions: %j', (...invalidScopes) => {
        expect(() => validateSearchScopes(invalidScopes, 'q', 'scope')).toThrow(SearchScopeError);
    });

    it.each([['q', 'q'], ['q', 'Q'], ['', 'scope'], ['q', 'bad name']])('rejects invalid URL parameters %s/%s', (query, scope) => {
        expect(() => validateSearchScopes(scopes, query, scope)).toThrow(SearchScopeError);
    });

    it('leaves All queries unchanged and scopes property text as a phrase', () => {
        expect(buildScopedSearchQuery('budget OR report*', ALL_SEARCH_SCOPE, scopes)).toBe('budget OR report*');
        expect(buildScopedSearchQuery('23432432', 'caseId', scopes)).toBe('zfm_CaseNumber:"23432432"');
        expect(buildScopedSearchQuery('Contoso & Sons', 'customer', scopes)).toBe('RefinableString10:"Contoso & Sons"');
        expect(buildScopedSearchQuery('100% + æ %22', 'customer', scopes)).toBe('RefinableString10:"100% + æ %22"');
    });

    it.each(['"', 'a" OR Path:*', 'a\\', '*a', 'a*b', '*a*', 'a**', '*', ' * '])('rejects property query syntax rather than widening the search: %s', text => {
        expect(() => buildScopedSearchQuery(text, 'caseId', scopes)).toThrow(SearchScopeError);
    });

    it.each(['203004*', ' 203004* '])('supports a single trailing prefix wildcard: %s', text => {
        expect(buildScopedSearchQuery(text, 'caseId', scopes)).toBe('zfm_CaseNumber:"203004*"');
    });

    it('supports a trailing wildcard on the final word of a property phrase', () => {
        expect(buildScopedSearchQuery('Contoso Son*', 'customer', scopes)).toBe('RefinableString10:"Contoso Son*"');
    });

    it('preserves prefix wildcards when restoring URL state', () => {
        const url = writeScopedSearchUrl('https://example.com/', 'q', 'scope', '203004*', 'caseId');
        const state = readScopedSearchUrl(url, 'q', 'scope');
        expect(buildScopedSearchQuery(state.text, state.scopeKey, scopes)).toBe('zfm_CaseNumber:"203004*"');
    });
    it('rejects unknown scopes even with empty text', () => {
        expect(() => buildScopedSearchQuery('', 'missing', scopes)).toThrow(SearchScopeError);
    });

    it('clears only the query restriction when the search text is empty', () => {
        expect(buildScopedSearchQuery('', 'caseId', scopes)).toBe('');
        expect(buildScopedSearchQuery('  ', 'caseId', scopes)).toBe('');
    });

    it('reads a missing scope as All and decodes URL values exactly once', () => {
        expect(readScopedSearchUrl('https://example.com/?q=hello', 'q', 'scope')).toEqual({ text: 'hello', scopeKey: 'all' });
        expect(readScopedSearchUrl('https://example.com/?q=100%25%20%2522%20%2B&scope=caseId', 'q', 'scope'))
            .toEqual({ text: '100% %22 +', scopeKey: 'caseId' });
    });

    it.each(['?q=a&q=b', '?scope=caseId&scope=customer'])('rejects ambiguous URL values: %s', query => {
        expect(() => readScopedSearchUrl(`https://example.com/${query}`, 'q', 'scope')).toThrow(SearchScopeError);
    });

    it('round-trips custom parameters while preserving unrelated parameters and the fragment', () => {
        const url = writeScopedSearchUrl('https://example.com/search?keep=yes#section', 'text', 'field', 'æ & + %22', 'customer');
        expect(readScopedSearchUrl(url, 'text', 'field')).toEqual({ text: 'æ & + %22', scopeKey: 'customer' });
        expect(new URL(url).searchParams.get('keep')).toBe('yes');
        expect(new URL(url).hash).toBe('#section');
        const cleared = new URL(writeScopedSearchUrl(url, 'text', 'field', '', 'customer'));
        expect(cleared.searchParams.has('text')).toBe(false);
        expect(cleared.searchParams.get('field')).toBe('customer');
    });
});
