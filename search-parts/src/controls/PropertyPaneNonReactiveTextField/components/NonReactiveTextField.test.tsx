import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { NonReactiveTextField } from './NonReactiveTextField';

describe('NonReactiveTextField', () => {
    let host: HTMLDivElement;

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });

    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    it('displays imported values while preserving edits on unrelated refreshes', () => {
        const ref = React.createRef<NonReactiveTextField>();
        const onUpdate = jest.fn();
        const render = (value: string): void => {
            act(() => { ReactDom.render(<NonReactiveTextField ref={ref} defaultValue={value} onUpdate={onUpdate} />, host); });
        };
        render('old query');
        act(() => { ref.current._onChange(null, 'draft query'); });
        render('old query');
        expect(host.querySelector('input').value).toBe('draft query');
        render('imported query');
        expect(host.querySelector('input').value).toBe('imported query');
        expect(onUpdate).not.toHaveBeenCalled();
        act(() => { ref.current._onChange(null, 'edited query'); });
        act(() => { ref.current._onApply(); });
        expect(onUpdate).toHaveBeenCalledWith('edited query');
    });
});
