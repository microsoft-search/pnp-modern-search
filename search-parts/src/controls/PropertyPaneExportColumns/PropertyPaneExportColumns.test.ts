jest.mock('@microsoft/sp-property-pane', () => ({
    PropertyPaneFieldType: { Custom: 'Custom' }
}));
jest.mock('react-dom', () => ({
    render: jest.fn(),
    unmountComponentAtNode: jest.fn()
}));

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneExportColumns } from './PropertyPaneExportColumns';
import { IExportColumnsEditorProps } from './ExportColumnsEditor';

describe('export columns property-pane field', () => {
    afterEach(() => { jest.clearAllMocks(); });

    it('passes the latest JSON to the lazy editor and writes through the SPFx callback', () => {
        const render = jest.mocked(ReactDom.render);
        const onSave = jest.fn();
        const changeCallback = jest.fn();
        let value = '{"Title":"Old"}';
        const field = new PropertyPaneExportColumns(() => value, ['Title'], onSave);
        field.properties.onRender(document.createElement('div'), undefined, changeCallback);
        const suspense: React.ReactNode = render.mock.calls[0][0];
        if (!React.isValidElement<{ children: React.ReactElement<IExportColumnsEditorProps> }>(suspense)) {
            throw new Error('Expected the editor Suspense element.');
        }
        const editorProps = suspense.props.children.props;
        value = '{"Title":"New draft"}';
        expect(editorProps.getValue()).toBe(value);
        expect(editorProps.selectedProperties).toEqual(['Title']);
        editorProps.onSave('{"Title":"Saved"}');
        expect(onSave).toHaveBeenCalledWith('{"Title":"Saved"}');
        expect(changeCallback).toHaveBeenCalledWith('layoutProperties.exportColumns', '{"Title":"Saved"}');
    });

    it('unmounts the editor when SPFx disposes the field', () => {
        const unmount = jest.mocked(ReactDom.unmountComponentAtNode);
        const field = new PropertyPaneExportColumns(() => '', [], jest.fn());
        const element = document.createElement('div');
        field.properties.onDispose(element);
        expect(unmount).toHaveBeenCalledWith(element);
    });
});
