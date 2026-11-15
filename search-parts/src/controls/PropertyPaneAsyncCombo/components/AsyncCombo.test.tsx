import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { AsyncCombo } from './AsyncCombo';

describe('AsyncCombo initial options', () => {
    let host: HTMLDivElement;
    const render = (element: React.ReactElement): void => {
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

    it('accepts freeform input without loading, then refreshes options once when opened', async () => {
        const ref = React.createRef<AsyncCombo>();
        const onUpdate = jest.fn();
        const onLoadOptions = jest.fn().mockResolvedValue([{ key: 'Title', text: 'Title' }]);
        render(<AsyncCombo ref={ref} availableOptions={[{ key: 'Title', text: 'Title' }]}
            allowFreeform={true} loadOptionsOnFirstOpen={true} onLoadOptions={onLoadOptions} onUpdate={onUpdate} />);

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
        render(<AsyncCombo ref={ref} availableOptions={[{ key: 'Title', text: 'Title' }]}
            onLoadOptions={onLoadOptions} onUpdate={jest.fn()} />);
        await act(async () => { await ref.current.render().props.children[0].props.onMenuOpen(); });
        expect(onLoadOptions).not.toHaveBeenCalled();
    });

    it('does not add a saved value to another row of shared suggestions', async () => {
        const first = React.createRef<AsyncCombo>();
        const second = React.createRef<AsyncCombo>();
        const suggestions = [{ key: 'Title', text: 'Title' }];
        const onLoadOptions = jest.fn().mockResolvedValue(suggestions);
        render(<>
            <AsyncCombo ref={first} availableOptions={suggestions} defaultSelectedKey="Custom"
                loadOptionsOnFirstOpen={true} onLoadOptions={onLoadOptions} onUpdate={jest.fn()} />
            <AsyncCombo ref={second} availableOptions={suggestions} defaultSelectedKey="Title"
                loadOptionsOnFirstOpen={true} onLoadOptions={onLoadOptions} onUpdate={jest.fn()} />
        </>);
        await act(async () => { await first.current.render().props.children[0].props.onMenuOpen(); });
        await act(async () => { await second.current.render().props.children[0].props.onMenuOpen(); });
        expect(first.current.state.options.map(option => option.key)).toContain('Custom');
        expect(second.current.state.options.map(option => option.key)).toEqual(['Title']);
        expect(suggestions).toEqual([{ key: 'Title', text: 'Title' }]);
    });

    it('renders the loading indicator instead of passing it to a custom option renderer', () => {
        const ref = React.createRef<AsyncCombo>();
        const onRenderOption = jest.fn();
        render(<AsyncCombo ref={ref} availableOptions={[]} onUpdate={jest.fn()}
            onRenderOption={onRenderOption} />);
        const renderOption = ref.current.render().props.children[0].props.onRenderOption;
        expect(renderOption({ key: 'LOADING_ITEM', text: '' })).toBeTruthy();
        expect(onRenderOption).not.toHaveBeenCalled();
    });
});
