jest.mock('./PaginationComponent.module.scss', () => ({}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({ BaseWebComponent: class {} }));
jest.mock('CommonStrings', () => ({
    Layouts: { Slider: { PreviousPageLabel: 'Previous page', NextPageLabel: 'Next page', NextLabel: 'Next' } }
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { initializeIcons } from '@fluentui/react';
import { PaginationComponent, IPaginationComponentProps } from './PaginationComponent';

describe('PaginationComponent', () => {
    let container: HTMLDivElement;
    let props: IPaginationComponentProps;

    beforeAll(() => initializeIcons());

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        props = {
            totalItems: '20',
            itemsCountPerPage: '1',
            currentItemsCount: '1',
            currentPageNumber: '1',
            hideFirstLastPages: false,
            hideNavigation: false,
            hideDisabled: true,
            pageLinks: undefined,
            onPageUpdate: jest.fn()
        };
    });

    afterEach(() => {
        act(() => { ReactDOM.unmountComponentAtNode(container); });
        container.remove();
    });

    const render = (overrides: Partial<IPaginationComponentProps> = {}): void => {
        props = { ...props, ...overrides };
        act(() => { ReactDOM.render(React.createElement(PaginationComponent, props), container); });
    };

    const click = (label: string): void => {
        const button = Array.from(container.querySelectorAll('button')).find(element =>
            element.getAttribute('aria-label') === label || element.textContent === label);
        expect(button).toBeDefined();
        act(() => { button.click(); });
    };

    it('shows only Next on page one', () => {
        render();
        expect(container.querySelector('.ms-Button-label')).toBeNull();
        expect(container.querySelector('[aria-current="page"]')).toBeNull();
        expect(container.textContent).toContain('Next');
        expect(container.querySelectorAll('button')).toHaveLength(1);
        expect(container.querySelector('button').getAttribute('aria-label')).toBe('Next page');
        expect(container.querySelectorAll('a[aria-label^="Go to page"]')).toHaveLength(0);
        click('Next page');
        expect(props.onPageUpdate).toHaveBeenCalledWith(2, undefined, []);
    });

    it.each(['0', '1', '20', '1000000'])('ignores estimated total %s on a full page', totalItems => {
        render({ totalItems, currentPageNumber: '20', hideNavigation: true });
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('20');
        expect(container.querySelectorAll('button')).toHaveLength(2);
        click('Next page');
        expect(props.onPageUpdate).toHaveBeenCalledWith(21, undefined, []);
    });

    it('shows the current page and both arrows after page one', () => {
        render({ currentPageNumber: '2' });
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('2');
        expect(container.querySelectorAll('button')).toHaveLength(2);
        expect(container.textContent).not.toContain('Next');
        click('Previous page');
        expect(props.onPageUpdate).toHaveBeenCalledWith(1, undefined, []);
    });

    it.each(['0', '4'])('keeps Previous but removes Next for a page with %s of 10 items', currentItemsCount => {
        render({ currentPageNumber: '3', itemsCountPerPage: '10', currentItemsCount });
        expect(container.querySelectorAll('button')).toHaveLength(1);
        expect(container.querySelector('button').getAttribute('aria-label')).toBe('Previous page');
        click('Previous page');
        expect(props.onPageUpdate).toHaveBeenCalledWith(2, undefined, []);
    });

    it('does not show navigation for an empty first page', () => {
        render({ currentItemsCount: '0' });
        expect(container.querySelectorAll('button')).toHaveLength(0);
        expect(container.textContent).toBe('');
    });

    it('uses page links rather than page fullness when supplied', () => {
        render({ currentItemsCount: '0', pageLinks: ['first', 'second'] });
        click('Next page');
        expect(props.onPageUpdate).toHaveBeenCalledWith(2, 'second', ['first', 'second']);
        expect(container.querySelectorAll('button')).toHaveLength(1);
        click('Previous page');
        expect(props.onPageUpdate).toHaveBeenCalledWith(1, 'first', ['first', 'second']);
    });

    it('does not show Next when no page links are available', () => {
        render({ pageLinks: [] });
        expect(container.querySelectorAll('button')).toHaveLength(0);
    });

    it('synchronizes the current page when changed by query or browser navigation', () => {
        render({ currentPageNumber: '3' });
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('3');
        render({ currentPageNumber: '1' });
        expect(container.querySelector('[aria-current="page"]')).toBeNull();
        expect(container.querySelectorAll('button')).toHaveLength(1);
    });

    it('allows legacy custom templates without current item counts to navigate', () => {
        render({ currentItemsCount: undefined });
        click('Next page');
        expect(props.onPageUpdate).toHaveBeenCalledWith(2, undefined, []);
    });

    it('restores numbered pagination when explicitly enabled', () => {
        render({ hidePageNumbers: false, range: '5' });
        expect(container.querySelectorAll('a')).toHaveLength(7);
        const secondPage = container.querySelector('a[aria-label="Go to page number 2"]') as HTMLAnchorElement;
        expect(secondPage).not.toBeNull();
        act(() => { secondPage.click(); });
        expect(props.onPageUpdate).toHaveBeenCalledWith(2, undefined, []);
    });
});
