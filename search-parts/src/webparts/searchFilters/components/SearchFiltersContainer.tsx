import * as React from 'react';
import { ISearchFiltersContainerProps } from './ISearchFiltersContainerProps';
import { TemplateRenderer } from '../../../controls/TemplateRenderer/TemplateRenderer';
import { ISearchFiltersContainerState } from './ISearchFiltersContainerState';
import { isEqual, cloneDeep, sortBy, flatten } from '@microsoft/sp-lodash-subset';
import { StyledWebPartTitle } from '../../../components/StyledWebPartTitle';
import * as webPartStrings from 'SearchFiltersWebPartStrings';
import * as commonStrings from 'CommonStrings';
import update from 'immutability-helper';
import {
    IDataFilterInternal,
    IDataFilterValueInternal,
    IDataFilterValueInfo,
    IDataFilterConfiguration,
    IDataFilterResult,
    IDataFilterResultValue,
    IDataFilter,
    FilterComparisonOperator,
    IDataFilterInfo,
    ExtensibilityConstants,
    FilterConditionOperator,
    LayoutRenderType
} from '@pnp/modern-search-extensibility';
import { ISearchFiltersTemplateContext } from '../../../models/common/ITemplateContext';
import { DisplayMode, Log } from '@microsoft/sp-core-library';
import { DataFilterHelper } from '../../../helpers/DataFilterHelper';
import { TaxonomyHelper } from '../../../helpers/TaxonomyHelper';
import { UrlHelper } from '../../../helpers/UrlHelper';
import { BuiltinFilterTemplates } from '../../../layouts/AvailableTemplates';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

const DEEPLINK_QUERYSTRING_PARAM_BASE = 'f';

interface IHierarchicalFilterConfiguration extends IDataFilterConfiguration {
    termSetId?: string;
    termGroupId?: string;
    cacheDuration?: number;
    hideNodesNotInDataSet?: boolean;
    expandAllNodesByDefault?: boolean;
    showLimitExceededWarning?: boolean;
}

interface IFilterResultWithLimitInfo extends IDataFilterResult {
    isMaxBucketsExceeded?: boolean;
    configuredMaxBuckets?: number;
    returnedValueCount?: number;
    isEditModeCapApplied?: boolean;
}

interface IFilterInternalWithWarning extends IDataFilterInternal {
    showWarningMarker?: boolean;
    showLimitExceededWarning?: boolean;
    limitExceededWarningText?: string;
    showPeopleTemplateMappingWarning?: boolean;
    peopleTemplateMappingWarningText?: string;
    warningMessages?: string[];
    warningMarkerTooltipText?: string;
}

interface IHierarchicalTerm {
    id: string;
    name: string;
    label: string;
    parentId: string;
    pathOfTerm: string;
    children: IHierarchicalTerm[];
}

interface IUpdateDebugContext {
    eventId: number;
    source: string;
    filterName: string;
    startedAt: number;
    lastMarkAt: number;
}

export default class SearchFiltersContainer extends React.Component<ISearchFiltersContainerProps, ISearchFiltersContainerState> {

    private readonly componentRef: React.RefObject<any>;

    /**
     * The URL query parameter name for this specific web part instance
     */
    private readonly deeplinkQueryStringParam: string;
    private _isUpdatingDeepLink: boolean = false;
    private _lastProcessedDeepLink: string = '';
    private _nextUpdateDebugEventId: number = 0;
    private _skipNextUiRefreshFromLocalSelection: boolean = false;
    private readonly _enableUpdateDebugLogging: boolean = false;
    private readonly _peopleDisplayNameByValue: Map<string, string> = new Map<string, string>();
    private readonly _peopleDisplayNameByName: Map<string, string> = new Map<string, string>();
    private readonly _resolvedDisplayNameCache: Map<string, string> = new Map<string, string>();
    private readonly _hierarchyCacheByFilterKey: Map<string, IHierarchicalTerm[]> = new Map<string, IHierarchicalTerm[]>();
    private readonly _prunedHierarchyCacheBySelectionKey: Map<string, IHierarchicalTerm[]> = new Map<string, IHierarchicalTerm[]>();
    private _deferredSubmittedUpdateTimer: ReturnType<typeof setTimeout> | null = null;
    private _busyHideTimer: ReturnType<typeof setTimeout> | null = null;
    private _busyWatchdogTimer: ReturnType<typeof setTimeout> | null = null;
    private _busyPrimeTimer: ReturnType<typeof setTimeout> | null = null;
    private _busyCursorAutoHideTimer: ReturnType<typeof setTimeout> | null = null;
    private _isMounted: boolean = false;
    private _busyStartedAt: number = 0;
    private _latestDeferredSubmittedFilters: IDataFilter[] | null = null;
    private static readonly _DISPLAY_NAME_CACHE_LIMIT = 5000;
    private static readonly _HIERARCHY_CACHE_LIMIT = 64;
    private static readonly _PRUNED_HIERARCHY_CACHE_LIMIT = 256;
    private static readonly _MIN_BUSY_VISIBLE_MS = 2000;
    private static readonly _STATIC_PEOPLE_BUSY_VISIBLE_MS = 3000;
    private static readonly _MAX_BUSY_DURATION_MS = 10000;
    private static readonly _BUSY_PRIME_TIMEOUT_MS = 1500;
    private static readonly _GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';

    public constructor(props: ISearchFiltersContainerProps) {

        super(props);

        // Create instance-specific query parameter to avoid conflicts between multiple filter web parts
        this.deeplinkQueryStringParam = `${DEEPLINK_QUERYSTRING_PARAM_BASE}_${this.props.instanceId}`;

        this.state = {
            currentUiFilters: [],
            submittedFilters: [],
            isUpdatingResults: false,
            activeBusyFilterName: undefined
        };

        this.componentRef = React.createRef();
    }

    private readonly buildHierarchy = (allTerms: any[]): IHierarchicalTerm[] => {
        const termMap = new Map<string, IHierarchicalTerm>();
        const rootTerms: IHierarchicalTerm[] = [];

        allTerms.forEach(term => {
            const path = term.PathOfTerm || term.Name;
            const rawTermLabel = term.Labels?._Child_Items_?.length > 0
                ? term.Labels._Child_Items_[0].Value
                : term.Name;
            const termObj: IHierarchicalTerm = {
                id: term.Id,
                name: term.Name,
                label: this.resolveFilterDisplayName(rawTermLabel, term.Name),
                parentId: term.ParentId,
                pathOfTerm: path,
                children: []
            };
            termMap.set(path, termObj);
        });

        termMap.forEach(termObj => {
            const pathParts = termObj.pathOfTerm.split(';');

            if (pathParts.length > 1) {
                const parentPath = pathParts.slice(0, -1).join(';');
                const parent = termMap.get(parentPath);

                if (parent) {
                    parent.children.push(termObj);
                } else {
                    rootTerms.push(termObj);
                }
            } else {
                rootTerms.push(termObj);
            }
        });

        return rootTerms;
    }

    private readonly pruneHierarchy = (terms: IHierarchicalTerm[], resultGuids: Set<string>, selectedGuids: Set<string>): IHierarchicalTerm[] => {
        return terms.reduce((visibleTerms: IHierarchicalTerm[], term) => {
            const children = this.pruneHierarchy(term.children || [], resultGuids, selectedGuids);
            const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
            const keepTerm = resultGuids.has(termGuid) || selectedGuids.has(termGuid) || children.length > 0;

            if (keepTerm) {
                visibleTerms.push({
                    ...term,
                    children
                });
            }

            return visibleTerms;
        }, []);
    }

    private readonly buildGuidSetFromFilterValues = (filterValues: Array<{ value: string }>): Set<string> => {
        const guidSet = new Set<string>();

        (filterValues || []).forEach(filterValue => {
            if (!filterValue?.value) {
                return;
            }

            TaxonomyHelper.extractGuidsFromFilterValue(filterValue.value).forEach(guid => guidSet.add(guid));
        });

        return guidSet;
    }

    private extractReadableLabelFromString(value: string): string {
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

        const emailLikeLabel = TaxonomyHelper.extractEmailLikeLabel(cleanedValue);
        if (emailLikeLabel) {
            return emailLikeLabel;
        }

        const firstReadablePipeSegment = TaxonomyHelper.extractFirstReadablePipeSegment(cleanedValue);
        if (firstReadablePipeSegment) {
            return firstReadablePipeSegment;
        }

        return '';
    }

    private normalizeDisplayCacheKey(value: string): string {
        return `${value ?? ''}`.trim().toLowerCase();
    }

    private setDisplayNameCacheEntry(cache: Map<string, string>, key: string, label: string): void {
        if (!key || !label) {
            return;
        }

        if (cache.size >= SearchFiltersContainer._DISPLAY_NAME_CACHE_LIMIT) {
            cache.clear();
        }

        cache.set(key, label);
    }

    private setLimitedCacheEntry<T>(cache: Map<string, T>, key: string, value: T, limit: number): void {
        if (!key) {
            return;
        }

        if (cache.size >= limit) {
            cache.clear();
        }

        cache.set(key, value);
    }

    private getHierarchyCacheKey(filterName: string, termSetId: string, termGroupId: string): string {
        return `${filterName}::${termSetId}::${termGroupId}`;
    }

    private getGuidSetSignature(guidSet: Set<string>): string {
        return Array.from(guidSet.values()).sort((left, right) => left.localeCompare(right)).join(',');
    }

    private queueDeferredSubmittedFiltersUpdate(submittedFilters: IDataFilter[], sourceFilterName?: string): void {
        this._latestDeferredSubmittedFilters = submittedFilters;

        this.beginResultsUpdate(sourceFilterName);

        if (this._deferredSubmittedUpdateTimer) {
            clearTimeout(this._deferredSubmittedUpdateTimer);
        }

        this._deferredSubmittedUpdateTimer = setTimeout(() => {
            const filtersToUpdate = this._latestDeferredSubmittedFilters;

            this._deferredSubmittedUpdateTimer = null;
            this._latestDeferredSubmittedFilters = null;

            if (!filtersToUpdate) {
                return;
            }

            this.props.onUpdateFilters(filtersToUpdate);
            this.setFiltersDeepLink(filtersToUpdate);
        }, 0);
    }

