jest.mock('CommonStrings', () => ({
    Controls: { TextDialogSaveButtonText: 'Save', TextDialogCancelButtonText: 'Cancel' }
}), { virtual: true });
jest.mock('SearchFiltersWebPartStrings', () => ({
    PropertyPane: {
        DataFilterCollection: {
            AllowedEmailDomains: 'Allowed email domains',
            AllowedEmailDomainsPlaceholder: 'contoso.com; fabrikam.com',
            AllowedEmailDomainsButton: 'Domains ({0})',
            AllowedEmailDomainsDialogDescription: 'Only these domains',
            AllowedEmailDomainsNewDomain: 'Domain to add',
            AllowedEmailDomainsAdd: 'Add',
            AllowedEmailDomainsRemove: 'Remove {0}',
            AllowedEmailDomainsEmpty: 'No domains configured.',
            AllowedEmailDomainsInvalidEntry: 'Enter a valid domain.'
        }
    }
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import AllowedEmailDomainsEditor from './AllowedEmailDomainsEditor';

describe('AllowedEmailDomainsEditor', () => {
    let host: HTMLDivElement;
    const mount = (element: React.ReactElement): void => {
        act(() => { ReactDom.render(element, host); });
    };
    const button = (text: string): HTMLButtonElement | undefined =>
        Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(element => element.textContent === text);
    const removeButton = (domain: string): HTMLButtonElement | null =>
        document.querySelector<HTMLButtonElement>(`button[aria-label="Remove ${domain}"]`);
    const input = (): HTMLInputElement => document.querySelector<HTMLInputElement>('input[placeholder="contoso.com; fabrikam.com"]');
    const typeDomain = (value: string): void => {
        const element = input();
        element.value = value;
        act(() => { Simulate.change(element, { target: element }); });
    };
    const openEditor = async (text: string): Promise<void> => {
        act(() => { Simulate.click(button(text)); });
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
    };

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });
    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    it('lists, adds, removes and saves domains as a semicolon-separated string', async () => {
        const onSave = jest.fn();
        mount(<AllowedEmailDomainsEditor value="Contoso.com, fabrikam.com" onSave={onSave} />);
        await openEditor('Domains (2)');

        expect(document.body.textContent).toContain('contoso.com');
        expect(document.body.textContent).toContain('fabrikam.com');

        typeDomain('bad domain');
        act(() => { Simulate.click(button('Add')); });
        expect(input().getAttribute('aria-invalid')).toBe('true');
        expect(input().value).toBe('bad domain');

        typeDomain('Northwind.com; contoso.com');
        act(() => { Simulate.click(button('Add')); });
        expect(input().value).toBe('');
        expect(removeButton('northwind.com')).not.toBeNull();

        act(() => { Simulate.click(removeButton('fabrikam.com')); });
        expect(removeButton('fabrikam.com')).toBeNull();
        expect(onSave).not.toHaveBeenCalled();

        act(() => { Simulate.click(button('Save')); });
        expect(onSave).toHaveBeenCalledWith('contoso.com; northwind.com');
    });

    it('saves an empty string when all domains are removed and discards edits on cancel', async () => {
        const onSave = jest.fn();
        mount(<AllowedEmailDomainsEditor value="contoso.com" onSave={onSave} />);
        await openEditor('Domains (1)');
        act(() => { Simulate.click(removeButton('contoso.com')); });
        expect(document.body.textContent).toContain('No domains configured.');
        act(() => { Simulate.click(button('Cancel')); });
        expect(onSave).not.toHaveBeenCalled();

        await openEditor('Domains (1)');
        expect(removeButton('contoso.com')).not.toBeNull();
        act(() => { Simulate.click(removeButton('contoso.com')); });
        act(() => { Simulate.click(button('Save')); });
        expect(onSave).toHaveBeenCalledWith('');
    });

    it('blocks saving while a stored entry is invalid until it is removed', async () => {
        const onSave = jest.fn();
        mount(<AllowedEmailDomainsEditor value="contoso.com; *.bad" onSave={onSave} />);
        await openEditor('Domains (2)');
        expect(button('Save').disabled).toBe(true);
        act(() => { Simulate.click(removeButton('*.bad')); });
        expect(button('Save').disabled).toBe(false);
        act(() => { Simulate.click(button('Save')); });
        expect(onSave).toHaveBeenCalledWith('contoso.com');
    });

    it('saves valid domains still in the input without requiring Add', async () => {
        const onSave = jest.fn();
        mount(<AllowedEmailDomainsEditor value="contoso.com" onSave={onSave} />);
        await openEditor('Domains (1)');

        typeDomain('Northwind.com; CONTOSO.COM');
        act(() => { Simulate.click(button('Save')); });

        expect(onSave).toHaveBeenCalledWith('contoso.com; northwind.com');
    });

    it('keeps the dialog open when the input contains an invalid domain on Save', async () => {
        const onSave = jest.fn();
        mount(<AllowedEmailDomainsEditor value="contoso.com" onSave={onSave} />);
        await openEditor('Domains (1)');

        typeDomain('*.fabrikam.com');
        act(() => { Simulate.click(button('Save')); });

        expect(onSave).not.toHaveBeenCalled();
        expect(input().value).toBe('*.fabrikam.com');
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('disables the button for non-people templates', () => {
        mount(<AllowedEmailDomainsEditor value="" disabled={true} onSave={jest.fn()} />);
        expect(button('Domains (0)').disabled).toBe(true);
    });
});
