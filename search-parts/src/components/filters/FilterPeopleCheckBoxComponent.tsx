import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Checkbox, ChoiceGroup, ICheckboxProps, IChoiceGroupOption, ITheme, Spinner, SpinnerSize, Text, getTheme } from '@fluentui/react';
import { IPersonaProps } from '@fluentui/react/lib/Persona';
import { MSGraphClientFactory, SPHttpClient } from '@microsoft/sp-http';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { PageContext } from '@microsoft/sp-page-context';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import * as webPartStrings from 'SearchFiltersWebPartStrings';
import { TaxonomyHelper } from '../../helpers/TaxonomyHelper';

export interface IFilterPeopleTemplateProps {

    /**
     * If the People template should be selected
     */
    selected?: boolean;

    /**
     * If the People template should be disabled
     */
    disabled?: boolean;

    /**
     * The count for this filter value
     */
    count?: number;

    /**
     * The filter value to display
     */
    name?: string;

    /**
     * The value to use when selected
     */
    value?: string;

    /**
     * The filter name where belong the value
     */
    filterName?: string;

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * Indicate if the filter is configured as multi values
     */
    isMulti?: boolean;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Enables static people picker mode (tenant users suggestions)
     */
    staticPicker?: boolean | string;

    /**
     * Serialized selected values for static people picker mode
     */
    selectedValues?: string | Array<{ name?: string; value?: string; selected?: boolean }>;

    /**
     * SPFx context used by the tenant-wide PeoplePicker
     */
    peoplePickerContext?: IPeoplePickerContext;

    /**
     * Handler when a filter value is selected
     */
    onChecked: (filterName: string, filterValue: IDataFilterValueInfo | IDataFilterValueInfo[]) => void;
}

export interface IFilterPeopleTemplateState {
    isSelectionInProgress: boolean;
    pickerSelectedPeople: IPersonaProps[];
}

export class FilterPeopleTemplateComponent extends React.Component<IFilterPeopleTemplateProps, IFilterPeopleTemplateState> {
    private static readonly SELECTION_FEEDBACK_DURATION_MS = 2500;
    private static readonly GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';
    private selectionFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

    private _setImmediateProgressCursor(): void {
        if (!globalThis.document) {
            return;
        }

        if (globalThis.document.documentElement) {
            globalThis.document.documentElement.style.setProperty('cursor', 'progress', 'important');
        }

        if (globalThis.document.body) {
            globalThis.document.body.style.setProperty('cursor', 'progress', 'important');
        }

        const styleId = FilterPeopleTemplateComponent.GLOBAL_BUSY_CURSOR_STYLE_ID;
        if (!globalThis.document.getElementById(styleId)) {
            const styleElement = globalThis.document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = '* { cursor: progress !important; }';
            globalThis.document.head.appendChild(styleElement);
        }
    }

    private readonly _renderCheckboxLabel = (props?: ICheckboxProps): JSX.Element => {
        const checkboxLabel = `${props?.label ?? ''}`;
        return <Text block nowrap styles={{ root: { color: this.props.themeVariant?.isInverted ? this.props.themeVariant?.semanticColors?.bodyText ?? '#323130' : this.props.themeVariant?.semanticColors?.inputText ?? '#323130' } }} title={checkboxLabel}>{checkboxLabel}</Text>;
    }

    public constructor(props: IFilterPeopleTemplateProps) {
        super(props);

        let selectedPeople: IPersonaProps[] = [];

        if (this.isStaticPickerMode()) {
            selectedPeople = this.parseSelectedPeopleFromProps();
        }

        this.state = {
            isSelectionInProgress: false,
            pickerSelectedPeople: selectedPeople
        };
    }

    public componentDidMount(): void {
        this.restoreSelectionFeedback();
    }

    public componentDidUpdate(prevProps: IFilterPeopleTemplateProps): void {
        if (!this.isStaticPickerMode()) {
            return;
        }

        if (prevProps.selectedValues === this.props.selectedValues) {
            return;
        }

        const nextSelectedPeople = this.parseSelectedPeopleFromProps();
        this.setState({
            pickerSelectedPeople: nextSelectedPeople
        });
    }

