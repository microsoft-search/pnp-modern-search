jest.mock('../../../controls/TemplateRenderer/TemplateRenderer', () => ({}));
jest.mock('../../../components/StyledWebPartTitle', () => ({}));
jest.mock('SearchFiltersWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('@microsoft/sp-core-library', () => ({}));
jest.mock('../../../helpers/DataFilterHelper', () => ({}));
jest.mock('../../../helpers/UrlHelper', () => ({ UrlHelper: {} }));
jest.mock('../../../layouts/AvailableTemplates', () => ({
    BuiltinFilterTemplates: {
        People: 'People'
    }
}));
jest.mock('@fluentui/react/lib/MessageBar', () => ({}));
jest.mock('../../../styles/Common.module.scss', () => ({}));
jest.mock('@microsoft/sp-lodash-subset', () => ({
    cloneDeep: require('lodash/cloneDeep'),
    sortBy: require('lodash/sortBy'),
    isEqual: require('lodash/isEqual')
}));

import SearchFiltersContainer from './SearchFiltersContainer';

describe('SearchFiltersContainer.resolveFilterDisplayName', () => {
    function createContainer(): SearchFiltersContainer {
        const container: SearchFiltersContainer = Object.create(SearchFiltersContainer.prototype);
        (container as any)._peopleDisplayNameByValue = new Map<string, string>();
        (container as any)._peopleDisplayNameByName = new Map<string, string>();
        (container as any)._resolvedDisplayNameCache = new Map<string, string>();
        return container;
    }

    // Issue #4981: localized taxonomy refiners carry the term label as name and an FQL expression as value
    it.each(['Initial', 'Closed', 'Infrastruktur', 'Økonomi', 'In progress'])('keeps the localized term label "%s" instead of the refinement expression', (label) => {
        const value = 'or(GP0|#8a7d788f-96d7-4b84-a005-0377dce115e1,L0|#08a7d788f-96d7-4b84-a005-0377dce115e1)';

        expect(createContainer()['resolveFilterDisplayName'](label, value)).toBe(label);
    });
});
