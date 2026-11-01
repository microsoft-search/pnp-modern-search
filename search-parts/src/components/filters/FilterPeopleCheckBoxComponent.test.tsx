let mockPickerProps: IPeoplePickerProps;
const mockPickerMount = jest.fn();
const mockClearSelectedPersons = jest.fn();

jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseWebComponent: class extends HTMLElement {},
    ExtensibilityConstants: { EVENT_FILTER_UPDATED: 'filter-updated' }
}));
jest.mock('@microsoft/sp-http', () => ({}));
jest.mock('@microsoft/sp-page-context', () => ({}));
jest.mock('../../helpers/TaxonomyHelper', () => ({
    TaxonomyHelper: {
        normalizeReadableLabelCandidate: (value: string) => value,
        extractTaxonomyLabel: () => '',
        extractClaimsLabel: () => '',
        isReadablePlainLabel: () => true,
        extractPersonLikeLabel: () => '',
        extractFirstReadablePipeSegment: () => '',
        decodeHexString: () => ''
    }
}));
jest.mock('SearchFiltersWebPartStrings', () => ({
    General: {
        StaticPeoplePicker: {
            SearchUsersPlaceholder: 'Search users',
            RemoveSelectedUserTitle: 'Remove {0}',
            UnverifiedDomainsWarning: 'Unverified people were kept.',
            DisallowedDomainsWarning: 'A disallowed person was removed.'
        }
    },
    PropertyPane: {
        DataFilterCollection: { AllowedEmailDomainsInvalid: 'Invalid domains.' }
    }
}), { virtual: true });
jest.mock('@fluentui/react', () => {
    const react = jest.requireActual<typeof import('react')>('react');
    return {
        Checkbox: () => null,
        ChoiceGroup: () => null,
        Spinner: () => null,
        SpinnerSize: { xSmall: 0 },
        Text: (props: { children: React.ReactNode }) => react.createElement('span', null, props.children),
        ThemeProvider: (props: { children: React.ReactNode }) => react.createElement(react.Fragment, null, props.children),
        getTheme: () => ({})
    };
});
jest.mock('@fluentui/react/lib/Button', () => {
    const react = jest.requireActual<typeof import('react')>('react');
    return {
        IconButton: (props: { ariaLabel: string; disabled: boolean; onClick: () => void }) =>
            react.createElement('button', { 'aria-label': props.ariaLabel, disabled: props.disabled, onClick: props.onClick })
    };
});
jest.mock('@fluentui/react/lib/MessageBar', () => {
    const react = jest.requireActual<typeof import('react')>('react');
    return {
        MessageBar: (props: { children: React.ReactNode }) => react.createElement('div', { role: 'alert' }, props.children),
        MessageBarType: { warning: 1, error: 2 }
    };
});
jest.mock('@pnp/spfx-controls-react/lib/PeoplePicker', () => {
    const react = jest.requireActual<typeof import('react')>('react');
    class PeoplePicker extends react.Component<IPeoplePickerProps> {
        public constructor(props: IPeoplePickerProps) {
            super(props);
            mockPickerMount();
        }
        public clearSelectedPersons(): void {
            mockClearSelectedPersons();
        }
        public render(): React.ReactElement {
            mockPickerProps = this.props;
            return react.createElement('div', { 'data-testid': 'people-picker' });
        }
    }
    return { PeoplePicker };
});

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import type { IPeoplePickerProps } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { FilterPeopleCheckBoxWebComponent, FilterPeopleTemplateComponent, IFilterPeopleTemplateProps } from './FilterPeopleCheckBoxComponent';