    private beginResultsUpdate(sourceFilterName?: string, onReady?: () => void): void {
        if (this._busyHideTimer) {
            clearTimeout(this._busyHideTimer);
            this._busyHideTimer = null;
        }

        if (this._busyCursorAutoHideTimer) {
            clearTimeout(this._busyCursorAutoHideTimer);
            this._busyCursorAutoHideTimer = null;
        }

        if (this._busyWatchdogTimer) {
            clearTimeout(this._busyWatchdogTimer);
            this._busyWatchdogTimer = null;
        }

        if (this._busyPrimeTimer) {
            clearTimeout(this._busyPrimeTimer);
            this._busyPrimeTimer = null;
        }

        this._busyStartedAt = performance.now();
        this.setBusyCursor(true);

        this._busyWatchdogTimer = setTimeout(() => {
            this._busyWatchdogTimer = null;

            if (this.state.isUpdatingResults) {
                this.endResultsUpdate();
            }
        }, SearchFiltersContainer._MAX_BUSY_DURATION_MS);

        if (this.isStaticPeopleFilter(sourceFilterName)) {
            this._busyCursorAutoHideTimer = setTimeout(() => {
                this._busyCursorAutoHideTimer = null;

                if (this._isMounted && this.state.isUpdatingResults) {
                    this.setBusyCursor(false);
                }
            }, SearchFiltersContainer._STATIC_PEOPLE_BUSY_VISIBLE_MS);
        }

        this.setState(prevState => ({
            isUpdatingResults: true,
            activeBusyFilterName: sourceFilterName || prevState.activeBusyFilterName
        }), () => {
            if (!onReady) {
                return;
            }

            if (typeof globalThis.requestAnimationFrame === 'function') {
                globalThis.requestAnimationFrame(() => onReady());
                return;
            }

            setTimeout(() => onReady(), 0);
        });
    }

    private setBusyCursor(isBusy: boolean): void {
        if (this.componentRef?.current) {
            this.componentRef.current.style.cursor = isBusy ? 'progress' : '';
        }

        if (globalThis?.document?.documentElement) {
            if (isBusy) {
                globalThis.document.documentElement.style.setProperty('cursor', 'progress', 'important');
            } else {
                globalThis.document.documentElement.style.removeProperty('cursor');
            }
        }

        if (globalThis?.document?.body) {
            if (isBusy) {
                globalThis.document.body.style.setProperty('cursor', 'progress', 'important');
            } else {
                globalThis.document.body.style.removeProperty('cursor');
            }
        }

        this.setGlobalBusyCursorStyle(isBusy);
    }

    private setGlobalBusyCursorStyle(isBusy: boolean): void {
        if (!globalThis?.document) {
            return;
        }

        const styleId = SearchFiltersContainer._GLOBAL_BUSY_CURSOR_STYLE_ID;
        const existingStyle = globalThis.document.getElementById(styleId);

        if (isBusy) {
            if (existingStyle) {
                return;
            }

            const styleElement = globalThis.document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = '* { cursor: progress !important; }';
            globalThis.document.head.appendChild(styleElement);
            return;
        }

        if (existingStyle) {
            existingStyle.remove();
        }
    }

    private shouldPrimeBusyCursorFromInteraction(target: EventTarget | null): boolean {
        if (!(target instanceof Element)) {
            return false;
        }

        return !!target.closest('pnp-filtercheckbox, pnp-filtercombobox, pnp-filtersearchbox, pnp-filtermultiselect, pnp-filteroperator, pnp-filterdaterange, pnp-filterdateinterval, pnp-filterhierarchical, pnp-peoplefilter');
    }

    private readonly primeBusyCursorFromInteraction = (event: React.PointerEvent<HTMLDivElement>): void => {
        if (this.state.isUpdatingResults) {
            return;
        }

        if (!this.shouldPrimeBusyCursorFromInteraction(event.target)) {
            return;
        }

        this.setBusyCursor(true);

        if (this._busyPrimeTimer) {
            clearTimeout(this._busyPrimeTimer);
        }

        this._busyPrimeTimer = setTimeout(() => {
            this._busyPrimeTimer = null;

            if (!this.state.isUpdatingResults) {
                this.setBusyCursor(false);
            }
        }, SearchFiltersContainer._BUSY_PRIME_TIMEOUT_MS);
    }

    private endResultsUpdate(): void {
        const elapsed = performance.now() - this._busyStartedAt;
        const remaining = SearchFiltersContainer._MIN_BUSY_VISIBLE_MS - elapsed;

        if (this._busyCursorAutoHideTimer) {
            clearTimeout(this._busyCursorAutoHideTimer);
            this._busyCursorAutoHideTimer = null;
        }

        if (this._busyHideTimer) {
            clearTimeout(this._busyHideTimer);
        }

        if (this._busyWatchdogTimer) {
            clearTimeout(this._busyWatchdogTimer);
            this._busyWatchdogTimer = null;
        }

        this._busyHideTimer = setTimeout(() => {
            this._busyHideTimer = null;
            this.setBusyCursor(false);
            this.setState({
                isUpdatingResults: false,
                activeBusyFilterName: undefined
            });
        }, Math.max(0, remaining));
    }

    private warmPeopleDisplayNameCache(name: string, value: string): void {
        const resolvedLabel = this.resolveFilterDisplayName(name, value);
        if (!resolvedLabel) {
            return;
        }

        const normalizedValueKey = this.normalizeDisplayCacheKey(value);
        const normalizedNameKey = this.normalizeDisplayCacheKey(name);

        if (normalizedValueKey) {
            this.setDisplayNameCacheEntry(this._peopleDisplayNameByValue, normalizedValueKey, resolvedLabel);
        }

        if (normalizedNameKey) {
            this.setDisplayNameCacheEntry(this._peopleDisplayNameByName, normalizedNameKey, resolvedLabel);
        }
    }

    private warmPeopleDisplayNameCacheFromValues(values: Array<{ name?: string; value?: string }>): void {
        (values || []).forEach(item => {
            this.warmPeopleDisplayNameCache(`${item?.name ?? ''}`, `${item?.value ?? ''}`);
        });
    }

