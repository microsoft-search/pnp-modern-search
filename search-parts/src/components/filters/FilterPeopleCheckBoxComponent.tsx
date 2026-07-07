import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Checkbox, ChoiceGroup, ICheckboxProps, IChoiceGroupOption, ITheme, Spinner, SpinnerSize, Text, getTheme } from '@fluentui/react';
import { IPersonaProps } from '@fluentui/react/lib/Persona';
import { MSGraphClientFactory } from '@microsoft/sp-http';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { PageContext } from '@microsoft/sp-page-context';
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
     * Graph client factory for tenant-wide user suggestions
     */
    msGraphClientFactory?: MSGraphClientFactory;

    /**
     * Current web absolute URL (for SharePoint REST endpoints)
     */
    webAbsoluteUrl?: string;

    /**
     * Handler when a filter value is selected
     */
    onChecked: (filterName: string, filterValue: IDataFilterValueInfo | IDataFilterValueInfo[]) => void;
}

export interface IFilterPeopleTemplateState {
    isSelectionInProgress: boolean;
    pickerSelectedPeople: IPersonaProps[];
    pickerSuggestedPeople: IPersonaProps[];
    isPickerLoading: boolean;
    pickerSearchText: string;
    pickerSearchFilterText: string;
}

interface IPeoplePickerPrincipalEntity {
    Key?: string;
    DisplayText?: string;
    EntityData?: {
        Email?: string;
        AccountName?: string;
    };
}

interface IGraphUserEntity {
    id?: string;
    displayName?: string;
    mail?: string;
    userPrincipalName?: string;
}

export class FilterPeopleTemplateComponent extends React.Component<IFilterPeopleTemplateProps, IFilterPeopleTemplateState> {
    private static readonly SELECTION_FEEDBACK_DURATION_MS = 2500;
    private static readonly GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';
    private static readonly MAX_INITIAL_GRAPH_USERS = 2000;
    private static readonly GRAPH_PAGE_SIZE = 200;
    private static tenantUsersCache: IPersonaProps[] | null = null;
    private static tenantUsersLoadingPromise: Promise<IPersonaProps[]> | null = null;
    private selectionFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
    private pickerSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private requestDigestToken: string = null;
    private requestDigestExpiration: number = 0;

    private static setTenantUsersCache(users: IPersonaProps[]): void {
        FilterPeopleTemplateComponent.tenantUsersCache = users;
    }

