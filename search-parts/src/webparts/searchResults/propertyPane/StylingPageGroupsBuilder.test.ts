jest.mock('@microsoft/sp-property-pane', () => ({
    PropertyPaneToggle: (targetProperty: string, properties: object) => ({ targetProperty, properties }),
    PropertyPaneTextField: (targetProperty: string, properties: object) => ({ targetProperty, properties })
}));
jest.mock('@microsoft/sp-core-library', () => ({ Text: {} }));
jest.mock('@pnp/modern-search-extensibility', () => ({ LayoutRenderType: {} }));
jest.mock('../../../layouts/AvailableLayouts', () => ({ BuiltinLayoutsKeys: {} }));
jest.mock('@pnp/spfx-property-controls/lib/PropertyFieldMessage', () => ({
    PropertyFieldMessage: (targetProperty: string, properties: object) => ({ targetProperty, properties })
}));
jest.mock('@pnp/spfx-property-controls/lib/PropertyFieldColorPicker', () => ({}));
jest.mock('../../../helpers/LayoutHelper', () => ({}));
jest.mock('../../../controls/PropertyPaneTabsField/PropertyPaneTabsField', () => ({}));
jest.mock('../../../styles/Common.module.scss', () => ({}));
jest.mock('CommonStrings', () => ({
    Controls: {
        SearchResultsMissingTitleWarning: 'Enter a web part title. See all also requires a title.'
    }
}), { virtual: true });

import { StylingPageGroupsBuilder } from './StylingPageGroupsBuilder';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';

describe('Search Results title configuration warning', () => {
    function getFields(showTitle: boolean, title?: string) {
        return StylingPageGroupsBuilder.prototype['buildTitleOptionFields'].call({
            properties: { showTitle, title },
            webPartStrings: { PropertyPane: { LayoutPage: {} } }
        });

    }

    it.each([undefined, '', '  '])('places the missing-title warning directly after Show title for %j', title => {
        const fields = getFields(true, title);
        expect(fields.slice(0, 3).map(field => field.targetProperty)).toEqual([
            'showTitle', 'messageMissingTitle', 'titleLinkText'
        ]);
        expect(fields[1].properties).toEqual(expect.objectContaining({
            text: 'Enter a web part title. See all also requires a title.',
            messageType: MessageBarType.warning,
            isVisible: true
        }));
    });

    it('does not show a warning when Show title is disabled', () => {
        expect(getFields(false, '').map(field => field.targetProperty)).toEqual(['showTitle']);
    });

    it('removes the warning when a title is supplied', () => {
        expect(getFields(true, '').some(field => field.targetProperty === 'messageMissingTitle')).toBe(true);
        expect(getFields(true, 'Results').some(field => field.targetProperty === 'messageMissingTitle')).toBe(false);
    });
});
