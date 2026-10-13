jest.mock('SearchResultsWebPartStrings', () => ({}), { virtual: true });
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('../../styles/Common.module.scss', () => ({}), { virtual: true });
jest.mock('../../layouts/resultTypes/default_simple_list.html', () => '', { virtual: true });
jest.mock('../../layouts/resultTypes/default_cards.html', () => '', { virtual: true });
jest.mock('../../layouts/resultTypes/default_custom.html', () => '', { virtual: true });
jest.mock('../../layouts/resultTypes/default_people.html', () => '', { virtual: true });
jest.mock('../../common/BaseWebPart', () => ({ BaseWebPart: class {} }));
jest.mock('@microsoft/sp-core-library', () => ({}));
jest.mock('@microsoft/sp-property-pane', () => ({}));
jest.mock('@microsoft/sp-component-base', () => ({}));
jest.mock('@microsoft/sp-lodash-subset', () => ({}));
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('@pnp/telemetry-js', () => ({}));
jest.mock('../../dataSources/AvailableDataSources', () => ({}));
jest.mock('../../layouts/AvailableLayouts', () => ({}));
jest.mock('../../services/templateService/TemplateService', () => ({}));
jest.mock('../../helpers/ServiceScopeHelper', () => ({}));
jest.mock('../../services/tokenService/TokenService', () => ({}));
jest.mock('../../services/taxonomyService/TaxonomyService', () => ({}));
jest.mock('../../services/searchService/SharePointSearchService', () => ({}));
jest.mock('../../services/dynamicDataService/DynamicDataService', () => ({}));
jest.mock('../../helpers/LayoutHelper', () => ({}));
jest.mock('../../helpers/ExtensibilityUsageHelper', () => ({}));
jest.mock('../../helpers/GraphToolKitHelper', () => ({}));
jest.mock('../../services/selectedItemsEditService/SelectedItemsEditService', () => ({}));
jest.mock('./services/TokenSetter', () => ({}));

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { createTheme } from '@fluentui/react/lib/Styling';
import SearchResultsWebPart from './SearchResultsWebPart';

const createWebPart = () => {
    const webPart = Object.create(SearchResultsWebPart.prototype) as SearchResultsWebPart;
    Object.defineProperty(webPart, 'properties', {
        value: {
            showTitle: true,
            title: 'Results',
            titleLinkText: 'See all',
            titleLinkUrl: '/sites/search',
            titleLinkOpenInNewTab: false
        }
    });
    return webPart;
};

describe('Search Results title link', () => {
    it.each([
        ['light', '#005a9e', '#004578'],
        ['dark', '#ffffff', '#f4f4f4']
    ])('uses the %s section semantic link colors and semibold weight', (_section, link, linkHovered) => {
        const webPart = createWebPart();
        const theme = createTheme({ semanticColors: { link, linkHovered } });
        webPart['_themeVariant'] = theme;

        const action = webPart['getTitleMoreLink']();
        expect(action.props.theme).toBe(theme);

        const host = document.createElement('div');
        document.body.appendChild(host);
        try {
            ReactDom.render(action, host);
            const button = host.querySelector('button');
            expect(button).not.toBeNull();
            expect(button.type).toBe('button');
            expect(button.textContent).toBe('See all');
            expect(window.getComputedStyle(button).color).toBe(
                link === '#ffffff' ? 'rgb(255, 255, 255)' : 'rgb(0, 90, 158)'
            );
            expect(window.getComputedStyle(button).fontWeight).toBe('600');
            const hoverRules = Array.from(document.styleSheets)
                .reduce<CSSStyleRule[]>((rules, sheet) => rules.concat(Array.from(sheet.cssRules) as CSSStyleRule[]), [])
                .filter(rule => rule.selectorText?.includes(':hover') &&
                    Array.from(button.classList).some(className => rule.selectorText.includes(`.${className}:hover`)));
            expect(hoverRules.some(rule => rule.style.color === linkHovered)).toBe(true);
        } finally {
            ReactDom.unmountComponentAtNode(host);
            host.remove();
        }
    });

    it('falls back to the Fluent theme when there is no section theme', () => {
        const action = createWebPart()['getTitleMoreLink']();
        expect(action.props.theme).toBeUndefined();
        expect(action.props.styles).toEqual({ root: { fontWeight: 600 } });
    });

    it.each([false, true])('preserves navigation with openInNewTab=%s', openInNewTab => {
        const webPart = createWebPart();
        webPart['properties'].titleLinkOpenInNewTab = openInNewTab;
        const navigate = jest.spyOn(webPart as any, 'navigateToTitleLink').mockImplementation(() => {});
        const action = webPart['getTitleMoreLink']();
        action.props.onClick({} as React.MouseEvent);
        expect(navigate).toHaveBeenCalledWith('/sites/search', openInNewTab);
    });

    it.each([
        { showTitle: false },
        { title: ' ' },
        { titleLinkText: ' ' },
        { titleLinkUrl: ' ' }
    ])('omits the action when required title/link properties are missing: %s', properties => {
        const webPart = createWebPart();
        Object.assign(webPart['properties'], properties);
        expect(webPart['getTitleMoreLink']()).toBeNull();
    });
});
