jest.mock('CommonStrings', () => ({
    Filters: { SearchPlaceholder: 'Search...' },
    General: { TagPickerStrings: { NoResultsSearchMessage: 'No results found' } }
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import IconNamePicker, { IIconNamePickerProps, loadIconNameOptions } from './IconNamePicker';

describe('icon name picker', () => {
    let host: HTMLDivElement;
    const options = ['Document', 'DocumentSearch', 'People'].map(name => ({ key: name, text: name }));

    beforeAll(() => initializeIcons());

    const mount = (value: string, onChange = jest.fn(), catalog: IIconNamePickerProps['options'] = options) => {
        act(() => {
            ReactDom.render(
                <IconNamePicker
                    options={catalog}
                    value={value}
                    placeholder="Document"
                    ariaLabel="Fluent UI icon name"
                    onChange={onChange}
                />,
                host
            );
        });
        return host.querySelector<HTMLInputElement>('input');
    };

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });

    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    const openWithKeyboard = (input: HTMLInputElement) => {
        act(() => {
            input.focus();
            Simulate.keyDown(input, { key: 'ArrowDown', which: 40, altKey: true });
        });
    };

    const changeText = (input: HTMLInputElement, text: string) => {
        act(() => {
            input.value = text;
            Simulate.change(input);
        });
    };

    const searchInput = () => document.querySelector<HTMLInputElement>('[role="dialog"] input');
    const optionNames = () => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
        .map(option => option.textContent.replace(/^[^\w]+/, ''));

    it('preserves freeform input until Enter commits it', () => {
        const onChange = jest.fn();
        const input = mount('', onChange);
        changeText(input, 'CustomIcon');
        expect(input.value).toBe('CustomIcon');
        expect(onChange).not.toHaveBeenCalled();
        act(() => { Simulate.keyDown(input, { key: 'Enter' }); });
        expect(onChange).toHaveBeenLastCalledWith('CustomIcon');
    });

    it('opens the full catalog independently of the selected icon and filters without committing', () => {
        const onChange = jest.fn();
        const input = mount('People', onChange);
        openWithKeyboard(input);
        expect(document.querySelector('[role="dialog"]').getAttribute('aria-label')).toBe('Fluent UI icon name');
        expect(searchInput().value).toBe('');
        expect(optionNames()).toEqual(options.map(option => option.text));
        changeText(searchInput(), '  dOcUm  ');
        expect(optionNames()).toEqual(['Document', 'DocumentSearch']);
        expect(input.value).toBe('People');
        expect(onChange).not.toHaveBeenCalled();
        changeText(searchInput(), '');
        expect(optionNames()).toEqual(options.map(option => option.text));
    });

    it('exposes the full icon catalog beyond the first 100 and allows selecting its final icon', async () => {
        const catalog = await loadIconNameOptions();
        const onChange = jest.fn();
        const input = mount('', onChange, catalog);
        openWithKeyboard(input);
        expect(catalog.length).toBeGreaterThan(100);
        expect(document.querySelector('[role="option"]').getAttribute('aria-setsize')).toBe(String(catalog.length));
        const lastIcon = catalog[catalog.length - 1].text;
        changeText(searchInput(), lastIcon);
        const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
            .find(element => element.textContent.includes(lastIcon));
        expect(option).toBeDefined();
        act(() => { Simulate.click(option); });
        expect(onChange).toHaveBeenLastCalledWith(lastIcon);
        expect(input.value).toBe(lastIcon);
        expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('preserves custom configured values and exposes the localized accessible label', () => {
        const onChange = jest.fn();
        const input = mount('CustomRegisteredIcon', onChange);
        expect(input.value).toBe('CustomRegisteredIcon');
        expect(input.getAttribute('aria-label')).toBe('Fluent UI icon name');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('shows localized feedback for no matches and Escape cancels the search without changing selection', () => {
        const onChange = jest.fn();
        const input = mount('Document', onChange);
        openWithKeyboard(input);
        changeText(searchInput(), 'MissingIcon');
        expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
        expect(document.querySelector('[role="status"]').textContent).toBe('No results found');
        act(() => { Simulate.keyDown(searchInput(), { key: 'Escape' }); });
        expect(document.querySelector('[role="dialog"]')).toBeNull();
        openWithKeyboard(input);
        expect(searchInput().value).toBe('');
        expect(optionNames()).toEqual(options.map(option => option.text));
        expect(input.value).toBe('Document');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('moves keyboard focus from search to the options with ArrowDown', () => {
        openWithKeyboard(mount(''));
        act(() => { Simulate.keyDown(searchInput(), { key: 'ArrowDown' }); });
        expect(document.activeElement.getAttribute('role')).toBe('option');
    });

    it('commits clearing the optional icon on blur', () => {
        const onChange = jest.fn();
        const input = mount('Document', onChange);
        changeText(input, '');
        act(() => { Simulate.blur(input, { relatedTarget: document.body }); });
        expect(onChange).toHaveBeenLastCalledWith('');
    });
});
