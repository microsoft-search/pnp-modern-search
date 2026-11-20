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

describe('Hierarchical refiner selection pill format', () => {
    const rootId = '11111111-1111-1111-1111-111111111111';
    const aId = '22222222-2222-2222-2222-222222222222';
    const bId = '33333333-3333-3333-3333-333333333333';
    const aLeafId = '44444444-4444-4444-4444-444444444444';
    const bLeafId = '55555555-5555-5555-5555-555555555555';
    const hierarchicalTerms = [{
        id: rootId, label: 'Root', children: [
            { id: aId, label: 'A', children: [{ id: aLeafId, label: '123' }] },
            { id: bId, label: 'B', children: [{ id: bLeafId, label: '123' }] }
        ]
    }];

    it.each([
        [undefined, bLeafId, '123', 'B:123'],
        [true, bLeafId, 'B:123', 'A:123'],
        [true, rootId, 'Root', ':Root']
    ])('formats only the selection pill (enabled: %s, selected ID: %s)', (showParentInSelectionPill, id, expectedLabel, unexpectedLabel) => {
        const rendered = renderWithFilter({
            termSetId,
            hierarchicalTerms,
            showParentInSelectionPill,
            values: [{ name: id === rootId ? 'Root' : '123', value: `GP0|#${id}`, selected: true }]
        });

        const pillContainer = React.Children.toArray(rendered.props.children)[1] as React.ReactElement;
        const [pill] = React.Children.toArray(pillContainer.props.children) as React.ReactElement[];
        const [label, clearButton] = React.Children.toArray(pill.props.children) as React.ReactElement[];
        expect(label.props.children).toBe(expectedLabel);
        expect(clearButton.props.ariaLabel).toBe(`Clear ${expectedLabel}`);
        expect(elementContainsText(rendered, unexpectedLabel)).toBe(false);
    });
});
