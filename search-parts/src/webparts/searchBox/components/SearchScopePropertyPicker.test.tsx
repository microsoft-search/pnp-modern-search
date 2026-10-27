jest.mock('CommonStrings', () => ({ AdvancedSearch: { Property: 'Queryable managed property' } }), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import SearchScopePropertyPicker from './SearchScopePropertyPicker';

describe('scope property picker', () => {
    let host: HTMLDivElement;
    const mount = (properties: string[], onChange = jest.fn()) => {
        act(() => { ReactDom.render(<SearchScopePropertyPicker properties={properties} value="Title" onChange={onChange} />, host); });
    };
    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });
    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    it('offers only the supplied Selected Properties and commits a selected property', async () => {
        const onChange = jest.fn();
        mount(['Title', 'RefinableString00'], onChange);
        act(() => { Simulate.click(host.querySelector('button')); });
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
        const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
        expect(options.map(option => option.textContent)).toEqual(['Title', 'RefinableString00']);
        act(() => { Simulate.click(options[1]); });
        expect(onChange).toHaveBeenCalledWith('RefinableString00');
    });

    it('preserves a previously configured property when no Results source supplies choices', () => {
        mount([]);
        expect(host.querySelector<HTMLInputElement>('input').value).toBe('Title');
    });
});
