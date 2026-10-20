jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseLayout: class { public properties = {}; }
}));
jest.mock('@microsoft/sp-property-pane', () => ({
    PropertyPaneButton: (targetProperty: string, properties: unknown) => ({ targetProperty, properties }),
    PropertyPaneButtonType: { Normal: 'Normal' },
    PropertyPaneToggle: (targetProperty: string, properties: unknown) => ({ targetProperty, properties }),
    PropertyPaneTextField: (targetProperty: string, properties: unknown) => ({ targetProperty, properties })
}));
jest.mock('CommonStrings', () => ({
    Layouts: {
        SimpleList: {},
        DetailsList: {
            ExportColumnsJsonValidationError: 'Invalid mapping',
            ExportColumnsMissingPropertiesError: 'Missing selected properties: {0}',
            ValidateJsonButtonLabel: 'Validate JSON',
            ExportColumnsJsonValid: 'All selected'
        }
    }
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
        expect(fields).toContain('layoutProperties.validateExportColumns');
    });

    it('shows validation results for the configured selected properties', async () => {
        const layout = new SimpleListLayout({});
        await layout.onInit();
        layout.properties.enableCsvExport = true;
        layout.properties.exportColumns = '{"Title":"Title","Author":"Author"}';
        const fields = layout.getPropertyPaneFieldsConfiguration(['Title']);
        const validateButton = fields.find(field => field.targetProperty === 'layoutProperties.validateExportColumns');
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

        expect(validateButton.properties.buttonType).toBe('Normal');
        validateButton.properties.onClick();

        expect(alertSpy).toHaveBeenCalledWith('Missing selected properties: Author');
        alertSpy.mockRestore();
    });

    it('hides the JSON field and validation button when CSV export is disabled', async () => {
        const layout = new SimpleListLayout({});
        await layout.onInit();
        const fields = layout.getPropertyPaneFieldsConfiguration(['Title']).map(field => field.targetProperty);

        expect(fields).not.toContain('layoutProperties.exportColumns');
        expect(fields).not.toContain('layoutProperties.validateExportColumns');
    });

    it('hides unsupported export settings in Adaptive Cards mode, even if previously enabled', async () => {
        const layout = new AdaptiveCardsSimpleListLayout({});
        await layout.onInit();
        layout.properties.enableCsvExport = true;
        const fields = layout.getPropertyPaneFieldsConfiguration(['Title']).map(field => field.targetProperty);
        expect(fields).not.toContain('layoutProperties.enableCsvExport');
        expect(fields).not.toContain('layoutProperties.exportColumns');
        expect(fields).not.toContain('layoutProperties.validateExportColumns');
    });
});