    public componentWillUnmount(): void {
        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
            this.selectionFeedbackTimer = null;
        }
    }

    private readonly getSelectionFeedbackStorageKey = (): string => {
        const instanceId = `${this.props.instanceId ?? ''}`;
        const filterName = `${this.props.filterName ?? ''}`;
        const filterValue = `${this.props.value ?? ''}`;
        return `pnp-modern-search:people-filter-feedback:${instanceId}:${filterName}:${filterValue}`;
    }

    private readonly readSelectionFeedbackTimestamp = (): number => {
        try {
            const value = globalThis.sessionStorage.getItem(this.getSelectionFeedbackStorageKey());
            const timestamp = Number(value);
            return Number.isFinite(timestamp) ? timestamp : 0;
        } catch {
            return 0;
        }
    }

    private readonly writeSelectionFeedbackTimestamp = (timestamp: number): void => {
        try {
            globalThis.sessionStorage.setItem(this.getSelectionFeedbackStorageKey(), `${timestamp}`);
        } catch {
            // Ignore storage errors
        }
    }

    private readonly clearSelectionFeedbackTimestamp = (): void => {
        try {
            globalThis.sessionStorage.removeItem(this.getSelectionFeedbackStorageKey());
        } catch {
            // Ignore storage errors
        }
    }

    private readonly restoreSelectionFeedback = (): void => {
        const startedAt = this.readSelectionFeedbackTimestamp();
        if (!startedAt) {
            return;
        }

        const elapsed = Date.now() - startedAt;
        const remainingMs = FilterPeopleTemplateComponent.SELECTION_FEEDBACK_DURATION_MS - elapsed;

        if (remainingMs <= 0) {
            this.clearSelectionFeedbackTimestamp();
            return;
        }

        this.setState({ isSelectionInProgress: true });

        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
        }

        this.selectionFeedbackTimer = setTimeout(() => {
            this.selectionFeedbackTimer = null;
            this.clearSelectionFeedbackTimestamp();
            this.setState({ isSelectionInProgress: false });
        }, remainingMs);
    }

    private readonly beginSelectionFeedback = (): void => {
        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
        }

        this.writeSelectionFeedbackTimestamp(Date.now());
        this.setState({ isSelectionInProgress: true });

        this.selectionFeedbackTimer = setTimeout(() => {
            this.selectionFeedbackTimer = null;
            this.clearSelectionFeedbackTimestamp();
            this.setState({ isSelectionInProgress: false });
        }, FilterPeopleTemplateComponent.SELECTION_FEEDBACK_DURATION_MS);
    }

    private isStaticPickerMode(): boolean {
        return `${this.props.staticPicker ?? ''}`.toLowerCase() === 'true';
    }

    private isMultiSelectionMode(): boolean {
        const rawValue = this.props.isMulti as unknown as boolean | string | undefined;

        if (typeof rawValue === 'string') {
            return rawValue.toLowerCase() === 'true';
        }

        return !!rawValue;
    }

    private parseSelectedPeopleFromProps(): IPersonaProps[] {
        if (!this.props.selectedValues) {
            return this.parseSelectedPeopleFromDeepLink();
        }

        try {
            let selectedValues: Array<{ name?: string; value?: string; selected?: boolean }> = [];
            const rawSelectedValues = this.props.selectedValues;

            if (Array.isArray(rawSelectedValues)) {
                selectedValues = rawSelectedValues;
            } else if (typeof rawSelectedValues === 'string') {
                try {
                    selectedValues = JSON.parse(rawSelectedValues) as Array<{ name?: string; value?: string; selected?: boolean }>;
                } catch {
                    // Handle HTML-escaped JSON payloads coming from template attributes.
                    const decodedPayload = rawSelectedValues
                        .replaceAll('&amp;', '&')
                        .replaceAll('&quot;', '"')
                        .replaceAll('&#34;', '"')
                        .replaceAll('&apos;', "'")
                        .replaceAll('&#39;', "'");
                    selectedValues = JSON.parse(decodedPayload) as Array<{ name?: string; value?: string; selected?: boolean }>;
                }
            }

            if (!Array.isArray(selectedValues)) {
                return this.parseSelectedPeopleFromDeepLink();
            }

            const selectedPeople = selectedValues
                .filter(value => value?.selected === true || `${value?.selected ?? ''}`.toLowerCase() === 'true')
                .map(value => {
                    const displayName = this._resolveDisplayLabel(value.name, value.value);
                    return {
                        text: displayName,
                        secondaryText: value.value,
                        optionalText: value.value
                    };
                });

            // If selectedValues is provided, trust it as the source of truth even when empty.
            // Falling back to deep link here can resurrect stale selections after deselection.
            return selectedPeople;
        } catch {
            return this.parseSelectedPeopleFromDeepLink();
        }
    }

    private parseSelectedPeopleFromDeepLink(): IPersonaProps[] {
        try {
            const instanceId = `${this.props.instanceId ?? ''}`.trim();
            const filterName = `${this.props.filterName ?? ''}`.trim();

            if (!instanceId || !filterName || !globalThis?.location?.search) {
                return [];
            }

            const queryParamName = `f_${instanceId}`;
            const queryValue = new URLSearchParams(globalThis.location.search).get(queryParamName);
            if (!queryValue) {
                return [];
            }

            let parsedFilters: Array<{ filterName?: string; values?: Array<{ name?: string; value?: string }> }> = [];
            try {
                parsedFilters = JSON.parse(queryValue);
            } catch {
                parsedFilters = JSON.parse(decodeURIComponent(queryValue));
            }

            if (!Array.isArray(parsedFilters)) {
                return [];
            }

            const matchingFilter = parsedFilters.find(filter => `${filter?.filterName ?? ''}` === filterName);
            const values = matchingFilter?.values || [];

            return values
                .filter(value => !!`${value?.name ?? value?.value ?? ''}`.trim())
                .map(value => {
                    const displayName = this._resolveDisplayLabel(value?.name, value?.value);
                    return {
                        text: displayName,
                        secondaryText: `${value?.value ?? ''}`,
                        optionalText: `${value?.value ?? ''}`
                    };
                });
        } catch {
            return [];
        }
    }

    private readonly emitPickerSelection = (selectedPeople: IPersonaProps[]): void => {
        const previouslySelected = this.state.pickerSelectedPeople || [];
        const selectedFilterValues: IDataFilterValueInfo[] = selectedPeople.map(person => {
            const fallbackIdentity = this.getStaticPersonIdentityValue(person);
            const displayName = `${person?.text || fallbackIdentity}`.trim();
            return {
                name: displayName,
                value: fallbackIdentity,
                selected: true
            };
        });

        previouslySelected.forEach(previousPerson => {
            const previousIdentity = this.getStaticPersonIdentityValue(previousPerson);
            if (!selectedFilterValues.some(value => value.value === previousIdentity)) {
                const previousDisplayName = `${previousPerson?.text || previousIdentity}`.trim();
                selectedFilterValues.push({
                    name: previousDisplayName,
                    value: previousIdentity,
                    selected: false
                });
            }
        });

        this.props.onChecked(this.props.filterName, selectedFilterValues);
    }

    private _extractReadableLabel(value: string): string {
        const cleanedValue = TaxonomyHelper.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const taxonomyLabel = TaxonomyHelper.extractTaxonomyLabel(cleanedValue);
        if (taxonomyLabel) {
            return taxonomyLabel;
        }

        const claimsLabel = TaxonomyHelper.extractClaimsLabel(cleanedValue);
        if (claimsLabel) {
            return claimsLabel;
        }

        if (TaxonomyHelper.isReadablePlainLabel(cleanedValue)) {
            return cleanedValue;
        }

        const personLikeLabel = TaxonomyHelper.extractPersonLikeLabel(cleanedValue);
        if (personLikeLabel) {
            return personLikeLabel;
        }

        const firstReadablePipeSegment = TaxonomyHelper.extractFirstReadablePipeSegment(cleanedValue);
        if (firstReadablePipeSegment) {
            return firstReadablePipeSegment;
        }

        return '';
    }

    private _resolveDisplayLabel(name?: string, value?: string): string {
        const rawLabel = `${name ?? value ?? ''}`.trim();
        const readableRawLabel = this._extractReadableLabel(rawLabel);
        if (readableRawLabel) {
            return readableRawLabel;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawLabel);
        if (decodedValue) {
            const readableDecodedLabel = this._extractReadableLabel(decodedValue);
            if (readableDecodedLabel) {
                return readableDecodedLabel;
            }

            return decodedValue;
        }

        return rawLabel;
    }

    private getStaticPersonIdentityValue(person: IPersonaProps): string {
        return `${person?.optionalText || person?.secondaryText || person?.text || ''}`.trim();
    }

    private readonly getDefaultSelectedUsers = (): string[] => {
        return (this.state.pickerSelectedPeople || [])
            .map(person => {
                const identity = this.getStaticPersonIdentityValue(person);
                const title = `${person?.text || identity}`.trim();
                return identity ? `${identity}/${title}` : `/${title}`;
            })
            .filter(Boolean);
    }

    private readonly onPeoplePickerChange = (selectedPeople: IPersonaProps[] = []): void => {
        if (this.props.disabled) {
            return;
        }

        this._setImmediateProgressCursor();
        this.beginSelectionFeedback();
        this.emitPickerSelection(selectedPeople);
        this.setState({ pickerSelectedPeople: selectedPeople });
    }

    private renderStaticPeoplePicker(): JSX.Element {
        const defaultSelectedUsers = this.getDefaultSelectedUsers();

        return <PeoplePicker
            key={defaultSelectedUsers.join('|')}
            context={this.props.peoplePickerContext}
            disabled={this.props.disabled}
            personSelectionLimit={this.isMultiSelectionMode() ? Number.MAX_SAFE_INTEGER : 1}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={defaultSelectedUsers}
            onChange={this.onPeoplePickerChange}
            placeholder={webPartStrings.General.StaticPeoplePicker.SearchUsersPlaceholder}
            searchTextLimit={2}
            suggestionsLimit={10}
        />;
    }

    public render() {

        if (this.isStaticPickerMode()) {
            return this.renderStaticPeoplePicker();
        }

        let filterValue: IDataFilterValueInfo = {
            name: this.props.name,
            value: this.props.value,
            selected: this.props.selected
        };
        const safeFilterValue = `${filterValue.value ?? ''}`;
        const safeFilterName = `${this.props.filterName ?? ''}`;

        let renderInput: JSX.Element = null;
        let textColor: string = this.props.themeVariant?.isInverted ? this.props.themeVariant?.semanticColors?.bodyText ?? '#323130' : this.props.themeVariant?.semanticColors?.inputText ?? '#323130';
        const labelValue = this._resolveDisplayLabel(filterValue.name, filterValue.value);

        if (this.isMultiSelectionMode()) {
            renderInput = <Checkbox
                styles={{
                    root: {
                        padding: 40,
                    },
                    label: {
                        width: '100%',
                    },
                    text: {
                        color: this.props.count && this.props.count === 0 ? this.props.themeVariant?.semanticColors?.disabledText ?? '#a19f9d' : textColor
                    }
                }}
                theme={(this.props.themeVariant as ITheme) || getTheme()}
                defaultChecked={this.props.selected}
                disabled={this.props.disabled}
                title={labelValue}
                label={labelValue}
                onChange={(ev, checked: boolean) => {
                    this._setImmediateProgressCursor();
                    this.beginSelectionFeedback();
                    filterValue.selected = checked;
                    filterValue.name = labelValue;
                    this.props.onChecked(this.props.filterName, filterValue);
                }}
                onRenderLabel={this._renderCheckboxLabel}
            />;
        } else {
            renderInput = <ChoiceGroup
                defaultSelectedKey={this.props.selected ? safeFilterValue : undefined}
                styles={{
                    root: {
                        position: 'relative',
                        display: 'flex',
                        paddingRight: 10,
                        paddingLeft: 10,
                        paddingBottom: 7,
                        paddingTop: 7,
                        selectors: {
                            '.ms-ChoiceField': {
                                marginTop: 0
                            }
                        }
                    }
                }}
                key={safeFilterName}
                options={[
                    {
                        key: safeFilterValue,
                        text: labelValue,
                        disabled: this.props.disabled,
                        styles: {
                            field: {
                                color: this.props.count && this.props.count === 0 ? this.props.themeVariant?.semanticColors?.disabledText ?? '#a19f9d' : textColor
                            }
                        }
                    }
                ]}
                onChange={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
                    this._setImmediateProgressCursor();
                    this.beginSelectionFeedback();
                    filterValue.selected = (ev.currentTarget as HTMLInputElement).checked;
                    filterValue.value = safeFilterValue;
                    filterValue.name = labelValue;
                    this.props.onChecked(this.props.filterName, filterValue);
                }}
            />;
        }

        return <>
            {this.state.isSelectionInProgress && (
                <div style={{
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: '#605e5c'
                }}>
                    <Spinner size={SpinnerSize.xSmall} />
                    <span>Updating selection...</span>
                </div>
            )}
            {renderInput}
        </>;
    }
}