    private resolveFilterDisplayName(name: string, value: string): string {
        const rawName = `${name ?? ''}`;
        const rawValue = `${value ?? ''}`;
        const cacheKey = `${this.normalizeDisplayCacheKey(rawName)}::${this.normalizeDisplayCacheKey(rawValue)}`;

        const resolvedFromSharedCache = this._resolvedDisplayNameCache.get(cacheKey);
        if (resolvedFromSharedCache) {
            return resolvedFromSharedCache;
        }

        const resolvedFromPeopleValueCache = this._peopleDisplayNameByValue.get(this.normalizeDisplayCacheKey(rawValue));
        if (resolvedFromPeopleValueCache) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, resolvedFromPeopleValueCache);
            return resolvedFromPeopleValueCache;
        }

        const resolvedFromPeopleNameCache = this._peopleDisplayNameByName.get(this.normalizeDisplayCacheKey(rawName));
        if (resolvedFromPeopleNameCache) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, resolvedFromPeopleNameCache);
            return resolvedFromPeopleNameCache;
        }

        const readableRawName = this.extractReadableLabelFromString(rawName);
        if (readableRawName) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, readableRawName);
            return readableRawName;
        }

        const decodedName = TaxonomyHelper.decodeHexString(rawName);
        const readableDecodedName = this.extractReadableLabelFromString(decodedName);
        if (readableDecodedName) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, readableDecodedName);
            return readableDecodedName;
        }
        if (decodedName) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, decodedName);
            return decodedName;
        }

        const readableRawValue = this.extractReadableLabelFromString(rawValue);
        if (readableRawValue) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, readableRawValue);
            return readableRawValue;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawValue);
        const readableDecodedValue = this.extractReadableLabelFromString(decodedValue);
        if (readableDecodedValue) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, readableDecodedValue);
            return readableDecodedValue;
        }
        if (decodedValue) {
            this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, decodedValue);
            return decodedValue;
        }

        const fallbackValue = rawName || rawValue;
        this.setDisplayNameCacheEntry(this._resolvedDisplayNameCache, cacheKey, fallbackValue);
        return fallbackValue;
    }

    private readonly areFilterValuesEquivalent = (leftValue: string, rightValue: string): boolean => {
        if (!leftValue || !rightValue) {
            return false;
        }

        if (leftValue === rightValue) {
            return true;
        }

        // Fast path: for regular string refiners (most cases), skip expensive taxonomy GUID extraction.
        const isLeftTaxonomyLike = leftValue.includes('|#') || leftValue.includes('ǂǂ');
        const isRightTaxonomyLike = rightValue.includes('|#') || rightValue.includes('ǂǂ');

        if (!isLeftTaxonomyLike && !isRightTaxonomyLike) {
            return false;
        }

        const leftGuids = TaxonomyHelper.extractGuidsFromFilterValue(leftValue);
        const rightGuids = TaxonomyHelper.extractGuidsFromFilterValue(rightValue);

        if (leftGuids.length === 0 || rightGuids.length === 0) {
            return false;
        }

        return leftGuids.some(guid => rightGuids.includes(guid));
    }

    private formatLocalizedString(template: string, values: Array<string | number>): string {
        return values.reduce<string>((formattedValue, currentValue, index) => {
            return formattedValue.replace(`{${index}}`, currentValue.toString());
        }, template);
    }

    private createUpdateDebugContext(filterName: string, source: string, startedAt?: number): IUpdateDebugContext {
        const now = performance.now();

        return {
            eventId: ++this._nextUpdateDebugEventId,
            source,
            filterName,
            startedAt: typeof startedAt === 'number' ? startedAt : now,
            lastMarkAt: now
        };
    }

    private logUpdateStep(debugContext: IUpdateDebugContext, step: string, details?: Record<string, unknown>): void {
        const now = performance.now();

        const logPayload: Record<string, unknown> = {
            source: debugContext.source,
            filterName: debugContext.filterName,
            deltaMs: (now - debugContext.lastMarkAt).toFixed(1),
            totalMs: (now - debugContext.startedAt).toFixed(1),
            instanceId: this.props.instanceId
        };

        if (details) {
            Object.assign(logPayload, details);
        }

        console.info(`[PnP Modern Search][Search Filters][Update ${debugContext.eventId}] ${step}`, {
            ...logPayload
        });

        debugContext.lastMarkAt = now;
    }

    private getSelectedFilterUiContext(currentUiFilters: IDataFilterInternal[], availableFilter: IDataFilterResult, filterConfiguration: IHierarchicalFilterConfiguration): {
        selectedFilterIdx: number;
        selectedFilterValues: IDataFilterValueInternal[];
        selectedValueIndexByRaw: Map<string, number>;
    } {
        const selectedFilterIdx = currentUiFilters.findIndex(selectedFilter => selectedFilter.filterName === availableFilter.filterName);
        const selectedFilterValues = selectedFilterIdx === -1 ? [] : currentUiFilters[selectedFilterIdx].values;
        const selectedValueIndexByRaw = new Map<string, number>();

        if (filterConfiguration.selectedTemplate === BuiltinFilterTemplates.People) {
            this.warmPeopleDisplayNameCacheFromValues(availableFilter.values);
            this.warmPeopleDisplayNameCacheFromValues(selectedFilterValues);
        }

        selectedFilterValues.forEach((value, idx) => {
            selectedValueIndexByRaw.set(`${value.value}`, idx);
        });

        return {
            selectedFilterIdx,
            selectedFilterValues,
            selectedValueIndexByRaw
        };
    }

    private getZeroResultValues(currentUiFilters: IDataFilterInternal[], selectedFilterIdx: number, filterConfiguration: IHierarchicalFilterConfiguration): IDataFilterValueInternal[] {
        if (selectedFilterIdx === -1) {
            return [];
        }

        return currentUiFilters[selectedFilterIdx].values.map(value => {
            if (((value.selected || value.selectedOnce) && filterConfiguration.isMulti) || (value.selected && !filterConfiguration.isMulti)) {
                value.count = 0;
                return value;
            }

            return null;
        }).filter(Boolean);
    }

    private isTokenDisplayName(name?: string): boolean {
        if (!name) {
            return false;
        }

        return name.startsWith('GPP|#')
            || name.startsWith('GP0|#')
            || name.startsWith('L0|#')
            || name.startsWith('#ǂ')
            || name.startsWith('ǂ')
            || (name.startsWith('"') && name.includes('ǂǂ'));
    }

    private isLikelySingleUserValue(rawValue: string): boolean {
        const candidate = `${rawValue ?? ''}`.trim().replace(/^"+|"+$/g, '');
        if (!candidate) {
            return false;
        }

        // Multiple users packed into one value is a strong signal of an invalid People mapping.
        if (candidate.includes(';')) {
            return false;
        }

        if (/^i:0#.*\|[^|@\s]+@[^|@\s]+\.[^|@\s]+$/i.test(candidate)) {
            return true;
        }

        const emailParts = candidate.split('@');
        const hasEmailShape = emailParts.length === 2 && emailParts[0].length > 0 && emailParts[1].includes('.') && !candidate.includes(' ');
        if (hasEmailShape) {
            return true;
        }

        const displayNameParts = candidate.split(/\s+/).filter(Boolean);
        if (displayNameParts.length >= 2) {
            const allPartsLookLikeName = displayNameParts.every(part => {
                const normalized = part.replace(/[.'’-]/g, '');
                return normalized.length > 0 && /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(normalized);
            });

            if (allPartsLookLikeName) {
                return true;
            }
        }

        const readableLabel = this.extractReadableLabelFromString(candidate);
        if (readableLabel && readableLabel !== candidate) {
            return this.isLikelySingleUserValue(readableLabel);
        }

        return false;
    }

    private hasExplicitUserIdentitySignal(rawValue: string): boolean {
        const candidate = `${rawValue ?? ''}`.trim().replace(/^"+|"+$/g, '');
        if (!candidate) {
            return false;
        }

        const decodedCandidate = TaxonomyHelper.decodeHexString(candidate) || candidate;
        const normalizedCandidates = [candidate, decodedCandidate];

        const hasSignal = (value: string): boolean => {
            if (!value) {
                return false;
            }

            if (/i:0#\.[^|]*\|membership\|/i.test(value)) {
                return true;
            }

            if (/\|membership\|/i.test(value)) {
                return true;
            }

            if (value.startsWith('i:0#')) {
                return true;
            }

            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) {
                return true;
            }

            if (/(?:L0|GP0|GPP)\|#0?[0-9a-f-]{32,36}\|/i.test(value)) {
                return true;
            }

            if (/\|#0?[0-9a-f-]{32,36}\|/i.test(value)) {
                return true;
            }

            return false;
        };

        if (normalizedCandidates.some(value => hasSignal(value))) {
            return true;
        }

        return false;
    }

    private shouldShowPeopleTemplateMappingWarning(availableFilter: IDataFilterResult, selectedTemplate?: string): boolean {
        if (selectedTemplate === BuiltinFilterTemplates.StaticPeople) {
            return false;
        }

        const values = availableFilter?.values ?? [];
        if (values.length === 0) {
            return false;
        }

        let suspiciousCount = 0;
        let packedMultiValueCount = 0;
        let explicitIdentityCount = 0;
        let plainDisplayNameCount = 0;
        let nonIdentityCount = 0;

        values.forEach(value => {
            const rawName = `${value?.name ?? ''}`;
            const rawValue = `${value?.value ?? ''}`;
            const hasPackedMultiValue = rawName.includes(';') || rawValue.includes(';');

            if (hasPackedMultiValue) {
                packedMultiValueCount++;
                suspiciousCount++;
                return;
            }

            const hasExplicitIdentitySignal = this.hasExplicitUserIdentitySignal(rawName) || this.hasExplicitUserIdentitySignal(rawValue);
            if (hasExplicitIdentitySignal) {
                explicitIdentityCount++;
                return;
            }

            nonIdentityCount++;

            const looksLikeUser = this.isLikelySingleUserValue(rawName) || this.isLikelySingleUserValue(rawValue);
            if (looksLikeUser) {
                plainDisplayNameCount++;
                return;
            }

            if (!looksLikeUser) {
                suspiciousCount++;
            }
        });

        if (packedMultiValueCount > 0) {
            return true;
        }

        // If values look like plain person names but there are no identity-like tokens at all,
        // this is typically a display-name-only mapping instead of a Q_USER mapping.
        if (plainDisplayNameCount > 0 && explicitIdentityCount === 0) {
            return true;
        }

        // Any meaningful amount of non-identity values in a People template indicates mapping
        // away from Q_USER semantics.
        const nonIdentityThreshold = Math.max(1, Math.ceil(values.length * 0.2));
        if (nonIdentityCount >= nonIdentityThreshold) {
            return true;
        }

        // Mixed datasets can contain a few identity-like values. Still warn when the dominant
        // shape clearly looks like plain display names.
        const valueCount = values.length;
        const mostlyPlainDisplayNames = plainDisplayNameCount >= Math.max(3, Math.ceil(valueCount * 0.6));
        const identitySignalsAreMinority = explicitIdentityCount <= Math.floor(valueCount * 0.2);

        if (mostlyPlainDisplayNames && identitySignalsAreMinority) {
            return true;
        }

        return suspiciousCount >= Math.ceil(values.length / 2);
    }

    private getMatchingSelectedValueIndex(availableRawValue: string, selectedValueIndexByRaw: Map<string, number>, selectedFilterValues: IDataFilterValueInternal[]): number {
        const directValueIdx = selectedValueIndexByRaw.get(availableRawValue);
        if (directValueIdx !== undefined) {
            return directValueIdx;
        }

        const needsTaxonomyFallback = availableRawValue.includes('|#') || availableRawValue.includes('ǂǂ');
        if (!needsTaxonomyFallback) {
            return -1;
        }

        return selectedFilterValues.findIndex(value => this.areFilterValuesEquivalent(`${value.value ?? ''}`, availableRawValue));
    }

    private getMatchingStaticPeopleSelectedValueIndex(availableValue: IDataFilterResultValue, selectedFilterValues: IDataFilterValueInternal[]): number {
        const availableLabel = this.resolveFilterDisplayName(`${availableValue?.name ?? ''}`, `${availableValue?.value ?? ''}`)
            .trim()
            .toLowerCase();

        if (!availableLabel) {
            return -1;
        }

        return selectedFilterValues.findIndex(selectedValue => {
            const selectedLabel = this.resolveFilterDisplayName(`${selectedValue?.name ?? ''}`, `${selectedValue?.value ?? ''}`)
                .trim()
                .toLowerCase();

            return selectedLabel === availableLabel;
        });
    }

    private mergeAvailableValueWithSelection(availableValue: IDataFilterResultValue, selectedFilterValues: IDataFilterValueInternal[], selectedValueIndexByRaw: Map<string, number>, selectedTemplate?: string): IDataFilterValueInternal {
        const filterValueInternal: IDataFilterValueInternal = {
            name: this.resolveFilterDisplayName(availableValue.name, `${availableValue.value}`),
            selected: false,
            selectedOnce: false,
            disabled: false,
            value: availableValue.value,
            count: availableValue.count
        };

        let valueIdx = this.getMatchingSelectedValueIndex(`${availableValue.value}`, selectedValueIndexByRaw, selectedFilterValues);
        if (valueIdx === -1 && selectedTemplate === BuiltinFilterTemplates.StaticPeople) {
            valueIdx = this.getMatchingStaticPeopleSelectedValueIndex(availableValue, selectedFilterValues);
        }

        if (valueIdx === -1) {
            return filterValueInternal;
        }

        const updatedValue = selectedFilterValues[valueIdx];
        updatedValue.count = availableValue.count;

        const resolvedAvailableName = this.resolveFilterDisplayName(availableValue.name, `${availableValue.value}`);
        const currentNameIsToken = this.isTokenDisplayName(updatedValue.name);
        const availableNameIsToken = this.isTokenDisplayName(availableValue.name);

        if (currentNameIsToken && !availableNameIsToken) {
            updatedValue.name = resolvedAvailableName || updatedValue.name || `${availableValue.value}`;
        } else if (!currentNameIsToken && availableNameIsToken) {
            // Keep current readable label.
        } else {
            updatedValue.name = resolvedAvailableName || updatedValue.name || `${availableValue.value}`;
        }

        return updatedValue;
    }

    private buildDisplayValues(availableFilter: IDataFilterResult, currentUiFilters: IDataFilterInternal[], selectedFilterIdx: number, selectedFilterValues: IDataFilterValueInternal[], selectedValueIndexByRaw: Map<string, number>, filterConfiguration: IHierarchicalFilterConfiguration): IDataFilterValueInternal[] {
        if (availableFilter.values.length === 0) {
            return this.getZeroResultValues(currentUiFilters, selectedFilterIdx, filterConfiguration);
        }

        return availableFilter.values.map(availableValue => {
            if (selectedFilterIdx === -1) {
                return {
                    name: this.resolveFilterDisplayName(availableValue.name, `${availableValue.value}`),
                    selected: false,
                    selectedOnce: false,
                    disabled: false,
                    value: availableValue.value,
                    count: availableValue.count
                };
            }

            return this.mergeAvailableValueWithSelection(availableValue, selectedFilterValues, selectedValueIndexByRaw, filterConfiguration.selectedTemplate);
        });
    }

    private appendAdditionalSelectedValues(values: IDataFilterValueInternal[], currentUiFilters: IDataFilterInternal[], selectedFilterIdx: number): IDataFilterValueInternal[] {
        if (selectedFilterIdx === -1) {
            return values;
        }

        const currentValueRawSet = new Set(values.map(v => `${v.value}`));
        const additionalValues = currentUiFilters[selectedFilterIdx].values.map(value => {
            const rawValue = `${value.value}`;
            const hasRawMatch = currentValueRawSet.has(rawValue);
            const needsTaxonomyFallback = rawValue.includes('|#') || rawValue.includes('ǂǂ');
            const hasTaxonomyMatch = !hasRawMatch && needsTaxonomyFallback
                ? values.some(v => this.areFilterValuesEquivalent(`${v.value ?? ''}`, `${value.value ?? ''}`))
                : false;

            if (!hasRawMatch && !hasTaxonomyMatch && value.selected) {
                return value;
            }

            return null;
        }).filter(Boolean);

        return values.concat(additionalValues);
    }


    private getFilterSelectionState(availableFilter: IDataFilterResult, values: IDataFilterValueInternal[], currentUiFilters: IDataFilterInternal[], selectedFilterIdx: number): {
        selectedOnce: boolean;
        hasSelectedValues: boolean;
        canApply: boolean;
        canClear: boolean;
    } {
        const selectedOnce = selectedFilterIdx !== -1 && currentUiFilters[selectedFilterIdx].selectedOnce
            ? currentUiFilters[selectedFilterIdx].selectedOnce
            : values.some(value => value.selectedOnce);
        const hasSelectedValues = values.some(value => value.selected);
        const currentSelectedValuesInUiForFilter = values
            .filter(value => value.selected)
            .map(value => `${value.value ?? ''}`)
            .sort((left, right) => left.localeCompare(right));
        const alreadySubmittedValuesForFilter = flatten(
            this.state.submittedFilters
                .filter(submittedFilter => submittedFilter.filterName === availableFilter.filterName)
                .map(submittedFilter => submittedFilter.values)
        )
            .map(value => `${value.value ?? ''}`)
            .sort((left, right) => left.localeCompare(right));

        return {
            selectedOnce,
            hasSelectedValues,
            canApply: !isEqual(currentSelectedValuesInUiForFilter, alreadySubmittedValuesForFilter),
            canClear: alreadySubmittedValuesForFilter.length > 0 || hasSelectedValues
        };
    }

    private buildFilterResultInternal(availableFilter: IDataFilterResult, filterConfiguration: IHierarchicalFilterConfiguration, values: IDataFilterValueInternal[], currentUiFilters: IDataFilterInternal[], selectedFilterIdx: number, filterWithLimitInfo: IFilterResultWithLimitInfo, selectionState: { selectedOnce: boolean; hasSelectedValues: boolean; canApply: boolean; canClear: boolean; }): IFilterInternalWithWarning & { termSetId?: string; termGroupId?: string; hierarchicalTerms?: IHierarchicalTerm[]; hideNodesNotInDataSet?: boolean; expandAllNodesByDefault?: boolean } {
        const filterOperator = selectedFilterIdx === -1 ? filterConfiguration.operator : currentUiFilters[selectedFilterIdx].operator;
        const reachedEditModeRefinerCap = this.props.webPartTitleProps?.displayMode === DisplayMode.Edit
            && filterWithLimitInfo.isMaxBucketsExceeded
            && filterWithLimitInfo.isEditModeCapApplied;
        const showLimitExceededWarning = Boolean(filterWithLimitInfo.isMaxBucketsExceeded && filterConfiguration.showLimitExceededWarning);
        const limitExceededWarningText = showLimitExceededWarning
            ? this.formatLocalizedString(
                webPartStrings.PropertyPane.DataFilterCollection.FilterLimitReachedWarningMessage,
                [filterWithLimitInfo.returnedValueCount ?? values.length, filterWithLimitInfo.configuredMaxBuckets ?? values.length]
            )
            : undefined;
        const editModeRefinerLimitWarningText = reachedEditModeRefinerCap
            ? this.formatLocalizedString(
                webPartStrings.PropertyPane.DataFilterCollection.EditModeRefinerLimitReachedWarningMessage,
                [filterWithLimitInfo.returnedValueCount ?? values.length, filterWithLimitInfo.configuredMaxBuckets ?? values.length]
            )
            : undefined;
        const showPeopleTemplateMappingWarning = this.props.webPartTitleProps?.displayMode === DisplayMode.Edit
            && filterConfiguration.selectedTemplate === BuiltinFilterTemplates.People
            && this.shouldShowPeopleTemplateMappingWarning(availableFilter, filterConfiguration.selectedTemplate);
        const peopleTemplateMappingWarningText = showPeopleTemplateMappingWarning
            ? (webPartStrings.PropertyPane.DataFilterCollection.PeopleTemplateQUserMappingWarning
                || 'People template warning: values do not look like user identities. This property may not be mapped to a Q_USER crawled property.')
            : undefined;
        const warningMessages = [editModeRefinerLimitWarningText, peopleTemplateMappingWarningText].filter(Boolean);
        const warningMarkerTooltipText = [limitExceededWarningText, ...warningMessages].filter(Boolean).join('\n');
        const showWarningMarker = Boolean(showPeopleTemplateMappingWarning || showLimitExceededWarning || reachedEditModeRefinerCap);

        return {
            displayName: filterConfiguration.displayValue?.trim() ? filterConfiguration.displayValue : availableFilter.filterName,
            filterName: availableFilter.filterName,
            isMulti: this.isMultiValueFilter(filterConfiguration),
            showCount: !!filterConfiguration.showCount,
            expandByDefault: !!filterConfiguration.expandByDefault,
            showWarningMarker,
            showLimitExceededWarning,
            limitExceededWarningText,
            showPeopleTemplateMappingWarning,
            peopleTemplateMappingWarningText,
            warningMessages,
            warningMarkerTooltipText,
            selectedOnce: selectionState.selectedOnce,
            selectedTemplate: filterConfiguration.selectedTemplate,
            hasSelectedValues: selectionState.hasSelectedValues,
            values,
            operator: filterOperator,
            sortIdx: filterConfiguration.sortIdx,
            canApply: selectionState.canApply,
            canClear: selectionState.canClear,
            termSetId: filterConfiguration.termSetId,
            termGroupId: filterConfiguration.termGroupId,
            hideNodesNotInDataSet: filterConfiguration.hideNodesNotInDataSet,
            expandAllNodesByDefault: filterConfiguration.expandAllNodesByDefault
        };
    }

    private async populateHierarchicalTerms(filterResultInternal: IFilterInternalWithWarning & { termSetId?: string; termGroupId?: string; hierarchicalTerms?: IHierarchicalTerm[]; hideNodesNotInDataSet?: boolean; expandAllNodesByDefault?: boolean }, availableFilter: IDataFilterResult, values: IDataFilterValueInternal[], filterConfiguration: IHierarchicalFilterConfiguration, debugContext?: IUpdateDebugContext): Promise<void> {
        if (filterConfiguration.selectedTemplate !== BuiltinFilterTemplates.Hierarchical
            || !filterConfiguration.termSetId
            || !filterConfiguration.termGroupId
            || !this.props.taxonomyService) {
            return;
        }

        try {
            const hierarchyCacheKey = this.getHierarchyCacheKey(
                availableFilter.filterName,
                filterConfiguration.termSetId,
                filterConfiguration.termGroupId
            );

            let hierarchicalTerms = this._hierarchyCacheByFilterKey.get(hierarchyCacheKey);
            let taxonomyFetchMs = 0;
            let usedHierarchyCache = true;

            if (!hierarchicalTerms) {
                usedHierarchyCache = false;
                const taxonomyStartedAt = performance.now();
                const terms = await this.props.taxonomyService.getTermsByTermSetId(
                    this.props.context.pageContext.web.absoluteUrl,
                    filterConfiguration.termSetId,
                    filterConfiguration.termGroupId,
                    filterConfiguration.cacheDuration
                );
                taxonomyFetchMs = performance.now() - taxonomyStartedAt;

                hierarchicalTerms = this.buildHierarchy(terms);
                this.setLimitedCacheEntry(
                    this._hierarchyCacheByFilterKey,
                    hierarchyCacheKey,
                    hierarchicalTerms,
                    SearchFiltersContainer._HIERARCHY_CACHE_LIMIT
                );
            }

            if (debugContext) {
                this.logUpdateStep(debugContext, 'getFiltersToDisplay:filter:taxonomyFetched', {
                    currentFilter: availableFilter.filterName,
                    termCount: hierarchicalTerms.length,
                    taxonomyFetchMs: taxonomyFetchMs.toFixed(1),
                    usedHierarchyCache
                });
            }

            if (!filterConfiguration.hideNodesNotInDataSet) {
                filterResultInternal.hierarchicalTerms = hierarchicalTerms;
                return;
            }

            const resultGuids = this.buildGuidSetFromFilterValues(availableFilter.values);
            const selectedGuids = this.buildGuidSetFromFilterValues(values.filter(value => value.selected));
            const prunedCacheKey = `${hierarchyCacheKey}::${this.getGuidSetSignature(resultGuids)}::${this.getGuidSetSignature(selectedGuids)}`;

            let prunedHierarchy = this._prunedHierarchyCacheBySelectionKey.get(prunedCacheKey);
            if (!prunedHierarchy) {
                prunedHierarchy = this.pruneHierarchy(hierarchicalTerms, resultGuids, selectedGuids);
                this.setLimitedCacheEntry(
                    this._prunedHierarchyCacheBySelectionKey,
                    prunedCacheKey,
                    prunedHierarchy,
                    SearchFiltersContainer._PRUNED_HIERARCHY_CACHE_LIMIT
                );
            }

            filterResultInternal.hierarchicalTerms = prunedHierarchy.length > 0 ? prunedHierarchy : hierarchicalTerms;
        } catch (error) {
            Log.error('SearchFiltersContainer', new Error(`Error fetching hierarchical terms for filter ${availableFilter.filterName}: ${error}`));
        }
    }

    private async buildFilterToDisplay(availableFilter: IDataFilterResult, currentUiFilters: IDataFilterInternal[], filtersConfiguration: IDataFilterConfiguration[], debugContext?: IUpdateDebugContext): Promise<IDataFilterInternal | null> {
        const filterStartedAt = performance.now();
        const filterWithLimitInfo = availableFilter as IFilterResultWithLimitInfo;
        const filterConfiguration = DataFilterHelper.getConfigurationForFilter(availableFilter, filtersConfiguration) as IHierarchicalFilterConfiguration;

        if (!filterConfiguration) {
            return null;
        }

        if (debugContext) {
            this.logUpdateStep(debugContext, 'getFiltersToDisplay:filter:start', {
                currentFilter: availableFilter.filterName,
                availableValueCount: availableFilter.values.length,
                selectedTemplate: filterConfiguration.selectedTemplate
            });
        }

        const { selectedFilterIdx, selectedFilterValues, selectedValueIndexByRaw } = this.getSelectedFilterUiContext(currentUiFilters, availableFilter, filterConfiguration);
        let values = this.buildDisplayValues(availableFilter, currentUiFilters, selectedFilterIdx, selectedFilterValues, selectedValueIndexByRaw, filterConfiguration);
        values = this.appendAdditionalSelectedValues(values, currentUiFilters, selectedFilterIdx);

        const selectionState = this.getFilterSelectionState(availableFilter, values, currentUiFilters, selectedFilterIdx);

        if (debugContext) {
            this.logUpdateStep(debugContext, 'getFiltersToDisplay:filter:valuesProcessed', {
                currentFilter: availableFilter.filterName,
                uiValueCount: values.length,
                hasSelectedValues: selectionState.hasSelectedValues,
                canApply: selectionState.canApply,
                canClear: selectionState.canClear
            });
        }

        values = values.map(value => {
            value.disabled = !filterConfiguration.isMulti && selectionState.hasSelectedValues && !value.selected;
            return value;
        });

        const filterResultInternal = this.buildFilterResultInternal(
            availableFilter,
            filterConfiguration,
            values,
            currentUiFilters,
            selectedFilterIdx,
            filterWithLimitInfo,
            selectionState
        );

        await this.populateHierarchicalTerms(filterResultInternal, availableFilter, values, filterConfiguration, debugContext);

        if (debugContext) {
            this.logUpdateStep(debugContext, 'getFiltersToDisplay:filter:done', {
                currentFilter: availableFilter.filterName,
                filterElapsedMs: (performance.now() - filterStartedAt).toFixed(1)
            });
        }

        return filterResultInternal;
    }

    private buildFilterValueInternal(filterValue: IDataFilterValueInfo): IDataFilterValueInternal {
        return {
            selected: filterValue.selected,
            name: this.resolveFilterDisplayName(`${filterValue.name ?? ''}`, `${filterValue.value ?? ''}`),
            value: filterValue.value,
            operator: filterValue.operator,
            selectedOnce: true
        };
    }

    private createNewUiFilter(filterInfo: IDataFilterInfo, filterConfiguration: IDataFilterConfiguration): IDataFilterInternal & { termSetId?: string } {
        const filterValuesInternal: IDataFilterValueInternal[] = filterInfo.filterValues.map(filterValue => {
            return {
                selected: filterValue.selected,
                name: this.resolveFilterDisplayName(`${filterValue.name ?? ''}`, `${filterValue.value ?? ''}`),
                value: filterValue.value,
                selectedOnce: true
            };
        });

        return {
            displayName: filterConfiguration.displayValue?.trim() ? filterConfiguration.displayValue : filterInfo.filterName,
            filterName: filterInfo.filterName,
            hasSelectedValues: filterInfo.filterValues.some(value => value.selected),
            selectedOnce: true,
            isMulti: this.isMultiValueFilter(filterConfiguration),
            showCount: !!filterConfiguration.showCount,
            expandByDefault: !!filterConfiguration.expandByDefault,
            values: filterValuesInternal,
            operator: filterInfo.operator ? filterInfo.operator : filterConfiguration.operator,
            selectedTemplate: filterConfiguration.selectedTemplate,
            sortIdx: filterConfiguration.sortIdx,
            termSetId: (filterConfiguration as IHierarchicalFilterConfiguration).termSetId
        };
    }

    private mergeFilterValuesIntoUiFilters(currentUiFilters: IDataFilterInternal[], filterIdx: number, filterInfo: IDataFilterInfo, filterConfiguration: IDataFilterConfiguration): IDataFilterInternal[] {
        let updatedUiFilters = cloneDeep(currentUiFilters);

        if (filterInfo.operator) {
            updatedUiFilters = update(updatedUiFilters, { [filterIdx]: { operator: { $set: filterInfo.operator } } });
        }

        if (!this.isMultiValueFilter(filterConfiguration)) {
            updatedUiFilters[filterIdx].values = updatedUiFilters[filterIdx].values.map(value => ({
                ...value,
                selected: false
            }));
        }

        filterInfo.filterValues.forEach(filterValue => {
            const filterValueInternal = this.buildFilterValueInternal(filterValue);
            const valueIdx = updatedUiFilters[filterIdx].values.findIndex(value => value.value === filterValue.value);

            if (valueIdx === -1) {
                updatedUiFilters = update(updatedUiFilters, { [filterIdx]: { values: { $push: [filterValueInternal] } } });
                return;
            }

            updatedUiFilters = update(updatedUiFilters, { [filterIdx]: { values: { [valueIdx]: { $set: filterValueInternal } } } });
        });

        return updatedUiFilters;
    }

    private updatePendingMultiFilterState(currentUiFilters: IDataFilterInternal[], filterName: string): void {
        const updatedFilterIdx = currentUiFilters.findIndex(filter => filter.filterName === filterName);
        if (updatedFilterIdx === -1) {
            return;
        }

        const updatedFilter = currentUiFilters[updatedFilterIdx];
        updatedFilter.values = updatedFilter.values.slice().sort((left, right) => {
            if (left.selected !== right.selected) {
                return left.selected ? -1 : 1;
            }

            const leftLabel = `${left.name ?? left.value ?? ''}`;
            const rightLabel = `${right.name ?? right.value ?? ''}`;
            return leftLabel.localeCompare(rightLabel);
        });

        const currentSelectedValuesInUiForFilter = updatedFilter.values
            .filter(value => value.selected)
            .map(value => `${value.value}`)
            .sort((left, right) => left.localeCompare(right));
        const alreadySubmittedValuesForFilter = flatten(
            this.state.submittedFilters
                .filter(submittedFilter => submittedFilter.filterName === updatedFilter.filterName)
                .map(submittedFilter => submittedFilter.values)
        )
            .map(value => `${value.value}`)
            .sort((left, right) => left.localeCompare(right));

        updatedFilter.hasSelectedValues = updatedFilter.values.some(value => value.selected);
        updatedFilter.selectedOnce = true;
        updatedFilter.canApply = !isEqual(currentSelectedValuesInUiForFilter, alreadySubmittedValuesForFilter);
        updatedFilter.canClear = alreadySubmittedValuesForFilter.length > 0 || updatedFilter.hasSelectedValues;
    }

    private hasAppliedFilters(filters: IDataFilter[]): boolean {
        return filters.some(filter => filter.values.length > 0);
    }

    private getFiltersAfterClear(currentUiFilters: IDataFilterInternal[], filterName: string): IDataFilterInternal[] {
        return currentUiFilters.map(selectedFilter => {
            const updatedFilter = cloneDeep(selectedFilter);

            if (updatedFilter.filterName === filterName) {
                updatedFilter.values = [];
                updatedFilter.selectedOnce = true;
                updatedFilter.hasSelectedValues = false;
            } else {
                updatedFilter.values = updatedFilter.values.filter(selectedValue => selectedValue.selected);
            }

            return updatedFilter;
        });
    }

    private getSubmittedFiltersAfterClear(submittedFilters: IDataFilter[], filterName: string): IDataFilter[] {
        return submittedFilters.map(submittedFilter => {
            if (submittedFilter.filterName !== filterName) {
                return submittedFilter;
            }

            return {
                ...submittedFilter,
                values: []
            };
        });
    }

    private commitPendingMultiFilterState(currentUiFilters: IDataFilterInternal[], debugContext?: IUpdateDebugContext): void {
        if (debugContext) {
            this.logUpdateStep(debugContext, 'onFilterValuesUpdated:multiFastPath:beforeStateCommit');
        }

        this._skipNextUiRefreshFromLocalSelection = true;
        this.setState({
            currentUiFilters: sortBy(currentUiFilters, 'sortIdx')
        }, () => {
            if (debugContext) {
                this.logUpdateStep(debugContext, 'onFilterValuesUpdated:multiFastPath:stateCommitted');
            }

            this.endResultsUpdate();
        });
    }

    private commitSubmittedFilterUpdate(currentUiFilters: IDataFilterInternal[], filterInfo: IDataFilterInfo, filterConfiguration: IDataFilterConfiguration, debugContext?: IUpdateDebugContext): void {
        const submittedFilters = this.getSelectedFiltersFromUIFilters(currentUiFilters);
        const sortedCurrentUiFilters = sortBy(currentUiFilters, 'sortIdx');
        this._skipNextUiRefreshFromLocalSelection = true;

        this.setState({
            currentUiFilters: sortedCurrentUiFilters,
            submittedFilters
        }, () => {
            if (debugContext) {
                this.logUpdateStep(debugContext, 'onFilterValuesUpdated:submittedStateCommitted', {
                    submittedFilterCount: submittedFilters.length
                });
            }

            this.queueDeferredSubmittedFiltersUpdate(submittedFilters, filterInfo.filterName);

            if (filterConfiguration.isMulti) {
                this.forceUpdate();
            }
        });
    }

    public render(): React.ReactElement<ISearchFiltersContainerProps> {

        let renderWpContent: JSX.Element = null;
        let templateContent: string = null;
        const renderTitle = <StyledWebPartTitle
            instanceId={this.props.instanceId}
            titleFont={this.props.titleFont}
            titleFontSize={this.props.titleFontSize}
            titleFontColor={this.props.titleFontColor}
            webPartTitleProps={this.props.webPartTitleProps}
        />;

        // If no filter 
        if (this.state.currentUiFilters.length === 0) {

            if (this.props.webPartTitleProps.displayMode === DisplayMode.Edit) {
                renderWpContent = <MessageBar messageBarType={MessageBarType.info}>{webPartStrings.General.NoAvailableFilterMessage}</MessageBar>;
            }

        } else {

            // Content loading
            templateContent = this.props.templateService.getTemplateMarkup(this.props.templateContent);
            const templateContext = this.getTemplateContext();

            renderWpContent = <TemplateRenderer
                key={`${this.props.instanceId}_${this.props.selectedLayoutKey}`}
                templateContent={templateContent}
                templateContext={templateContext}
                templateService={this.props.templateService}
                instanceId={this.props.instanceId}
                renderType={LayoutRenderType.Handlebars} // Only allow Handlebars for filters
            />;
        }

        const containerStyles: React.CSSProperties = {
            position: 'relative',
            backgroundColor: this.props.filterBackgroundColor || undefined,
            borderStyle: this.props.filterBorderColor || this.props.filterBorderThickness ? 'solid' : undefined,
            borderColor: this.props.filterBorderColor || undefined,
            borderWidth: this.props.filterBorderThickness === undefined ? undefined : `${this.props.filterBorderThickness}px`
        };

        return <div ref={this.componentRef} data-instance-id={this.props.instanceId} style={containerStyles} onPointerDownCapture={this.primeBusyCursorFromInteraction}>
            {renderTitle}
            {renderWpContent}
        </div>;
    }

    public componentDidMount() {
        this._isMounted = true;

        // Bind events when filter values are selected
        this.bindFilterEvents();

        // Bind events when mutli valued filter value are applied for a specific filter
        this.bindApplyFiltersEvents();

        // Bind events when mutli valued filter value are cleared for a specific filter
        this.bindClearFiltersEvents();

        // Bind events when the values operator is updated for a specific filter
        // Use case when the opeartor control is used directly in the Handlebars template. Otherwise, for nested component usage (ex: combo box), the operator value will be changed through the IDataFilterInfo interface direcrtly and not trought a JavaScript event.
        this.bindFilterValueOperatorUpdated();

        const hasDeepLink = !!UrlHelper.getQueryStringParam(this.deeplinkQueryStringParam, globalThis.location.href);

        // Process deep links first so restored selections are not overwritten by an empty initial UI refresh.
        if (hasDeepLink) {
            this.getFiltersDeepLink();
        } else {
            // Initial state
            this.getFiltersToDisplay(this.props.availableFilters, [], this.props.filtersConfiguration);
        }

        this._handleQueryStringChange();
    }

    public componentDidUpdate(prevProps: ISearchFiltersContainerProps, prevState: ISearchFiltersContainerState) {

        const availableFiltersChanged = !isEqual(prevProps.availableFilters, this.props.availableFilters);
        const currentUiFiltersChanged = !isEqual(prevState.currentUiFilters, this.state.currentUiFilters) && prevState.currentUiFilters.length > 0;

        if (availableFiltersChanged && this.state.isUpdatingResults) {
            this.endResultsUpdate();
        }

        // When filters configuration is updated or the layout is changed 
        if (!isEqual(prevProps.selectedLayoutKey, this.props.selectedLayoutKey)
            || !isEqual(prevProps.properties, this.props.properties)) {

            const updatedfilters = this.resetSelectedFilterValues(this.state.currentUiFilters);
            const submittedFilters = this.getSelectedFiltersFromUIFilters(updatedfilters);

            this.getFiltersToDisplay(this.props.availableFilters, [], this.props.filtersConfiguration);

            this.resetFiltersDeepLink();

            this.props.onUpdateFilters(submittedFilters);
        }

        // When new filters are received from the data source
        if (availableFiltersChanged || currentUiFiltersChanged) {

            if (this._skipNextUiRefreshFromLocalSelection && !availableFiltersChanged) {
                this._skipNextUiRefreshFromLocalSelection = false;
                return;
            }

            this.getFiltersToDisplay(this.props.availableFilters, this.state.currentUiFilters, this.props.filtersConfiguration);

            // submittedFilters must NOT be synced here.
            // It is exclusively managed by: bindApplyFiltersEvents (Apply clicked),
            // onFilterValuesUpdated (non-multi immediate apply), and getFiltersDeepLink (deep link restore).
            // Syncing it here would immediately promote pending UI selections to submitted,
            // making canApply always false for multi-select filters.
        }
    }

    /**
     * Determines filters to be sent to the Handlebars templates as context with enhanced information from configuration
     * @param availableFilters the available filter results returned from the data source
     * @param currentUIFilters the current selected filters in the UI
     * @param filtersConfiguration the filter configuration from the property pane
     */
    private async getFiltersToDisplay(availableFilters: IDataFilterResult[], currentUiFilters: IDataFilterInternal[], filtersConfiguration: IDataFilterConfiguration[], debugContext?: IUpdateDebugContext): Promise<void> {

        if (debugContext) {
            this.logUpdateStep(debugContext, 'getFiltersToDisplay:start', {
                availableFilterCount: availableFilters.length,
                currentUiFilterCount: currentUiFilters.length
            });
        }

        const updatedFilters: IDataFilterInternal[] = [];

        for (const availableFilter of availableFilters) {
            const filterResultInternal = await this.buildFilterToDisplay(availableFilter, currentUiFilters, filtersConfiguration, debugContext);
            if (filterResultInternal) {
                updatedFilters.push(filterResultInternal);
            }
        }

        const sortStartedAt = performance.now();
        const sortedFilters = sortBy(updatedFilters.filter(Boolean), 'sortIdx');

        if (debugContext) {
            this.logUpdateStep(debugContext, 'getFiltersToDisplay:beforeSetState', {
                sortedFilterCount: sortedFilters.length,
                sortMs: (performance.now() - sortStartedAt).toFixed(1)
            });
        }

        this.setState({
            currentUiFilters: sortedFilters
        }, () => {
            if (debugContext) {
                this.logUpdateStep(debugContext, 'getFiltersToDisplay:stateCommitted', {
                    updatedFilterCount: updatedFilters.length
                });
            }
        });
    }

    /**
     * Update the filter status in the state according to values
     * @param filterInfo the information about the updated filter
     */
    private onFilterValuesUpdated(filterInfo: IDataFilterInfo, debugContext?: IUpdateDebugContext) {

        if (debugContext) {
            this.logUpdateStep(debugContext, 'onFilterValuesUpdated:start', {
                selectedValueCount: (filterInfo.filterValues || []).filter(value => value.selected).length,
                forceUpdate: !!filterInfo.forceUpdate
            });
        }

        const filterConfiguration = this.props.filtersConfiguration.find(filter => filter.filterName === filterInfo.filterName);
        if (!filterConfiguration) {
            this.endResultsUpdate();
            return;
        }

        this.processFilterValuesUpdated(filterInfo, filterConfiguration, debugContext);
    }

    private processFilterValuesUpdated(filterInfo: IDataFilterInfo, filterConfiguration: IDataFilterConfiguration, debugContext?: IUpdateDebugContext): void {
        let currentUiFilters: IDataFilterInternal[] = [];
        const filterIdx = this.state.currentUiFilters.map(filter => filter.filterName).indexOf(filterInfo.filterName);

        if (filterIdx === -1) {
            currentUiFilters = update(this.state.currentUiFilters, { $push: [this.createNewUiFilter(filterInfo, filterConfiguration)] });
        } else {
            currentUiFilters = this.mergeFilterValuesIntoUiFilters(this.state.currentUiFilters, filterIdx, filterInfo, filterConfiguration);
        }

        if (debugContext) {
            this.logUpdateStep(debugContext, 'onFilterValuesUpdated:uiMerged', {
                filterExistsInUi: filterIdx !== -1,
                isMulti: this.isMultiValueFilter(filterConfiguration)
            });
        }

        if (this.isMultiValueFilter(filterConfiguration) && !filterInfo.forceUpdate) {
            this.updatePendingMultiFilterState(currentUiFilters, filterInfo.filterName);
            this.commitPendingMultiFilterState(currentUiFilters, debugContext);
            return;
        }

        this.commitSubmittedFilterUpdate(currentUiFilters, filterInfo, filterConfiguration, debugContext);
    }

    public componentWillUnmount(): void {
        this._isMounted = false;

        if (this._deferredSubmittedUpdateTimer) {
            clearTimeout(this._deferredSubmittedUpdateTimer);
            this._deferredSubmittedUpdateTimer = null;
        }

        if (this._busyWatchdogTimer) {
            clearTimeout(this._busyWatchdogTimer);
            this._busyWatchdogTimer = null;
        }

        if (this._busyPrimeTimer) {
            clearTimeout(this._busyPrimeTimer);
            this._busyPrimeTimer = null;
        }

        if (this._busyHideTimer) {
            clearTimeout(this._busyHideTimer);
            this._busyHideTimer = null;
        }

        if (this._busyCursorAutoHideTimer) {
            clearTimeout(this._busyCursorAutoHideTimer);
            this._busyCursorAutoHideTimer = null;
        }

        this.setBusyCursor(false);

        this._latestDeferredSubmittedFilters = null;
    }

    private isStaticPeopleFilter(filterName?: string): boolean {
        if (!filterName) {
            return false;
        }

        return this.props.filtersConfiguration.some(filter => filter.filterName === filterName && filter.selectedTemplate === BuiltinFilterTemplates.StaticPeople);
    }

    /**
     * Gets only the selected filters from the UI and convert them to format sent to the data source
     * @param currentUiFilters the current UI filters (selected or not)
     */
    private getSelectedFiltersFromUIFilters(currentUiFilters: IDataFilterInternal[]): IDataFilter[] {

        const selectedFilters: IDataFilter[] = currentUiFilters.map(selectedFilter => {

            const newSelectedFilter = cloneDeep(selectedFilter);

            // Update the operator to 'or' when single value mode is selected and multiple values are submitted
            if (selectedFilter.values.some(v => v.selected) && !selectedFilter.isMulti && selectedFilter.selectedTemplate !== BuiltinFilterTemplates.DateRange) {
                newSelectedFilter.operator = FilterConditionOperator.OR;
            }

            const values = newSelectedFilter.values.filter(selectedValue => {
                const hasValue = selectedValue.value !== undefined && selectedValue.value !== null && `${selectedValue.value}`.trim().length > 0;
                return selectedValue.selected && hasValue;
            });

            if (values.length > 0) {
                const isStaticPeopleFilter = selectedFilter.selectedTemplate === BuiltinFilterTemplates.StaticPeople;

                newSelectedFilter.values = values.map(value => {

                    let newValue = cloneDeep(value);

                    // Remove useless properties since we don't want to expose them in the data source, especially for consumers
                    delete newValue.selected;
                    delete newValue.selectedOnce;
                    delete newValue.count;

                    // 'Equals' by default
                    if (!newValue.operator) newValue.operator = FilterComparisonOperator.Eq;

                    if (isStaticPeopleFilter) {
                        const displayNameValue = `${newValue.name ?? newValue.value ?? ''}`.trim();
                        newValue.value = displayNameValue;
                        newValue.name = displayNameValue;
                        newValue.operator = FilterComparisonOperator.Eq;
                    } else {
                        // Guard rail: normalize malformed taxonomy tokens before submitting to query/URL.
                        // This prevents trailing garbage characters in GP0/GPP/L0 GUID payloads.
                        newValue.value = this.sanitizeTaxonomyRefinementValue(`${newValue.value ?? ''}`);
                    }

                    return newValue;
                });

                // Remove useless properties since we don't want to expose them in the data source, especially for consumers
                // We need to return only proeprties used for IDataFilter to avoid confusion
                delete newSelectedFilter.expandByDefault;
                delete newSelectedFilter.hasSelectedValues;
                delete newSelectedFilter.selectedOnce;
                delete newSelectedFilter.showCount;
                delete newSelectedFilter.isMulti;
                delete newSelectedFilter.displayName;
                delete newSelectedFilter.canApply;
                delete newSelectedFilter.canClear;
                delete newSelectedFilter.sortIdx;
                delete newSelectedFilter.selectedTemplate;
                // Strip hierarchical term tree — it's re-fetched on load and must not bloat the URL
                delete (newSelectedFilter as any).hierarchicalTerms;
                delete (newSelectedFilter as any).termSetId;
                delete (newSelectedFilter as any).termGroupId;

                return newSelectedFilter;
            }
        });

        return selectedFilters.filter(Boolean);
    }

    private sanitizeTaxonomyRefinementValue(rawValue: string): string {
        if (!rawValue || typeof rawValue !== 'string') {
            return rawValue;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawValue);
        if (!decodedValue) {
            return rawValue;
        }

        const tokenRegex = /^((?:GP0|GPP|L0)\|#0?)([-0-9a-f]+)/i;
        const tokenMatch = tokenRegex.exec(decodedValue);
        if (!tokenMatch) {
            return rawValue;
        }

        const guidCandidate = tokenMatch[2];
        const extractedGuid = TaxonomyHelper.extractGuidFromTermId(guidCandidate);
        if (!extractedGuid || extractedGuid === guidCandidate) {
            return rawValue;
        }

        return this.encodeTaxonomyRefinementToken(`${tokenMatch[1]}${extractedGuid}`);
    }

    private isMultiValueFilter(filterConfiguration: IDataFilterConfiguration | IHierarchicalFilterConfiguration): boolean {
        return !!filterConfiguration.isMulti;
    }

    private encodeTaxonomyRefinementToken(token: string): string {
        const hex = token
            .split('')
            .map(char => (char.codePointAt(0) || 0).toString(16).padStart(2, '0'))
            .join('');

        return `"ǂǂ${hex}"`;
    }

    /**
     * Binds event fired from filter value web components ('When an single filter value is selected')
     */
    private bindFilterEvents() {

        this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_UPDATED, ((ev: CustomEvent) => {

            // We ensure the event if not propagated outside the component (i.e. other Web Part instances)
            ev.stopImmediatePropagation();

            const dataFilterInfo = ev.detail as IDataFilterInfo & { selectionStartedAt?: number };

            // Only process the filter event if it belongs to this web part instance
            if (dataFilterInfo.instanceId === this.props.instanceId) {
                this.beginResultsUpdate(dataFilterInfo.filterName, () => {
                    const debugContext = this._enableUpdateDebugLogging
                        ? this.createUpdateDebugContext(dataFilterInfo.filterName, ExtensibilityConstants.EVENT_FILTER_UPDATED, dataFilterInfo.selectionStartedAt)
                        : undefined;

                    if (debugContext) {
                        this.logUpdateStep(debugContext, 'event:received', {
                            selectedValueCount: (dataFilterInfo.filterValues || []).filter(value => value.selected).length
                        });
                    }

                    // Need the 'selected' because web components are stateless so we need to know if the filter has been selected or removed
                    this.onFilterValuesUpdated(dataFilterInfo, debugContext);
                });
            }

        }));
    }

    /**
     * Binds event fired from filter value web components ('When all filter values are applied (multi values filter)')
     */
    private bindApplyFiltersEvents() {

        this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_APPLY_ALL, ((ev: CustomEvent) => {

            ev.stopImmediatePropagation();

            const eventDetail = ev.detail as { instanceId: string };

            // Only process the event if it belongs to this web part instance
            if (eventDetail.instanceId === this.props.instanceId) {
                const startedAt = performance.now();
                const currentUiFilters = this.state.currentUiFilters;
                console.info('[PnP Modern Search][Search Filters] applyAll:start', {
                    instanceId: this.props.instanceId
                });

                this.beginResultsUpdate(currentUiFilters.find(filter => filter.values.some(value => value.selected))?.filterName, () => {
                    const submittedFilters = this.getSelectedFiltersFromUIFilters(currentUiFilters);

                    // Set the filter links in URL
                    this.setFiltersDeepLink(submittedFilters);

                    // Refresh the UI
                    this.getFiltersToDisplay(this.props.availableFilters, currentUiFilters, this.props.filtersConfiguration);

                    this.setState({
                        submittedFilters: submittedFilters
                    }, () => {
                        console.info('[PnP Modern Search][Search Filters] applyAll:submittedStateCommitted', {
                            submittedFilterCount: submittedFilters.length,
                            totalMs: (performance.now() - startedAt).toFixed(1),
                            instanceId: this.props.instanceId
                        });
                    });

                    // Send selected filters to the data source
                    this.props.onUpdateFilters(submittedFilters);

                    console.info('[PnP Modern Search][Search Filters] applyAll:onUpdateFiltersDispatched', {
                        totalMs: (performance.now() - startedAt).toFixed(1),
                        instanceId: this.props.instanceId
                    });
                });
            }

        }));
    }

    /**
     * Binds event fired from filter value web components ('When all filter values are cleared (multi values filter)')
     */
    private bindClearFiltersEvents() {

        this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, ((ev: CustomEvent) => {

            ev.stopImmediatePropagation();

            const eventDetail = ev.detail as { filterName: string; instanceId: string };

            // Only process the event if it belongs to this web part instance
            if (eventDetail.instanceId !== this.props.instanceId) {
                return;
            }

            const startedAt = performance.now();
            console.info('[PnP Modern Search][Search Filters] clearAll:start', {
                filterName: eventDetail.filterName,
                instanceId: this.props.instanceId
            });

            this.beginResultsUpdate(eventDetail.filterName, () => {
                const updatedfilters = this.getFiltersAfterClear(this.state.currentUiFilters, eventDetail.filterName);
                const updateSubmittedFilters = this.getSubmittedFiltersAfterClear(this.state.submittedFilters, eventDetail.filterName);

                this.setState(() => ({
                    submittedFilters: updateSubmittedFilters
                }));

                // Refresh the UI
                this.getFiltersToDisplay(this.props.availableFilters, updatedfilters, this.props.filtersConfiguration);

                // Check whether there are applied filters
                if (this.hasAppliedFilters(updateSubmittedFilters)) {
                    // If yes - update query string
                    this.setFiltersDeepLink(updateSubmittedFilters);
                } else {
                    // If no - remove query string
                    this.resetFiltersDeepLink();
                }

                // Send selected filters to the data source
                this.props.onUpdateFilters(updateSubmittedFilters);

                console.info('[PnP Modern Search][Search Filters] clearAll:done', {
                    filterName: eventDetail.filterName,
                    submittedFilterCount: updateSubmittedFilters.length,
                    totalMs: (performance.now() - startedAt).toFixed(1),
                    instanceId: this.props.instanceId
                });
            });

        }));
    }

    /**
     * Binds events fired from the filter operator components
     */
    private bindFilterValueOperatorUpdated() {

        this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_VALUE_OPERATOR_UPDATED, ((ev: CustomEvent) => {

            ev.stopImmediatePropagation();

            const eventDetail = ev.detail as { filterName: string; operator: any; instanceId: string };

            // Only process the event if it belongs to this web part instance
            if (eventDetail.instanceId !== this.props.instanceId) {
                return;
            }

            const startedAt = performance.now();
            console.info('[PnP Modern Search][Search Filters] operatorUpdate:start', {
                filterName: eventDetail.filterName,
                operator: eventDetail.operator,
                instanceId: this.props.instanceId
            });

            this.beginResultsUpdate(eventDetail.filterName, () => {
                // Find the filter wit hthis specific name
                const filters = cloneDeep(this.state.currentUiFilters).map(filter => {
                    if (filter.filterName === eventDetail.filterName) {

                        filter.operator = eventDetail.operator;
                        filter.canApply = false;
                    }

                    return filter;
                });

                const sortedFilters = sortBy(filters, 'sortIdx');
                const submittedFilters = this.getSelectedFiltersFromUIFilters(sortedFilters);

                this.setState({
                    currentUiFilters: sortedFilters,
                    submittedFilters
                }, () => {

                    if (this.hasAppliedFilters(submittedFilters)) {
                        this.setFiltersDeepLink(submittedFilters);
                    } else {
                        this.resetFiltersDeepLink();
                    }

                    this.props.onUpdateFilters(submittedFilters);

                    console.info('[PnP Modern Search][Search Filters] operatorUpdate:stateCommitted', {
                        filterName: eventDetail.filterName,
                        operator: eventDetail.operator,
                        submittedFilterCount: submittedFilters.length,
                        totalMs: (performance.now() - startedAt).toFixed(1),
                        instanceId: this.props.instanceId
                    });
                });
            });

        }));
    }

    // Build the template context
    private getTemplateContext(): ISearchFiltersTemplateContext {
        return {
            filters: this.state.currentUiFilters,
            selectedFilters: this.state.submittedFilters,
            instanceId: this.props.instanceId,
            theme: this.props.themeVariant,
            strings: commonStrings.Filters,
            selectedOnce: this.state.currentUiFilters.some(currentFilter => currentFilter.selectedOnce),
            properties: {
                ...this.props.properties
            },
        };
    }

    /**
     * Retrieves the default filters from the URL and set them as initial state
     */
    private getFiltersDeepLink() {

        const queryString = UrlHelper.getQueryStringParam(this.deeplinkQueryStringParam, globalThis.location.href);

        if (!queryString) {
            this._lastProcessedDeepLink = '';
            return;
        }

        if (this._lastProcessedDeepLink === queryString) {
            return;
        }

        if (queryString) {

            try {

                const parsedFilters: IDataFilter[] = JSON.parse(decodeURIComponent(queryString));
                const dataFilters: IDataFilter[] = parsedFilters.map(filter => {
                    const sanitizedValues = (filter.values || []).filter((value: any) => {
                        return !!value?.value && `${value.value}`.trim().length > 0;
                    }).map((value: any) => {
                        return {
                            ...value,
                            value: this.sanitizeTaxonomyRefinementValue(`${value.value ?? ''}`)
                        };
                    });

                    return {
                        ...filter,
                        values: sanitizedValues
                    };
                }).filter(filter => filter.values && filter.values.length > 0);

                const currentUiFilters = dataFilters.map(filter => {

                    const filterConfiguration = DataFilterHelper.getConfigurationForFilter(filter, this.props.filtersConfiguration);

                    return {
                        displayName: filterConfiguration.displayValue?.trim() ? filterConfiguration.displayValue : filter.filterName,
                        expandByDefault: filterConfiguration.expandByDefault,
                        filterName: filter.filterName,
                        isMulti: this.isMultiValueFilter(filterConfiguration),
                        selectedTemplate: filterConfiguration.selectedTemplate,
                        showCount: filterConfiguration.showCount,
                        showWarningMarker: false,
                        showLimitExceededWarning: false,
                        limitExceededWarningText: undefined,
                        showPeopleTemplateMappingWarning: false,
                        peopleTemplateMappingWarningText: undefined,
                        warningMessages: undefined,
                        warningMarkerTooltipText: undefined,
                        selectedOnce: true,
                        operator: filter.operator,
                        values: (filter.values as IDataFilterValueInternal[]).map((value: IDataFilterValueInternal) => {
                            value.selected = true;
                            value.selectedOnce = true;
                            return value;
                        }),
                        canApply: false,
                        canClear: true,
                        sortIdx: filterConfiguration.sortIdx,
                        termSetId: (filterConfiguration as IHierarchicalFilterConfiguration).termSetId,
                        termGroupId: (filterConfiguration as IHierarchicalFilterConfiguration).termGroupId
                    } as unknown as IDataFilterInternal;
                });

                // Avoid re-applying identical deep-link filters on every URL change event.
                // This prevents feedback loops where pushState/popstate keeps triggering identical updates.
                if (isEqual(this.state.submittedFilters, dataFilters)) {
                    this._lastProcessedDeepLink = queryString;
                    return;
                }

                this._lastProcessedDeepLink = queryString;

                // Update selected filters in the UI
                this.setState({
                    currentUiFilters: currentUiFilters,
                    submittedFilters: dataFilters
                }, () => {
                    // Rebuild available values using restored deep-link selection state.
                    // This ensures static people selection remains marked after reload.
                    this.getFiltersToDisplay(this.props.availableFilters, currentUiFilters, this.props.filtersConfiguration);

                    // Update the connected data source only after UI state has been restored.
                    // This prevents a stale getFiltersToDisplay() pass from overwriting deep-link selections on refresh.
                    this.props.onUpdateFilters(dataFilters);
                });

            } catch {
                this._lastProcessedDeepLink = '';

                this.setState(prevState => ({
                    currentUiFilters: this.resetSelectedFilterValues(prevState.currentUiFilters),
                    submittedFilters: []
                }), () => {
                    this.getFiltersToDisplay(this.props.availableFilters, [], this.props.filtersConfiguration);
                    this.props.onUpdateFilters([]);
                });

                Log.verbose(`[SearchFiltersContainer.getFiltersDeepLink]`, `Filters format in the query string is invalid.`);
            }
        }
    }

    /**
     * Set the current selected filters as query string in the URL for deep linking
     * @param submittedFilters the current submitted filters
     */
    private setFiltersDeepLink(submittedFilters: IDataFilter[]) {

        const sanitizedSubmittedFilters: IDataFilter[] = (submittedFilters || []).map(filter => {
            return {
                ...filter,
                values: (filter.values || []).map(value => {
                    return {
                        ...value,
                        value: this.sanitizeTaxonomyRefinementValue(`${value.value ?? ''}`)
                    };
                })
            };
        });

        let filtersDeepLinkUrl: string;
        if (sanitizedSubmittedFilters.length > 0) {
            filtersDeepLinkUrl = UrlHelper.addOrReplaceQueryStringParam(globalThis.location.href, this.deeplinkQueryStringParam, JSON.stringify(sanitizedSubmittedFilters));
        } else {
            filtersDeepLinkUrl = UrlHelper.removeQueryStringParam(this.deeplinkQueryStringParam, globalThis.location.href);
        }

        this._lastProcessedDeepLink = UrlHelper.getQueryStringParam(this.deeplinkQueryStringParam, filtersDeepLinkUrl) || '';

        this._isUpdatingDeepLink = true;
        globalThis.history.pushState({ path: filtersDeepLinkUrl }, '', filtersDeepLinkUrl);
        this._isUpdatingDeepLink = false;
    }

    private resetFiltersDeepLink() {
        // Reset filters query string
        const filtersDeepLinkUrl = UrlHelper.removeQueryStringParam(this.deeplinkQueryStringParam, globalThis.location.href);
        this._lastProcessedDeepLink = '';
        this._isUpdatingDeepLink = true;
        globalThis.history.pushState({ path: filtersDeepLinkUrl }, '', filtersDeepLinkUrl);
        this._isUpdatingDeepLink = false;
    }

    /**
     * Subscribes to URL query string change events using SharePoint page router
     * https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/intercepting-query-changes-in-webparts
     */
    private _handleQueryStringChange() {

        ((history) => {
            let pushState = history.pushState;
            history.pushState = (state, key, path) => {
                pushState.apply(history, [state, key, path]);
                if (!this._isUpdatingDeepLink) {
                    this.getFiltersDeepLink();
                }
            };
        })(globalThis.history);

        // When the browser 'back' or 'forward' button is pressed
        globalThis.onpopstate = () => {

            const queryString = UrlHelper.getQueryStringParam(this.deeplinkQueryStringParam, globalThis.location.href);

            // Initial state where no filter are selected
            if (!queryString) {

                this.setState(prevState => ({
                    currentUiFilters: this.resetSelectedFilterValues(prevState.currentUiFilters),
                    submittedFilters: []
                }));

                // Notify connected Web Parts
                this.props.onUpdateFilters([]);
            }

            this.getFiltersDeepLink();
        };
    }

    private resetSelectedFilterValues(currentUiFilters: IDataFilterInternal[]): IDataFilterInternal[] {

        const updatedfilters = currentUiFilters.map(selectedFilter => {
            const updatedFilter = cloneDeep(selectedFilter);
            updatedFilter.values = [];
            return updatedFilter;
        });

        return updatedfilters;
    }
}
