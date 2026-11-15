jest.mock('SearchFiltersWebPartStrings', () => ({
    PropertyPane: {
        DataFilterCollection: {
            RefinerCheckVerified: 'Verified',
            RefinerCheckUnknown: 'Not verified',
            RefinerCheckFailed: 'Check failed'
        }
    }
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { renderRefinerCheckOption } from './RefinerCheckOption';

describe('refiner check option', () => {
    let host: HTMLDivElement;

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);
    });

    afterEach(() => {
        act(() => { ReactDom.unmountComponentAtNode(host); });
        host.remove();
    });

    it.each([
        ['verified', 'Verified', 'CheckMark'],
        ['unknown', 'Not verified', 'Info'],
        ['failed', 'Check failed', 'ErrorBadge']
    ])('shows the %s status as an accessible icon with a hover label', (status, label, icon) => {
        act(() => {
            ReactDom.render(renderRefinerCheckOption(
                { key: 'Title', text: 'Title', data: status },
                option => <span>{option.text}</span>
            ), host);
        });
        expect(host.textContent).toBe('Title');
        const marker = host.querySelector('[role="img"]');
        expect(marker.getAttribute('title')).toBe(label);
        expect(marker.getAttribute('aria-label')).toBe(label);
        expect(marker.querySelector(`[data-icon-name="${icon}"]`)).not.toBeNull();
    });
});