export class FilterPeopleCheckBoxWebComponent extends BaseWebComponent {

    public static get observedAttributes(): string[] {
        return [
            'data-instance-id',
            'data-filter-name',
            'data-is-multi',
            'data-static-picker',
            'data-selected-values',
            'data-theme-variant',
            'data-name',
            'data-value',
            'data-selected',
            'data-disabled',
            'data-count'
        ];
    }

    public constructor() {
        super();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue || !this.isConnected) {
            return;
        }

        this.renderComponent();
    }

    public connectedCallback() {

        this.renderComponent();
    }

    private renderComponent(): void {

        let props = this.resolveAttributes() as IFilterPeopleTemplateProps;
        props.peoplePickerContext = {
            absoluteUrl: this._serviceScope.consume(PageContext.serviceKey)?.web?.absoluteUrl,
            msGraphClientFactory: this._serviceScope.consume(MSGraphClientFactory.serviceKey),
            spHttpClient: this._serviceScope.consume(SPHttpClient.serviceKey)
        };

        const checkBox = <FilterPeopleTemplateComponent {...props} onChecked={(filterName: string, filterValue: IDataFilterValueInfo | IDataFilterValueInfo[]) => {
            const selectedFilterValues = Array.isArray(filterValue) ? filterValue : [filterValue];

            // Bubble event through the DOM
            const detail: IDataFilterInfo = {
                filterName: filterName,
                filterValues: selectedFilterValues,
                instanceId: props.instanceId
            };
            this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                detail,
                bubbles: true,
                cancelable: true
            }));
        }}
        />;

        ReactDOM.render(checkBox, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}