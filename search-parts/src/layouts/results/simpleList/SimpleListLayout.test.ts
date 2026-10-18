jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseLayout: class { public properties = {}; }
}));
jest.mock('@microsoft/sp-property-pane', () => ({
    PropertyPaneToggle: (targetProperty: string, properties: unknown) => ({ targetProperty, properties }),
    PropertyPaneTextField: (targetProperty: string, properties: unknown) => ({ targetProperty, properties })
}));
jest.mock('CommonStrings', () => ({
    Layouts: { SimpleList: {}, DetailsList: {} }
}), { virtual: true });

import { AdaptiveCardsSimpleListLayout, SimpleListLayout } from './SimpleListLayout';

describe('Simple List export settings', () => {
    it('exposes export settings for the Handlebars layout', async () => {
        const layout = new SimpleListLayout({});
        await layout.onInit();
        layout.properties.enableCsvExport = true;
        const fields = layout.getPropertyPaneFieldsConfiguration(['Title']).map(field => field.targetProperty);
        expect(fields).toContain('layoutProperties.enableCsvExport');
        expect(fields).toContain('layoutProperties.exportColumns');
    });

    it('hides unsupported export settings in Adaptive Cards mode, even if previously enabled', async () => {
        const layout = new AdaptiveCardsSimpleListLayout({});
        await layout.onInit();
        layout.properties.enableCsvExport = true;
        const fields = layout.getPropertyPaneFieldsConfiguration(['Title']).map(field => field.targetProperty);
        expect(fields).not.toContain('layoutProperties.enableCsvExport');
        expect(fields).not.toContain('layoutProperties.exportColumns');
    });
});