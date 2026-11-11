jest.mock('CommonStrings', () => ({
    Layouts: {
        DetailsList: {
            EditExportColumnsButtonLabel: 'Configure export columns',
            ExportColumnsEditorDescription: 'Select properties and headers',
            ExportColumnSelectedLabel: 'Export',
            ExportManagedPropertyLabel: 'Managed property',
            DisplayNameColumnLabel: 'Column display name',
            ExportColumnsEditorInvalidJson: 'Correct the JSON textbox first',
            ExportColumnsJsonValidationError: 'Invalid mapping',
            ExportColumnsMissingPropertiesError: 'Missing selected properties: {0}'
        }
    },
    Controls: { TextDialogSaveButtonText: 'Save', TextDialogCancelButtonText: 'Cancel' }
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import ExportColumnsEditor from './ExportColumnsEditor';
import { validateExportColumnsJson } from '../../helpers/CsvExportHelper';

describe('export columns editor', () => {
    let host: HTMLDivElement;
    let value: string;
    let onSave: jest.Mock;
    const button = (text: string): HTMLButtonElement =>
        Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(element => element.textContent === text);
    const checkbox = (field: string): HTMLInputElement => document.querySelector(`[aria-label="Export: ${field}"]`);
    const header = (field: string): HTMLInputElement => document.querySelector(`[aria-label="Column display name: ${field}"]`);
    const open = async (): Promise<void> => {
        act(() => { Simulate.click(button('Configure export columns')); });
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
    };
    const changeHeader = (field: string, text: string): void => {
        act(() => {
            const input = header(field);
            input.value = text;
            Simulate.change(input, { target: input });
        });
    };
    const toggle = (field: string): void => {
        act(() => {
            const input = checkbox(field);
            input.checked = !input.checked;
            Simulate.change(input, { target: input });
        });
    };
    const mount = (selectedProperties = ['Title', 'Author', 'Path']): void => {
        act(() => { ReactDom.render(<ExportColumnsEditor getValue={() => value}
            selectedProperties={selectedProperties} onSave={onSave} />, host); });
    };

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
        value = '{"Author":"Created by","Title":"Document title"}';
        onSave = jest.fn(json => { value = json; });
    });
    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    it('loads existing mappings, selected fields, headers and order, and saves compatible JSON', async () => {
        mount();
        await open();
        expect(checkbox('Author').checked).toBe(true);
        expect(checkbox('Title').checked).toBe(true);
        expect(checkbox('Path').checked).toBe(false);
        expect(header('Author').value).toBe('Created by');
        changeHeader('Title', 'Name');
        toggle('Path');
        expect(onSave).not.toHaveBeenCalled();
        act(() => { Simulate.click(button('Save')); });
        expect(Object.entries(JSON.parse(value))).toEqual([['Author', 'Created by'], ['Title', 'Name'], ['Path', 'Path']]);
        expect(validateExportColumnsJson(value, ['Title', 'Author', 'Path'])).toBe('');
        await open();
        expect(header('Title').value).toBe('Name');
        expect(checkbox('Path').checked).toBe(true);
    });

    it('starts an empty configuration with every selected property available and unchecked', async () => {
        value = '';
        mount(['Title', 'Title', 'Author']);
        await open();
        expect(document.querySelectorAll('[role="checkbox"], input[type="checkbox"]').length).toBe(2);
        expect(checkbox('Title').checked).toBe(false);
        expect(button('Save').disabled).toBe(true);
        toggle('Title');
        expect(button('Save').disabled).toBe(false);
        act(() => { Simulate.click(button('Save')); });
        expect(JSON.parse(value)).toEqual({ Title: 'Title' });
    });

    it('does not save cancelled changes and reads the latest JSON when reopened', async () => {
        mount();
        await open();
        changeHeader('Title', 'Discard this');
        act(() => { Simulate.click(button('Cancel')); });
        expect(onSave).not.toHaveBeenCalled();
        value = '{"Path":"Link"}';
        await open();
        expect(header('Title').value).toBe('Title');
        expect(checkbox('Title').checked).toBe(false);
        expect(header('Path').value).toBe('Link');
        expect(checkbox('Path').checked).toBe(true);
    });

    it('keeps unavailable fields visible and blocks saving until they are deselected', async () => {
        value = '{"Title":"Title","RemovedField":"Legacy header"}';
        mount();
        await open();
        expect(header('RemovedField').value).toBe('Legacy header');
        expect(document.body.textContent).toContain('Missing selected properties: RemovedField');
        expect(button('Save').disabled).toBe(true);
        toggle('RemovedField');
        expect(header('RemovedField')).not.toBeNull();
        expect(button('Save').disabled).toBe(false);
        act(() => { Simulate.click(button('Save')); });
        expect(JSON.parse(value)).toEqual({ Title: 'Title' });
    });

    it('rejects empty or whitespace-only selected headers and requires at least one column', async () => {
        value = '{"Title":"Title"}';
        mount();
        await open();
        changeHeader('Title', ' ');
        expect(button('Save').disabled).toBe(true);
        changeHeader('Title', 'Name');
        expect(button('Save').disabled).toBe(false);
        toggle('Title');
        expect(button('Save').disabled).toBe(true);
    });

    it.each(['{', '[]', '{}', '{"Title":42}', '{"Title":""}'])('never overwrites invalid existing JSON: %s', async invalidJson => {
        value = invalidJson;
        mount();
        await open();
        expect(document.body.textContent).toContain('Correct the JSON textbox first');
        toggle('Title');
        expect(button('Save').disabled).toBe(true);
        act(() => { Simulate.click(button('Cancel')); });
        expect(value).toBe(invalidJson);
        expect(onSave).not.toHaveBeenCalled();
    });

    it('round-trips JSON-special field names and headers without losing their text', async () => {
        value = '{"__proto__":"Prototype","Title":"Title"}';
        mount(['__proto__', 'Title']);
        await open();
        changeHeader('Title', 'Name "quoted"; \u00c6');
        act(() => { Simulate.click(button('Save')); });
        expect(Object.entries(JSON.parse(value))).toEqual([['__proto__', 'Prototype'], ['Title', 'Name "quoted"; \u00c6']]);
    });
});
