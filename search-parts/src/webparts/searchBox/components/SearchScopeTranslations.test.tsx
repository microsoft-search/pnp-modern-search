jest.mock('CommonStrings', () => ({
    AdvancedSearch: { Translations: 'Translations', Language: 'Language', Label: 'Display label' },
    Controls: { TextDialogSaveButtonText: 'Save', TextDialogCancelButtonText: 'Cancel' }
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import SearchScopeTranslations from './SearchScopeTranslations';

describe('scope translations editor', () => {
    let host: HTMLDivElement;
    const mount = (element: React.ReactElement) => {
        act(() => { ReactDom.render(element, host); });
    };
    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });
    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });
    const button = (text: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(element => element.textContent === text);
    const changeLabel = (value: string) => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder="Title"]');
        input.value = value;
        Simulate.change(input, { target: input });
    };
    const openEditor = async () => {
        act(() => { Simulate.click(button('Translations')); });
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
    };

    it('edits a language, saves explicitly, and removes a cleared translation', async () => {
        const onSave = jest.fn();
        mount(<SearchScopeTranslations defaultLabel="Title" uiLanguage="da-DK"
            labels={{ 'DA-dk': 'Titel', 'en-US': 'Title' }} onSave={onSave} />);
        expect(host.textContent).toContain('Language: da-DK, en-US');
        await openEditor();
        const input = document.querySelector<HTMLInputElement>('input[placeholder="Title"]');
        expect(input.value).toBe('Titel');
        expect(button('da-DK: Titel')).toBeDefined();
        expect(button('en-US: Title')).toBeDefined();
        act(() => { Simulate.click(button('en-US: Title')); });
        expect(input.value).toBe('Title');
        act(() => { Simulate.click(button('da-DK: Titel')); });
        act(() => { changeLabel('Overskrift'); });
        expect(button('da-DK: Overskrift')).toBeDefined();
        expect(onSave).not.toHaveBeenCalled();
        act(() => { Simulate.click(button('Save')); });
        expect(onSave).toHaveBeenLastCalledWith({ 'da-dk': 'Overskrift', 'en-us': 'Title' });
        await openEditor();
        act(() => { changeLabel(''); });
        expect(button('da-DK: Titel')).toBeUndefined();
        act(() => { Simulate.click(button('Save')); });
        expect(onSave).toHaveBeenLastCalledWith({ 'en-us': 'Title' });
    });

    it('discards unsaved edits when cancelled', async () => {
        const onSave = jest.fn();
        mount(<SearchScopeTranslations defaultLabel="Title" uiLanguage="da-DK" onSave={onSave} />);
        await openEditor();
        act(() => { changeLabel('Titel'); });
        act(() => { Simulate.click(button('Cancel')); });
        expect(onSave).not.toHaveBeenCalled();
        await openEditor();
        expect(document.querySelector<HTMLInputElement>('input[placeholder="Title"]').value).toBe('');
    });
});
