jest.mock('CommonStrings', () => ({
    Filters: {
        LoadingMessage: 'Loading...',
        FilterNoValuesMessage: 'No values for this filter',
        SearchPlaceholder: 'Search...',
        ClearAllFiltersButtonLabel: 'Clear'
    }
}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseWebComponent: class {},
    FilterComparisonOperator: { Eq: 0 },
    ExtensibilityConstants: {}
}));
jest.mock('./FilterHierarchicalComponent.module.scss', () => ({}));

import * as React from 'react';
import { FilterHierarchicalComponent } from './FilterHierarchicalComponent';

const termSetId = 'termset-1';

function hierarchy(): any[] {
    return [{
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Europe',
        label: 'Europe',
        parentId: '',
        pathOfTerm: 'Europe',
        children: []
    }];
}

function elementContainsText(element: any, text: string): boolean {
    if (element === null || element === undefined || typeof element === 'boolean') {
        return false;
    }
    if (typeof element === 'string' || typeof element === 'number') {
        return `${element}`.includes(text);
    }
    if (Array.isArray(element)) {
        return element.some(child => elementContainsText(child, text));
    }
    const children = element.props?.children;
    return elementContainsText(children, text);
}

function renderWithFilter(filter: any): React.ReactElement {
    const component = new FilterHierarchicalComponent({ filter } as any);
    return component.render();
}

describe('FilterHierarchicalComponent empty-hierarchy render branch (issue #5060)', () => {

    it('shows the loading message when no hierarchy has been provided yet', () => {
        const rendered = renderWithFilter({ termSetId, hideNodesNotInDataSet: true });
        expect(elementContainsText(rendered, 'Loading...')).toBe(true);
        expect(elementContainsText(rendered, 'No values for this filter')).toBe(false);
    });

    it('shows the loading message while result signals are pending even with an explicitly empty hierarchy', () => {
        const rendered = renderWithFilter({
            termSetId,
            hideNodesNotInDataSet: true,
            isAwaitingResultSignals: true,
            hierarchicalTerms: []
        });
        expect(elementContainsText(rendered, 'Loading...')).toBe(true);
        expect(elementContainsText(rendered, 'No values for this filter')).toBe(false);
    });

    it('shows the no-values message for a settled explicitly empty hierarchy', () => {
        const rendered = renderWithFilter({
            termSetId,
            hideNodesNotInDataSet: true,
            isAwaitingResultSignals: false,
            hierarchicalTerms: [],
            values: []
        });
        expect(elementContainsText(rendered, 'No values for this filter')).toBe(true);
        expect(elementContainsText(rendered, 'Loading...')).toBe(false);
    });

    it('shows the no-values message even when retained UI values are present', () => {
        // filter.values can retain entries (e.g. unchecked selectedOnce values) while the
        // settled hierarchy is empty: this must not fall back to a perpetual loading state
        const rendered = renderWithFilter({
            termSetId,
            hideNodesNotInDataSet: true,
            isAwaitingResultSignals: false,
            hierarchicalTerms: [],
            values: [{ name: 'Lyon', value: 'Lyon', selected: false, selectedOnce: true }]
        });
        expect(elementContainsText(rendered, 'No values for this filter')).toBe(true);
        expect(elementContainsText(rendered, 'Loading...')).toBe(false);
    });

    it('renders the term tree when a non-empty hierarchy is provided', () => {
        const rendered = renderWithFilter({
            termSetId,
            hideNodesNotInDataSet: true,
            isAwaitingResultSignals: false,
            hierarchicalTerms: hierarchy(),
            values: []
        });
        expect(elementContainsText(rendered, 'Loading...')).toBe(false);
        expect(elementContainsText(rendered, 'No values for this filter')).toBe(false);
    });
});
