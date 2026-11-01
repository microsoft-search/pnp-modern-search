jest.mock('SearchFiltersWebPartStrings', () => ({
    PropertyPane: {
        DataFilterCollection: {
            FilterMaxBuckets: '# of values',
            FilterMaxBucketsWarning: 'The maximum number of values is 1000'
        }
    }
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import MaxBucketsEditor from './MaxBucketsEditor';

describe('MaxBucketsEditor', () => {
    let host: HTMLDivElement;
    const render = (element: React.ReactElement): void => {
        act(() => { ReactDom.render(element, host); });
    };
    const input = (): HTMLInputElement => host.querySelector<HTMLInputElement>('input[type="number"]');

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });

    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    it.each([100, 10])('shows %i as a hint without saving it', defaultMaxBuckets => {
        const onUpdate = jest.fn();
        render(<MaxBucketsEditor defaultMaxBuckets={defaultMaxBuckets} onUpdate={onUpdate} />);

        expect(input().value).toBe('');
        expect(input().placeholder).toBe(defaultMaxBuckets.toString());
        expect(input().getAttribute('aria-label')).toBe('# of values');
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('fits a four-digit explicit value and updates or clears it only on user input', () => {
        const onUpdate = jest.fn();
        render(<MaxBucketsEditor value={1000} defaultMaxBuckets={100} onUpdate={onUpdate} />);
        expect(input().value).toBe('1000');
        expect(getComputedStyle(host.querySelector<HTMLElement>('.ms-TextField')).minWidth).toBe('80px');
        expect(onUpdate).not.toHaveBeenCalled();

        input().value = '500';
        act(() => { Simulate.change(input(), { target: input() }); });
        expect(onUpdate).toHaveBeenLastCalledWith(500);

        input().value = '';
        act(() => { Simulate.change(input(), { target: input() }); });
        expect(onUpdate).toHaveBeenLastCalledWith(undefined);
    });

    it('leaves the hint blank for unknown defaults and disabled controls', () => {
        const onUpdate = jest.fn();
        render(<MaxBucketsEditor onUpdate={onUpdate} />);
        expect(input().placeholder).toBe('');

        render(<MaxBucketsEditor disabled={true} defaultMaxBuckets={100} onUpdate={onUpdate} />);
        expect(input().disabled).toBe(true);
        expect(input().placeholder).toBe('');
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('retains the warning for values above 1000', async () => {
        render(<MaxBucketsEditor value={1001} defaultMaxBuckets={100} onUpdate={jest.fn()} />);
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
        expect(host.textContent).toContain('The maximum number of values is 1000');
    });
});