    private static setTenantUsersLoadingPromise(promise: Promise<IPersonaProps[]> | null): void {
        FilterPeopleTemplateComponent.tenantUsersLoadingPromise = promise;
    }

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
            pickerSelectedPeople: selectedPeople,
            pickerSuggestedPeople: [],
            isPickerLoading: false,
            pickerSearchText: '',
            pickerSearchFilterText: ''
        };
    }

    public componentDidMount(): void {
        this.restoreSelectionFeedback();

        if (this.isStaticPickerMode()) {
            this.loadInitialPickerSuggestions().catch(() => {
                // Ignore initial suggestion lookup failures
            });
        }
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

        if (this.pickerSearchDebounceTimer !== null) {
            clearTimeout(this.pickerSearchDebounceTimer);
            this.pickerSearchDebounceTimer = null;
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
                        .replaceAll('&quot;', '"')
                        .replaceAll('&#34;', '"')
                        .replaceAll('&apos;', "'")
                        .replaceAll('&#39;', "'")
                        .replaceAll('&amp;', '&');
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

    private async getRequestDigest(): Promise<string> {
        const now = Date.now();
        if (this.requestDigestToken && now < this.requestDigestExpiration) {
            return this.requestDigestToken;
        }

        const response = await fetch(`${this.getCurrentWebAbsoluteUrl()}/_api/contextinfo`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose'
            },
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`Failed to retrieve request digest. Status: ${response.status}`);
        }

        const json = await response.json();
        const digest = `${json?.d?.GetContextWebInformation?.FormDigestValue ?? ''}`.trim();
        if (!digest) {
            throw new Error('Failed to retrieve request digest: missing FormDigestValue.');
        }
        const timeoutSeconds = Number(json?.d?.GetContextWebInformation?.FormDigestTimeoutSeconds ?? 1800);

        this.requestDigestToken = digest;
        this.requestDigestExpiration = Date.now() + Math.max(60, timeoutSeconds - 30) * 1000;

        return digest;
    }

    private async searchTenantUsersFromPeoplePicker(queryText: string, maxSuggestions: number = 20): Promise<IPersonaProps[]> {
        const normalizedQuery = `${queryText ?? ''}`.trim();
        if (!normalizedQuery) {
            return [];
        }

        const digest = await this.getRequestDigest();
        const response = await fetch(`${this.getCurrentWebAbsoluteUrl()}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': digest
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                queryParams: {
                    QueryString: normalizedQuery,
                    MaximumEntitySuggestions: maxSuggestions,
                    PrincipalType: 1,
                    PrincipalSource: 15,
                    AllowEmailAddresses: true,
                    AllowMultipleEntities: true,
                    AllUrlZones: false
                }
            })
        });

        if (!response.ok) {
            return [];
        }

        const json = await response.json();
        const rawResult = json?.d?.ClientPeoplePickerSearchUser;
        const entities = rawResult ? JSON.parse(rawResult) as IPeoplePickerPrincipalEntity[] : [];

        return this.mapPrincipalEntitiesToPersonas(entities);
    }

    private mapPrincipalEntitiesToPersonas(entities: IPeoplePickerPrincipalEntity[]): IPersonaProps[] {
        return (entities || []).map(entity => {
            const email = entity?.EntityData?.Email;
            const accountName = entity?.EntityData?.AccountName || entity?.Key;
            const text = entity?.DisplayText || email || accountName || '';

            return {
                text,
                secondaryText: email || accountName,
                optionalText: accountName
            };
        }).filter(persona => !!persona.text);
    }

    private getCurrentWebAbsoluteUrl(): string {
        const configuredWebAbsoluteUrl = `${this.props.webAbsoluteUrl ?? ''}`.trim();
        if (configuredWebAbsoluteUrl) {
            return configuredWebAbsoluteUrl.replace(/\/$/, '');
        }

        const globalOrigin = `${globalThis?.location?.origin ?? ''}`.trim();
        return globalOrigin;
    }

    private readonly getSeededTenantUsers = async (): Promise<IPersonaProps[]> => {
        const seedQueries = ['a', 'e', 'i', 'o', 'u'];
        const uniqueUsers = new Map<string, IPersonaProps>();

        const peopleResults = await Promise.all(seedQueries.map(query => {
            return this.searchTenantUsersFromPeoplePicker(query, 200);
        }));

        for (const people of peopleResults) {
            people.forEach(person => {
                const key = `${person.optionalText || person.secondaryText || person.text}`;
                if (key && !uniqueUsers.has(key)) {
                    uniqueUsers.set(key, person);
                }
            });

            if (uniqueUsers.size >= 500) {
                break;
            }
        }

        return Array.from(uniqueUsers.values()).sort((left, right) => {
            return `${left.text ?? ''}`.localeCompare(`${right.text ?? ''}`);
        });
    }

    private readonly filterAllPreloadedUsers = (searchText: string): IPersonaProps[] => {
        const normalizedSearchText = `${searchText ?? ''}`.trim().toLocaleLowerCase();
        const source = this.state.pickerSuggestedPeople || [];

        if (!normalizedSearchText) {
            return source;
        }

        return source.filter(persona => {
            const displayName = `${persona?.text ?? ''}`.toLocaleLowerCase();
            const mail = `${persona?.secondaryText ?? ''}`.toLocaleLowerCase();
            const principalName = `${persona?.optionalText ?? ''}`.toLocaleLowerCase();
            return displayName.includes(normalizedSearchText)
                || mail.includes(normalizedSearchText)
                || principalName.includes(normalizedSearchText);
        });
    }

    private readonly getIdentityKey = (person: IPersonaProps): string => {
        return `${person?.optionalText || person?.secondaryText || person?.text || ''}`.trim().toLowerCase();
    }

    private readonly getDisplayNameKey = (person: IPersonaProps): string => {
        return `${person?.text || ''}`.trim().toLowerCase();
    }

    private readonly isSameStaticPerson = (left: IPersonaProps, right: IPersonaProps): boolean => {
        const leftIdentityKey = this.getIdentityKey(left);
        const rightIdentityKey = this.getIdentityKey(right);

        if (leftIdentityKey && rightIdentityKey && leftIdentityKey === rightIdentityKey) {
            return true;
        }

        const leftDisplayNameKey = this.getDisplayNameKey(left);
        const rightDisplayNameKey = this.getDisplayNameKey(right);

        return !!leftDisplayNameKey && leftDisplayNameKey === rightDisplayNameKey;
    }

    private readonly isStaticUserChecked = (user: IPersonaProps, selectedUserKeys: Set<string>, selectedDisplayNames: Set<string>): boolean => {
        const userKey = this.getIdentityKey(user);
        const normalizedDisplayName = `${user?.text || ''}`.trim().toLowerCase();
        return selectedUserKeys.has(userKey) || selectedDisplayNames.has(normalizedDisplayName);
    }

    private readonly getSingleSelectOptions = (filteredUsers: IPersonaProps[], textColor: string): IChoiceGroupOption[] => {
        return filteredUsers.map(user => {
            return {
                key: this.getIdentityKey(user),
                text: user.text,
                disabled: this.props.disabled,
                styles: {
                    field: {
                        color: textColor
                    }
                }
            };
        });
    }

    private readonly getSelectedSingleStaticUserKey = (filteredUsers: IPersonaProps[], selectedUserKeys: Set<string>, selectedDisplayNames: Set<string>): string | undefined => {
        const selectedUser = filteredUsers.find(user => this.isStaticUserChecked(user, selectedUserKeys, selectedDisplayNames));
        return selectedUser ? this.getIdentityKey(selectedUser) : undefined;
    }

    private readonly toggleStaticUserSelection = (person: IPersonaProps, checked: boolean): void => {
        const currentSelection = this.state.pickerSelectedPeople || [];
        let nextSelection: IPersonaProps[];
        const isMultiMode = this.isMultiSelectionMode();

        if (checked) {
            if (isMultiMode) {
                if (currentSelection.some(item => this.isSameStaticPerson(item, person))) {
                    nextSelection = currentSelection;
                } else {
                    nextSelection = [...currentSelection, person];
                }
            } else {
                nextSelection = [person];
            }
        } else {
            nextSelection = currentSelection.filter(item => !this.isSameStaticPerson(item, person));
        }

        this.emitPickerSelection(nextSelection);
        this.setState({
            pickerSelectedPeople: nextSelection
        });
    }

    private readonly loadInitialPickerSuggestions = async (): Promise<void> => {
        if (Array.isArray(FilterPeopleTemplateComponent.tenantUsersCache)) {
            this.setState({
                pickerSuggestedPeople: FilterPeopleTemplateComponent.tenantUsersCache,
                isPickerLoading: false
            });
            return;
        }

        this.setState({ isPickerLoading: true });

        const existingLoadingPromise = FilterPeopleTemplateComponent.tenantUsersLoadingPromise;
        const loadingPromise = existingLoadingPromise ?? this.getInitialTenantUsers();
        FilterPeopleTemplateComponent.setTenantUsersLoadingPromise(loadingPromise);

        try {
            const pickerSuggestedPeople = await loadingPromise;
            FilterPeopleTemplateComponent.setTenantUsersCache(pickerSuggestedPeople);

            this.setState({
                pickerSuggestedPeople,
                isPickerLoading: false
            });
        } catch {
            this.setState({ isPickerLoading: false });
        } finally {
            if (FilterPeopleTemplateComponent.tenantUsersLoadingPromise === loadingPromise) {
                FilterPeopleTemplateComponent.setTenantUsersLoadingPromise(null);
            }
        }
    }

    private readonly getInitialTenantUsers = async (): Promise<IPersonaProps[]> => {
        if (!this.props.msGraphClientFactory) {
            return [];
        }

        try {
            const client = await this.props.msGraphClientFactory.getClient('3');
            let users: IGraphUserEntity[] = [];
            let response = await client
                .api('/users')
                .version('v1.0')
                .select('id,displayName,mail,userPrincipalName')
                .top(FilterPeopleTemplateComponent.GRAPH_PAGE_SIZE)
                .get() as { value?: IGraphUserEntity[]; '@odata.nextLink'?: string };

            users = users.concat(Array.isArray(response?.value) ? response.value : []);
            if (users.length > FilterPeopleTemplateComponent.MAX_INITIAL_GRAPH_USERS) {
                users = users.slice(0, FilterPeopleTemplateComponent.MAX_INITIAL_GRAPH_USERS);
            }

            let nextLink = response?.['@odata.nextLink'];
            let pageCount = 1;

            while (nextLink && pageCount < 100 && users.length < FilterPeopleTemplateComponent.MAX_INITIAL_GRAPH_USERS) {
                response = await client.api(nextLink).get() as { value?: IGraphUserEntity[]; '@odata.nextLink'?: string };
                users = users.concat(Array.isArray(response?.value) ? response.value : []);
                if (users.length > FilterPeopleTemplateComponent.MAX_INITIAL_GRAPH_USERS) {
                    users = users.slice(0, FilterPeopleTemplateComponent.MAX_INITIAL_GRAPH_USERS);
                }
                nextLink = response?.['@odata.nextLink'];
                pageCount++;
            }

            const uniqueUsers = new Map<string, IPersonaProps>();
            users.forEach(user => {
                const text = `${user.displayName || user.mail || user.userPrincipalName || ''}`.trim();
                const secondaryText = `${user.mail || user.userPrincipalName || ''}`.trim();
                const optionalText = `${user.userPrincipalName || ''}`.trim();
                const key = `${optionalText || secondaryText || text}`;

                if (text && !uniqueUsers.has(key)) {
                    uniqueUsers.set(key, {
                        text,
                        secondaryText,
                        optionalText
                    });
                }
            });

            return Array.from(uniqueUsers.values()).sort((left, right) => {
                return `${left.text ?? ''}`.localeCompare(`${right.text ?? ''}`);
            });
        } catch {
            try {
                return await this.getSeededTenantUsers();
            } catch {
                return [];
            }
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
        const cleanedValue = `${value || ''}`.trim().replace(/^"+|"+$/g, '');
        if (!cleanedValue) {
            return '';
        }

        const taxonomyLabelMatch = /(?:L0|GP0|GPP)\|#0?[0-9a-f-]{32,36}\|(.+)$/i.exec(cleanedValue);
        if (taxonomyLabelMatch?.[1]?.trim()) {
            return taxonomyLabelMatch[1].trim();
        }

        const genericGuidLabelMatch = /\|#0?[0-9a-f-]{32,36}\|([^|]+)$/i.exec(cleanedValue);
        if (genericGuidLabelMatch?.[1]?.trim()) {
            return genericGuidLabelMatch[1].trim();
        }

        const claimsLabelMatch = /^i:0#.*\|([^|]+)$/i.exec(cleanedValue);
        if (claimsLabelMatch?.[1]?.trim()) {
            return claimsLabelMatch[1].trim();
        }

        const personLikeLabelMatch = /([A-Za-z][A-Za-z'-]+(?:\s+[A-Za-z][A-Za-z'-]+)+)/.exec(cleanedValue);
        if (personLikeLabelMatch?.[1]?.trim()) {
            return personLikeLabelMatch[1].trim();
        }

        const segments = cleanedValue.split('|').map(segment => segment.trim()).filter(Boolean);
        if (segments.length > 0) {
            for (const segment of segments) {
                const isGuidLike = /^#?[-0-9a-fA-F]{32,36}$/.test(segment);
                const isLongHexLike = segment.length > 16 && /^[0-9a-fA-F]+$/.test(segment);
                if (!isGuidLike && !isLongHexLike) {
                    return segment;
                }
            }
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

    private readonly onStaticPickerSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (this.props.disabled) {
            return;
        }

        const nextSearchText = event.currentTarget.value;

        if (this.pickerSearchDebounceTimer !== null) {
            clearTimeout(this.pickerSearchDebounceTimer);
            this.pickerSearchDebounceTimer = null;
        }

        this.setState({ pickerSearchText: nextSearchText });

        this.pickerSearchDebounceTimer = setTimeout(() => {
            this.pickerSearchDebounceTimer = null;
            this.setState({ pickerSearchFilterText: nextSearchText });
        }, 120);
    }

    private renderStaticPeoplePicker(): JSX.Element {
        const staticPeoplePickerStrings = webPartStrings?.General?.StaticPeoplePicker;
        const removeSelectedUserTitleTemplate = staticPeoplePickerStrings?.RemoveSelectedUserTitle || 'Remove {0}';
        const searchUsersPlaceholder = staticPeoplePickerStrings?.SearchUsersPlaceholder || 'Search users';
        const loadingTenantUsersLabel = staticPeoplePickerStrings?.LoadingTenantUsersLabel || 'Loading tenant users...';
        const noUsersFoundMessage = staticPeoplePickerStrings?.NoUsersFoundMessage || 'No users found.';
        const isMultiMode = this.isMultiSelectionMode();
        const selectedPeople = this.state.pickerSelectedPeople || [];
        const selectedUserKeys = new Set(selectedPeople.map(person => this.getIdentityKey(person)));
        const filteredUsers = this.filterAllPreloadedUsers(this.state.pickerSearchFilterText)
            .filter(person => isMultiMode || !selectedUserKeys.has(this.getIdentityKey(person)));
        const selectedDisplayNames = new Set(selectedPeople.map(person => `${person?.text || ''}`.trim().toLowerCase()).filter(Boolean));
        const textColor = this.props.themeVariant?.isInverted ? this.props.themeVariant?.semanticColors?.bodyText ?? '#323130' : this.props.themeVariant?.semanticColors?.inputText ?? '#323130';
        const selectedPillBackgroundColor = this.props.themeVariant?.palette?.themePrimary ?? '#106ebe';
        const selectedPillBorderColor = this.props.themeVariant?.palette?.themePrimary ?? '#106ebe';
        const selectedPillTextColor = this.props.themeVariant?.palette?.white ?? '#ffffff';
        const singleSelectOptions = isMultiMode ? [] : this.getSingleSelectOptions(filteredUsers, textColor);
        const selectedSingleUserKey = isMultiMode ? undefined : this.getSelectedSingleStaticUserKey(filteredUsers, selectedUserKeys, selectedDisplayNames);

        return <div>
            {selectedPeople.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {selectedPeople.map(person => {
                        const personKey = this.getIdentityKey(person);

                        return <button
                            key={personKey}
                            type="button"
                            onClick={() => this.toggleStaticUserSelection(person, false)}
                            disabled={this.props.disabled}
                            style={{
                                alignItems: 'center',
                                backgroundColor: selectedPillBackgroundColor,
                                border: `1px solid ${selectedPillBorderColor}`,
                                borderRadius: 16,
                                color: selectedPillTextColor,
                                cursor: this.props.disabled ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                gap: 8,
                                opacity: this.props.disabled ? 0.6 : 1,
                                padding: '4px 12px'
                            }}
                            title={removeSelectedUserTitleTemplate.replace('{0}', `${person.text ?? ''}`)}
                            aria-label={removeSelectedUserTitleTemplate.replace('{0}', `${person.text ?? ''}`)}
                        >
                            <span style={{ lineHeight: 1 }}>{person.text}</span>
                            <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>x</span>
                        </button>;
                    })}
                </div>
            )}
            <div style={{ marginBottom: 8 }}>
                <input
                    type="text"
                    value={this.state.pickerSearchText}
                    disabled={this.props.disabled}
                    aria-label={searchUsersPlaceholder}
                    onChange={this.onStaticPickerSearchTextChanged}
                    placeholder={searchUsersPlaceholder}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px' }}
                />
            </div>
            <div style={{ maxHeight: 260, minHeight: 260, overflowY: 'auto', position: 'relative' }}>
                {this.state.isPickerLoading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.45)',
                        zIndex: 1
                    }}>
                        <Spinner size={SpinnerSize.small} label={loadingTenantUsersLabel} />
                    </div>
                )}
                {!this.state.isPickerLoading && selectedPeople.length === 0 && filteredUsers.length === 0 && (
                    <div style={{ color: '#605e5c', fontSize: 12 }}>
                        {noUsersFoundMessage}
                    </div>
                )}
                {filteredUsers.map(user => {
                    const userKey = this.getIdentityKey(user);
                    const checked = this.isStaticUserChecked(user, selectedUserKeys, selectedDisplayNames);

                    if (isMultiMode) {
                        return <div key={userKey} style={{ marginBottom: 6 }}>
                            <Checkbox
                                styles={{
                                    root: {
                                        paddingRight: 10,
                                        paddingLeft: 10,
                                        paddingBottom: 7,
                                        paddingTop: 7
                                    },
                                    label: {
                                        width: '100%',
                                    },
                                    text: {
                                        color: textColor
                                    }
                                }}
                                theme={(this.props.themeVariant as ITheme) || getTheme()}
                                checked={checked}
                                disabled={this.props.disabled}
                                label={user.text}
                                onChange={(ev, isChecked) => {
                                    this.toggleStaticUserSelection(user, !!isChecked);
                                }}
                                title={user.text}
                                onRenderLabel={this._renderCheckboxLabel}
                            />
                        </div>;
                    }

                    return null;
                })}
                {!isMultiMode && singleSelectOptions.length > 0 && (
                    <ChoiceGroup
                        selectedKey={selectedSingleUserKey}
                        styles={{
                            root: {
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                selectors: {
                                    '.ms-ChoiceFieldGroup': {
                                        width: '100%'
                                    },
                                    '.ms-ChoiceField': {
                                        marginTop: 0,
                                        paddingRight: 10,
                                        paddingLeft: 10,
                                        paddingBottom: 7,
                                        paddingTop: 7
                                    }
                                }
                            }
                        }}
                        options={singleSelectOptions}
                        onChange={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
                            const selectedUser = filteredUsers.find(user => this.getIdentityKey(user) === option?.key);
                            if (!selectedUser) {
                                return;
                            }

                            this.toggleStaticUserSelection(selectedUser, true);
                        }}
                    />
                )}
            </div>
        </div>;
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
        props.msGraphClientFactory = this._serviceScope.consume(MSGraphClientFactory.serviceKey);
        props.webAbsoluteUrl = this._serviceScope.consume(PageContext.serviceKey)?.web?.absoluteUrl;

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