describe('static People picker domain restrictions', () => {
    let host: HTMLDivElement;
    let onChecked: jest.Mock;

    function props(overrides: Partial<IFilterPeopleTemplateProps> = {}): IFilterPeopleTemplateProps {
        return {
            staticPicker: true,
            instanceId: 'test-instance',
            filterName: 'Owner',
            isMulti: true,
            onChecked,
            ...overrides
        };
    }

    async function render(componentProps: IFilterPeopleTemplateProps): Promise<void> {
        await act(async () => {
            ReactDOM.render(<FilterPeopleTemplateComponent {...componentProps} />, host);
        });
        for (let attempt = 0; attempt < 20; attempt++) {
            if (mockPickerProps) {
                break;
            }
            await act(async () => {
                await Promise.resolve();
            });
        }
        expect(mockPickerProps).toBeDefined();
    }

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        globalThis.sessionStorage.clear();
        mockPickerProps = undefined;
        host = document.createElement('div');
        document.body.appendChild(host);
        onChecked = jest.fn();
    });

    afterEach(() => {
        act(() => { ReactDOM.unmountComponentAtNode(host); });
        host.remove();
        jest.useRealTimers();
    });

    it('keeps the existing picker behavior when no domains are configured', async () => {
        await render(props({
            selectedValues: [{ name: 'Alice', value: 'alice@contoso.com', selected: true }]
        }));

        expect(mockPickerProps.defaultSelectedUsers).toEqual(['alice@contoso.com/Alice']);
        expect(mockPickerProps.resultFilter).toBeUndefined();
        expect(host.querySelector('button')).toBeNull();
    });

    it('filters suggestions and adds allowed people without remounting the picker', async () => {
        await render(props({ allowedEmailDomains: 'contoso.com' }));
        const allowed = { text: 'Alice', secondaryText: 'alice@CONTOSO.com' };
        const other = { text: 'Bob', secondaryText: 'bob@fabrikam.com' };
        const missing = { text: 'No email' };
        const mounts = mockPickerMount.mock.calls.length;

        expect(mockPickerProps.resultFilter([allowed, other, missing])).toEqual([allowed]);
        act(() => { mockPickerProps.onChange([allowed]); });

        expect(onChecked).toHaveBeenCalledWith('Owner', [{
            name: 'Alice', value: 'alice@CONTOSO.com', selected: true
        }], false);
        expect(mockClearSelectedPersons).toHaveBeenCalledTimes(1);
        expect(host.querySelector('[aria-label="Remove Alice"]')).not.toBeNull();
        expect(mockPickerMount).toHaveBeenCalledTimes(mounts);
        expect(mockPickerProps.resultFilter([allowed, other])).toEqual([]);
    });

    it('retains multiple allowed selections made in the same React batch', async () => {
        await render(props({ allowedEmailDomains: 'contoso.com' }));
        const alice = { text: 'Alice', secondaryText: 'alice@contoso.com' };
        const bob = { text: 'Bob', secondaryText: 'bob@contoso.com' };

        act(() => {
            mockPickerProps.onChange([alice]);
            mockPickerProps.onChange([bob]);
        });

        expect(onChecked).toHaveBeenLastCalledWith('Owner', [
            { name: 'Alice', value: 'alice@contoso.com', selected: true },
            { name: 'Bob', value: 'bob@contoso.com', selected: true }
        ], false);
        expect(host.querySelector('[aria-label="Remove Alice"]')).not.toBeNull();
        expect(host.querySelector('[aria-label="Remove Bob"]')).not.toBeNull();
    });

    it('keeps only the first allowed selection in single-select mode when updates are batched', async () => {
        await render(props({ allowedEmailDomains: 'contoso.com', isMulti: false }));
        const alice = { text: 'Alice', secondaryText: 'alice@contoso.com' };
        const bob = { text: 'Bob', secondaryText: 'bob@contoso.com' };

        act(() => {
            mockPickerProps.onChange([alice]);
            mockPickerProps.onChange([bob]);
        });

        expect(onChecked).toHaveBeenCalledTimes(1);
        expect(onChecked).toHaveBeenCalledWith('Owner', [
            { name: 'Alice', value: 'alice@contoso.com', selected: true }
        ], false);
        expect(host.querySelector('[aria-label="Remove Alice"]')).not.toBeNull();
        expect(host.querySelector('[aria-label="Remove Bob"]')).toBeNull();
    });

    it('keeps restored display names without looking up an arbitrary matching user', async () => {
        await render(props({
            allowedEmailDomains: 'contoso.com',
            selectedValues: [{ name: 'Alex Smith', value: 'Alex Smith', selected: true }]
        }));

        expect(mockPickerProps.defaultSelectedUsers).toEqual([]);
        expect(host.textContent).toContain('Unverified people were kept.');
        expect(host.querySelector('[aria-label="Remove Alex Smith"]')).not.toBeNull();

        act(() => { mockPickerProps.onChange([{ text: 'Alice', secondaryText: 'alice@contoso.com' }]); });
        expect(onChecked).toHaveBeenLastCalledWith('Owner', [
            { name: 'Alex Smith', value: 'Alex Smith', selected: true },
            { name: 'Alice', value: 'alice@contoso.com', selected: true }
        ], false);

        act(() => {
            host.querySelector<HTMLButtonElement>('[aria-label="Remove Alex Smith"]').click();
        });
        expect(onChecked).toHaveBeenLastCalledWith('Owner', [
            { name: 'Alice', value: 'alice@contoso.com', selected: true },
            { name: 'Alex Smith', value: 'Alex Smith', selected: false }
        ], false);
        expect(host.textContent).not.toContain('Unverified people were kept.');
    });

    it('reconciles known disallowed selections while preserving allowed and unverifiable values', async () => {
        await render(props({
            allowedEmailDomains: 'contoso.com',
            selectedValues: [
                { name: 'Alice', value: 'alice@contoso.com', selected: true },
                { name: 'Bob', value: 'bob@fabrikam.com', selected: true },
                { name: 'Alex Smith', value: 'Alex Smith', selected: true }
            ]
        }));

        expect(host.querySelector('[aria-label="Remove Bob"]')).toBeNull();
        expect(host.textContent).toContain('A disallowed person was removed.');
        expect(host.textContent).toContain('Unverified people were kept.');
        act(() => { jest.advanceTimersByTime(0); });
        expect(onChecked).toHaveBeenCalledWith('Owner', [
            { name: 'Alice', value: 'alice@contoso.com', selected: true },
            { name: 'Alex Smith', value: 'Alex Smith', selected: true },
            { name: 'Bob', value: 'bob@fabrikam.com', selected: false }
        ], true);
    });

    it('remounts the picker when the normalized domain list changes, not when it is reordered', async () => {
        await render(props({ allowedEmailDomains: 'contoso.com; fabrikam.com' }));
        const mounts = mockPickerMount.mock.calls.length;
        await render(props({ allowedEmailDomains: 'FABRIKAM.COM, contoso.com' }));
        expect(mockPickerMount).toHaveBeenCalledTimes(mounts);

        await render(props({ allowedEmailDomains: 'fabrikam.com' }));
        expect(mockPickerMount).toHaveBeenCalledTimes(mounts + 1);
    });

    it('reconciles an existing selection when a new domain restriction is enabled', async () => {
        const selectedValues = [{ name: 'Bob', value: 'bob@fabrikam.com', selected: true }];
        await render(props({ selectedValues }));
        expect(mockPickerProps.defaultSelectedUsers).toEqual(['bob@fabrikam.com/Bob']);

        await render(props({ selectedValues, allowedEmailDomains: 'contoso.com' }));
        act(() => { jest.advanceTimersByTime(0); });

        expect(host.querySelector('[aria-label="Remove Bob"]')).toBeNull();
        expect(onChecked).toHaveBeenLastCalledWith('Owner', [
            { name: 'Bob', value: 'bob@fabrikam.com', selected: false }
        ], true);
    });

    it('disables invalid settings without discarding restored selections', async () => {
        await render(props({
            allowedEmailDomains: '*.contoso.com',
            selectedValues: [{ name: 'Alice', value: 'alice@contoso.com', selected: true }]
        }));

        expect(mockPickerProps.disabled).toBe(true);
        expect(mockPickerProps.resultFilter([{ secondaryText: 'alice@contoso.com' }])).toEqual([]);
        expect(host.textContent).toContain('Invalid domains.');
        expect(host.querySelector('[aria-label="Remove Alice"]')).not.toBeNull();
        act(() => { jest.advanceTimersByTime(0); });
        expect(onChecked).not.toHaveBeenCalled();
    });

    it('reenables a single-value picker after an unverified selection is cleared externally', async () => {
        await render(props({
            allowedEmailDomains: 'contoso.com',
            isMulti: false,
            selectedValues: [{ name: 'Alex Smith', value: 'Alex Smith', selected: true }]
        }));
        expect(mockPickerProps.disabled).toBe(true);

        await render(props({ allowedEmailDomains: 'contoso.com', isMulti: false, selectedValues: [] }));
        expect(mockPickerProps.disabled).toBe(false);
        expect(host.textContent).not.toContain('Unverified people were kept.');
        expect(host.querySelector('button')).toBeNull();
    });

    it('observes domain configuration and warning attributes', () => {
        expect(FilterPeopleCheckBoxWebComponent.observedAttributes).toEqual(expect.arrayContaining([
            'data-allowed-email-domains',
            'data-domain-selection-removed'
        ]));
    });
});
