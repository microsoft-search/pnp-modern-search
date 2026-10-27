export interface ISearchScope {
    key: string;
    label: string;
    managedProperty: string;
    labels?: { [language: string]: string };
}

export function getSearchScopeLabel(scope: ISearchScope, uiLanguage: string): string {
    const language = (uiLanguage || '').toLowerCase();
    const key = Object.keys(scope.labels || {}).find(locale => locale.toLowerCase() === language);
    return key ? scope.labels[key] : scope.label;
}

export const ALL_SEARCH_SCOPE = 'all';

export class SearchScopeError extends Error {
    public constructor(public readonly reason: 'configuration' | 'scope') {
        super(`Invalid advanced search ${reason}`);
    }
}

export function validateSearchScopes(scopes: ISearchScope[], queryParameter: string, scopeParameter: string): void {
    const parameterPattern = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;
    if (!parameterPattern.test(queryParameter || '') || !parameterPattern.test(scopeParameter || '')
        || queryParameter.toLowerCase() === scopeParameter.toLowerCase() || !Array.isArray(scopes)) {
        throw new SearchScopeError('configuration');
    }
    const keys = new Set([ALL_SEARCH_SCOPE]);
    for (const scope of scopes) {
        if (!scope || typeof scope.key !== 'string' || !parameterPattern.test(scope.key)
            || keys.has(scope.key.toLowerCase()) || typeof scope.label !== 'string' || !scope.label.trim()
            || typeof scope.managedProperty !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(scope.managedProperty)) {
            throw new SearchScopeError('configuration');
        }
        keys.add(scope.key.toLowerCase());
        if (scope.labels !== undefined) {
            if (!scope.labels || typeof scope.labels !== 'object' || Array.isArray(scope.labels)) {
                throw new SearchScopeError('configuration');
            }
            const languages = new Set<string>();
            for (const language of Object.keys(scope.labels)) {
                if (!/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(language)
                    || languages.has(language.toLowerCase())
                    || typeof scope.labels[language] !== 'string' || !scope.labels[language].trim()) {
                    throw new SearchScopeError('configuration');
                }
                languages.add(language.toLowerCase());
            }
        }
    }
}

export function buildScopedSearchQuery(text: string, scopeKey: string, scopes: ISearchScope[] = []): string {
    if (scopeKey === ALL_SEARCH_SCOPE) {
        return text;
    }
    const scope = scopes.find(item => item.key === scopeKey);
    if (!scope) {
        throw new SearchScopeError('scope');
    }
    if (!text.trim()) {
        return '';
    }
    // Keep property input inside its quoted value; only a single trailing prefix wildcard is allowed.
    const value = text.trim();
    const wildcardIndex = value.indexOf('*');
    if (/["\\]/.test(value) || (wildcardIndex !== -1
        && (wildcardIndex !== value.length - 1 || !value.slice(0, -1).trim()))) {
        throw new SearchScopeError('scope');
    }
    return `${scope.managedProperty}:"${wildcardIndex === -1 ? text : value}"`;
}

export function readScopedSearchUrl(url: string, queryParameter: string, scopeParameter: string): { text: string; scopeKey: string } {
    const params = new URL(url).searchParams;
    if (params.getAll(queryParameter).length > 1 || params.getAll(scopeParameter).length > 1) {
        throw new SearchScopeError('scope');
    }
    return {
        text: params.get(queryParameter) || '',
        scopeKey: params.get(scopeParameter) || ALL_SEARCH_SCOPE
    };
}

export function writeScopedSearchUrl(url: string, queryParameter: string, scopeParameter: string, text: string, scopeKey: string): string {
    const result = new URL(url);
    if (text) {
        result.searchParams.set(queryParameter, text);
    } else {
        result.searchParams.delete(queryParameter);
    }
    result.searchParams.set(scopeParameter, scopeKey);
    return result.href;
}
