import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import IconNamePicker from './IconNamePicker';

describe('icon name picker', () => {
    let host: HTMLDivElement;
    const options = ['Document', 'DocumentSearch', 'People'].map(name => ({ key: name, text: name }));

    beforeAll(() => initializeIcons());

    const mount = (value: string, onChange = jest.fn()) => {
        act(() => {
            ReactDom.render(
                <IconNamePicker
                    options={options}
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

    const typeText = (input: HTMLInputElement, text: string) => {
        for (const character of text) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            act(() => {
                input.value = input.value.slice(0, start) + character + input.value.slice(end);
                input.setSelectionRange(start + 1, start + 1);
                Simulate.input(input);
            });
        }
    };

    it('accumulates keyboard-open draft input without committing or replacing it', () => {
        const onChange = jest.fn();
        const input = mount('', onChange);
        openWithKeyboard(input);
        typeText(input, 'CustomIcon');
        expect(input.value).toBe('CustomIcon');
        expect(onChange).not.toHaveBeenCalled();
        act(() => { Simulate.keyDown(input, { key: 'Enter', which: 13 }); });
        expect(onChange).toHaveBeenLastCalledWith('CustomIcon');
    });

    it('filters catalog suggestions without inserting the draft as an option', () => {
        const input = mount('');
        openWithKeyboard(input);
        typeText(input, 'Docum');
        const names = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
            .map(option => option.querySelector('div > span').textContent);
        expect(names).toEqual(['Document', 'DocumentSearch']);
    });

    it('preserves custom configured values and exposes the localized accessible label', () => {
        const onChange = jest.fn();
        const input = mount('CustomRegisteredIcon', onChange);
        expect(input.value).toBe('CustomRegisteredIcon');
        expect(input.getAttribute('aria-label')).toBe('Fluent UI icon name');
        expect(onChange).not.toHaveBeenCalled();
    });

    it.each(['', 'Document'])('restores suggestions after Escape cancels a draft from "%s"', value => {
        const onChange = jest.fn();
        const input = mount(value, onChange);
        openWithKeyboard(input);
        typeText(input, 'CustomIcon');
        expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);

        act(() => { Simulate.keyDown(input, { key: 'Escape', which: 27 }); });
        expect(input.value).toBe(value);
        openWithKeyboard(input);

        const names = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
            .map(option => option.querySelector('div > span').textContent);
        expect(names).toEqual(value ? ['Document', 'DocumentSearch'] : options.map(option => option.text));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('commits clearing the optional icon on blur', () => {
        const onChange = jest.fn();
        const input = mount('Document', onChange);
        act(() => { input.focus(); });
        act(() => {
            input.value = '';
            Simulate.input(input);
        });
        act(() => { Simulate.blur(input, { relatedTarget: document.body }); });
        expect(onChange).toHaveBeenLastCalledWith('');
    });
});
