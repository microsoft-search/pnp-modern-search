import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { AsyncCombo } from './AsyncCombo';

describe('AsyncCombo initial options', () => {
    let host: HTMLDivElement;

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });

    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    it('accepts freeform input without loading, then refreshes options once when opened', async () => {
        const ref = React.createRef<AsyncCombo>();
        const onUpdate = jest.fn();
        const onLoadOptions = jest.fn().mockResolvedValue([{ key: 'Title', text: 'Title' }]);
        act(() => {
            ReactDom.render(<AsyncCombo ref={ref} availableOptions={[{ key: 'Title', text: 'Title' }]}
                allowFreeform={true} loadOptionsOnFirstOpen={true} onLoadOptions={onLoadOptions} onUpdate={onUpdate} />, host);
        });

        await act(async () => { await ref.current.onChange(null, undefined, undefined, 'Custom'); });
        expect(onUpdate).toHaveBeenCalledWith({ key: 'Custom', text: 'Custom' });
        expect(onLoadOptions).not.toHaveBeenCalled();

        await act(async () => { await ref.current.render().props.children[0].props.onMenuOpen(); });
        await act(async () => { await ref.current.render().props.children[0].props.onMenuOpen(); });
        expect(onLoadOptions).toHaveBeenCalledTimes(1);
        expect(ref.current.state.options).toEqual([{ key: 'Title', text: 'Title' }]);
    });

    it('retains existing behavior when first-open loading is not requested', async () => {
        const ref = React.createRef<AsyncCombo>();
        const onLoadOptions = jest.fn();
        act(() => {
            ReactDom.render(<AsyncCombo ref={ref} availableOptions={[{ key: 'Title', text: 'Title' }]}
                onLoadOptions={onLoadOptions} onUpdate={jest.fn()} />, host);
        });
        await act(async () => { await ref.current.render().props.children[0].props.onMenuOpen(); });
        expect(onLoadOptions).not.toHaveBeenCalled();
    });

    it('renders the loading indicator instead of passing it to a custom option renderer', () => {
        const ref = React.createRef<AsyncCombo>();
        const onRenderOption = jest.fn();
        act(() => {
            ReactDom.render(<AsyncCombo ref={ref} availableOptions={[]} onUpdate={jest.fn()}
                onRenderOption={onRenderOption} />, host);
        });
        const renderOption = ref.current.render().props.children[0].props.onRenderOption;
        expect(renderOption({ key: 'LOADING_ITEM', text: '' })).toBeTruthy();
        expect(onRenderOption).not.toHaveBeenCalled();
    });
});
