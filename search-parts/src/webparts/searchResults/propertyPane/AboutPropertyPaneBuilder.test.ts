import { AboutPropertyPaneBuilder } from './AboutPropertyPaneBuilder';

describe('AboutPropertyPaneBuilder', () => {
    it('passes the import callback to the property editor', () => {
        const onPropertiesImported = jest.fn().mockResolvedValue(undefined);
        const editor = jest.fn(() => ({ type: 0, targetProperty: '', properties: {} }));
        const webpart = {};
        const builder = new AboutPropertyPaneBuilder(
            () => [], () => [], () => ({ groupName: '', groupFields: [] }),
            editor, webpart,
            { PropertyPane: { InformationPage: { Extensibility: { GroupName: '' }, ImportExport: '' } } },
            onPropertiesImported
        );
        builder.buildAboutPage();
        expect(editor).toHaveBeenCalledWith({
            webpart,
            key: 'propertyEditor',
            onPropertiesImported
        });
    });
});
