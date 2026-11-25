import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { AsyncCombo } from './AsyncCombo';
import { checkRefinerSchemaOptions, checkSortSchemaOptions } from '../../../helpers/ManagedPropertySchema';

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

    it.each([
        ['refiner', checkRefinerSchemaOptions, 'FileType', 'AuthorOWSUSER'],
        ['sort', checkSortSchemaOptions, 'Author', 'FileType']
    ])('shows only validated %s suggestions without changing saved or freeform values', async (_label, checkOptions, valid, saved) => {
        const ref = React.createRef<AsyncCombo>();
        const onUpdate = jest.fn();
        const options = [{ key: saved, text: saved }, { key: valid, text: valid }, { key: '[rank]', text: '[rank]' }];
        render(<AsyncCombo ref={ref} availableOptions={[]} allowFreeform={true}
            defaultSelectedKey={saved} textDisplayValue={saved} addUnlistedSingleValueToOptions={false}
            loadOptionsOnFirstOpen={true} onLoadOptions={async () => checkOptions(options)}
            onUpdate={onUpdate} />);

        await act(async () => { await ref.current.render().props.children[0].props.onMenuOpen(); });
        expect(ref.current.state.textDisplayValue).toBe(saved);
        expect(ref.current.state.options.map(option => option.key)).toEqual([valid]);
        act(() => { host.querySelector('button').click(); });
        const displayedOptions = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
            .map(element => element.textContent);
        expect(displayedOptions.some(text => text.includes(valid))).toBe(true);
        expect(displayedOptions.some(text => text.includes(saved) || text.includes('[rank]'))).toBe(false);
        expect(onUpdate).not.toHaveBeenCalled();
        await act(async () => { await ref.current.onChange(null, undefined, undefined, 'Custom'); });
        expect(onUpdate).toHaveBeenCalledWith({ key: 'Custom', text: 'Custom' });
        expect(ref.current.state.options.map(option => option.key)).toEqual([valid]);
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

    it('updates imported selections and keeps them selectable when options change', () => {
        const ref = React.createRef<AsyncCombo>();
        const onUpdate = jest.fn();
        render(<AsyncCombo ref={ref} availableOptions={[{ key: 'Title', text: 'Title' }]}
            defaultSelectedKeys={['Title']} allowMultiSelect={true} onUpdate={onUpdate} />);
        render(<AsyncCombo ref={ref} availableOptions={[{ key: 'Path', text: 'Path' }]}
            defaultSelectedKeys={['Path', 'Custom']} allowMultiSelect={true} onUpdate={onUpdate} />);
        expect(ref.current.state.selectedOptionKeys).toEqual(['Path', 'Custom']);
        expect(ref.current.state.textDisplayValue).toBe('Path,Custom');
        expect(ref.current.state.options.map(option => option.key)).toEqual(['Path', 'Custom']);
        expect(onUpdate).not.toHaveBeenCalled();

        render(<AsyncCombo ref={ref} availableOptions={[{ key: 'Path', text: 'Path' }]}
            defaultSelectedKeys={[]} allowMultiSelect={true} onUpdate={onUpdate} />);
        expect(ref.current.state.selectedOptionKeys).toEqual([]);
        expect(ref.current.state.textDisplayValue).toBe('');
    });

    it('loads asynchronous options after importing an unknown selection and retains it', async () => {
        const ref = React.createRef<AsyncCombo>();
        const onUpdate = jest.fn();
        const onLoadOptions = jest.fn().mockResolvedValue([{ key: 'Path', text: 'Path' }]);
        const renderSelection = (keys: string[], options: { key: string; text: string }[]): void => {
            render(<AsyncCombo ref={ref} availableOptions={options} defaultSelectedKeys={keys}
                allowMultiSelect={true} onLoadOptions={onLoadOptions} onUpdate={onUpdate} />);
        };
        renderSelection([], []);
        renderSelection(['Custom'], []);
        await act(async () => { await ref.current.render().props.children[0].props.onMenuOpen(); });
        expect(onLoadOptions).toHaveBeenCalledTimes(1);
        expect(ref.current.state.options.map(option => option.key)).toEqual(['Custom', 'Path']);

        renderSelection(['Custom'], [{ key: 'Path', text: 'Path' }]);
        await act(async () => { await ref.current.onChangeMulti(null, { key: 'Path', text: 'Path', selected: true }); });
        expect(onUpdate).toHaveBeenCalledWith([{ key: 'Path', text: 'Path' }, { key: 'Custom', text: 'Custom' }]);
    });

    it('clears a single selection when its default changes to empty', () => {
        const ref = React.createRef<AsyncCombo>();
        render(<AsyncCombo ref={ref} availableOptions={[]} defaultSelectedKey="Old" onUpdate={jest.fn()} />);
        render(<AsyncCombo ref={ref} availableOptions={[]} defaultSelectedKey="" onUpdate={jest.fn()} />);
        expect(ref.current.state.textDisplayValue).toBe('');
    });
});
