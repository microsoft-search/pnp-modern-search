import * as React from 'react';
import { BaseWebComponent, IDataFilterValueInfo, ExtensibilityConstants, FilterComparisonOperator } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import styles from './FilterHierarchicalComponent.module.scss';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Icon } from '@fluentui/react/lib/Icon';
import * as strings from 'CommonStrings';
import { TaxonomyHelper } from '../../helpers/TaxonomyHelper';

export interface IFilterHierarchicalProps {

    /**
     * The filter configuration
     */
    filter?: any;

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * The currently submitted filters from the Search Filters web part.
     */
    selectedFilters?: any[];

    /**
     * The current theme settings
     */
    themeVariant?: any;

    /**
     * Handler when a filter value is selected
     */
    onChecked: (filterName: string, filterValue: IDataFilterValueInfo) => void;

    /**
     * The DOM element to dispatch events to
     */
    domElement?: HTMLElement;
}

export interface IFilterHierarchicalState {
    expandedTerms: { [key: string]: boolean };
    selectedTerms: { [key: string]: boolean };
    searchText: string;
}

export class FilterHierarchicalComponent extends React.Component<IFilterHierarchicalProps, IFilterHierarchicalState> {

    private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private pendingStateUpdateTimers: Array<ReturnType<typeof setTimeout>> = [];
    private static readonly GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';

    private setImmediateProgressCursor(): void {
        if (!globalThis.document) {
            return;
        }

        if (globalThis.document.documentElement) {
            globalThis.document.documentElement.style.setProperty('cursor', 'progress', 'important');
        }

        if (globalThis.document.body) {
            globalThis.document.body.style.setProperty('cursor', 'progress', 'important');
        }

        const styleId = FilterHierarchicalComponent.GLOBAL_BUSY_CURSOR_STYLE_ID;
        if (!globalThis.document.getElementById(styleId)) {
            const styleElement = globalThis.document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = '* { cursor: progress !important; }';
            globalThis.document.head.appendChild(styleElement);
        }
    }

    constructor(props: IFilterHierarchicalProps) {
        super(props);

        this.state = {
            expandedTerms: this.initializeExpandedTerms(),
            selectedTerms: this.initializeSelectedTerms(),
            searchText: ''
        };
    }

    private readonly initializeExpandedTerms = (): { [key: string]: boolean } => {
        const expandedTerms: { [key: string]: boolean } = {};

        const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
        if (hierarchicalTerms.length > 0) {
            if (this.props.filter?.expandAllNodesByDefault === true) {
                hierarchicalTerms.forEach(term => {
                    expandedTerms[term.id] = true;
                });
                this.expandAllDescendants(hierarchicalTerms, expandedTerms);
            } else if (this.props.filter?.expandByDefault === true) {
                // Only expand root level to avoid massive DOM rendering
                hierarchicalTerms.forEach(term => {
                    expandedTerms[term.id] = true;
                });
            }
        }

        // Always expand the path to currently selected terms so users can see context
        // (for example, Europa -> Germany -> Berlin when Berlin is selected).
        const selectedPathExpansions = this.getExpandedTermsForSelectedValues();
        Object.assign(expandedTerms, selectedPathExpansions);

        return expandedTerms;
    }

    private readonly getExpandedTermsForSelectedValues = (): { [key: string]: boolean } => {
        const expandedTerms: { [key: string]: boolean } = {};
        const selectedFilters = this.getSelectedFilterValues();
        const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];

        selectedFilters.forEach((filterValue: any) => {
            if (!filterValue?.value) {
                return;
            }

            const guidPart = TaxonomyHelper.extractGuidsFromFilterValue(filterValue.value)[0] || '';
            const labelPart = this.normalizeLabel(filterValue.name || '');

            if (guidPart) {
                this.findAndExpandPathToTerm(hierarchicalTerms, guidPart, expandedTerms);
            }

            if (labelPart) {
                this.findAndExpandPathToTermByLabel(hierarchicalTerms, labelPart, expandedTerms);
            }
        });

        return expandedTerms;
    }

    private readonly expandAllDescendants = (terms: any[], expandedTerms: { [key: string]: boolean }): void => {
        terms.forEach(term => {
            if (term.children?.length > 0) {
                expandedTerms[term.id] = true;
                this.expandAllDescendants(term.children, expandedTerms);
            }
        });
    }

    private readonly normalizeLabel = (value: string): string => {
        return this.getResolvedLabel(value).toLowerCase();
    }

    private readonly getResolvedLabel = (value: string): string => {
        const trimmedValue = `${value || ''}`.trim();

        // Fast path for already readable labels (most taxonomy term labels).
        // Avoid regex/decode work for each node on every render.
        if (trimmedValue
            && !trimmedValue.includes('|')
            && !trimmedValue.includes('ǂ')
            && !/^#?[0-9a-fA-F]{24,}$/.test(trimmedValue)) {
            return trimmedValue;
        }

        const extractReadableLabel = (input: string): string => {
            const cleanedValue = `${input || ''}`.trim().replace(/^"+|"+$/g, '');
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

            const emailMatch = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.exec(cleanedValue);
            if (emailMatch?.[1]) {
                return emailMatch[1];
            }

            const parts = cleanedValue.split('|').map(part => part.trim()).filter(Boolean);
            const firstReadablePart = parts.find(part => /[A-Za-z]/.test(part) && !/^#?[0-9a-fA-F]{24,}$/.test(part));
            if (firstReadablePart) {
                return firstReadablePart;
            }

            return '';
        };

        const rawValue = `${value || ''}`;
        const readableRawValue = extractReadableLabel(rawValue);
        if (readableRawValue) {
            return readableRawValue;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawValue);
        const readableDecodedValue = extractReadableLabel(decodedValue);
        if (readableDecodedValue) {
            return readableDecodedValue;
        }

        return rawValue.trim();
    }

    private readonly findAndExpandPathToTerm = (terms: any[], guidToMatch: string, expandedTerms: { [key: string]: boolean }): boolean => {
        for (const term of terms) {
            const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));

            if (termGuid === guidToMatch) {
                // Expand the selected term and all its descendants so the full sub-tree is visible.
                if (term.children?.length > 0) {
                    expandedTerms[term.id] = true;
                    this.expandAllDescendants(term.children, expandedTerms);
                }
                return true;
            }

            if (term.children?.length > 0) {
                if (this.findAndExpandPathToTerm(term.children, guidToMatch, expandedTerms)) {
                    expandedTerms[term.id] = true;
                    return true;
                }
            }
        }

        return false;
    }

    private readonly findAndExpandPathToTermByLabel = (terms: any[], labelToMatch: string, expandedTerms: { [key: string]: boolean }): boolean => {
        for (const term of terms) {
            const termLabel = this.normalizeLabel(term.label);

            if (termLabel === labelToMatch) {
                if (term.children?.length > 0) {
                    expandedTerms[term.id] = true;
                    this.expandAllDescendants(term.children, expandedTerms);
                }
                return true;
            }

            if (term.children?.length > 0) {
                if (this.findAndExpandPathToTermByLabel(term.children, labelToMatch, expandedTerms)) {
                    expandedTerms[term.id] = true;
                    return true;
                }
            }
        }

        return false;
    }

    private readonly initializeSelectedTerms = (): { [key: string]: boolean } => {
        const selectedTerms: { [key: string]: boolean } = {};
        const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
        const selectedFilters = this.getSelectedFilterValues();

        const selectedGuids = new Set<string>();
        const selectedLabels = new Set<string>();

        selectedFilters.forEach((fv: any) => {
            if (!fv?.value) {
                return;
            }

            TaxonomyHelper.extractGuidsFromFilterValue(fv.value).forEach(guid => selectedGuids.add(guid));
            const normalizedName = this.normalizeLabel(fv.name || '');
            if (normalizedName) {
                selectedLabels.add(normalizedName);
            }

            this.extractLabelsFromFilter(fv).forEach(label => selectedLabels.add(label));
        });

        // Single-pass: initialize all terms and mark the selected one
        const collectTerms = (terms: any[]) => {
            terms.forEach(term => {
                const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
                const termLabel = this.normalizeLabel(term.label);
                selectedTerms[term.id] = (selectedGuids.size > 0 && selectedGuids.has(termGuid)) || (termLabel.length > 0 && selectedLabels.has(termLabel));
                if (term.children?.length > 0) {
                    collectTerms(term.children);
                }
            });
        };
        collectTerms(hierarchicalTerms);

        return selectedTerms;
    }

    private readonly getSelectedFilterValues = (): any[] => {
        const submittedSelections = this.props.selectedFilters || [];
        if (submittedSelections.length > 0) {
            return submittedSelections
                .flatMap((filter: any) => filter?.values || [])
                .filter((value: any) => value?.value);
        }

        return (this.props.filter?.values || []).filter((value: any) => value?.selected && value?.value);
    }

    public shouldComponentUpdate(nextProps: IFilterHierarchicalProps, nextState: IFilterHierarchicalState): boolean {
        // Only re-render if props or state actually changed
        // This prevents unnecessary full tree re-renders
        if (nextProps.filter !== this.props.filter) return true;
        if (nextState.expandedTerms !== this.state.expandedTerms) return true;
        if (nextState.selectedTerms !== this.state.selectedTerms) return true;
        if (nextState.searchText !== this.state.searchText) return true;
        return false;
    }

    private readonly getSelectedSignature = (values: any[]): string => {
        return values
            .filter(v => v?.selected && v?.value)
            .map(v => v.value)
            .sort((left, right) => left.localeCompare(right))
            .join('|');
    }

    public componentDidUpdate(prevProps: IFilterHierarchicalProps) {
        // If filter values changed, update selected terms
        // Compare selected token signatures and avoid expensive JSON.stringify
        const prevValues = prevProps.filter?.values || [];
        const currValues = this.props.filter?.values || [];
        const prevSignature = this.getSelectedSignature(prevValues);
        const currSignature = this.getSelectedSignature(currValues);
        const prevHierarchicalTerms = prevProps.filter?.hierarchicalTerms || [];
        const currHierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
        const hierarchicalTermsChanged = prevHierarchicalTerms.length !== currHierarchicalTerms.length || prevProps.filter?.hierarchicalTerms !== this.props.filter?.hierarchicalTerms;

        if (hierarchicalTermsChanged || prevValues.length !== currValues.length || prevSignature !== currSignature) {
            const selectedPathExpansions = this.getExpandedTermsForSelectedValues();

            this.scheduleStateUpdate(() => {
                this.setState(prevState => ({
                    selectedTerms: this.initializeSelectedTerms(),
                    expandedTerms: {
                        ...prevState.expandedTerms,
                        ...selectedPathExpansions
                    }
                }));
            });
        }
    }

    public componentWillUnmount(): void {
        if (this.searchDebounceTimer !== null) {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }

        this.pendingStateUpdateTimers.forEach(timer => clearTimeout(timer));
        this.pendingStateUpdateTimers = [];
    }

    private readonly toggleExpand = (termId: string): void => {
        this.scheduleStateUpdate(() => {
            this.setState(prevState => ({
                expandedTerms: {
                    ...prevState.expandedTerms,
                    [termId]: !prevState.expandedTerms[termId]
                }
            }));
        });
    }

    private readonly onTermCheckboxChange = (term: any, checked: boolean): void => {
        this.setImmediateProgressCursor();
        this.updateSelectedTermsState(term.id, checked);

        const termGuid = TaxonomyHelper.extractGuidFromTermId(term.id) || '';
        const normalizedTermGuid = TaxonomyHelper.normalizeGuid(termGuid);
        const resolvedTermLabel = this.getResolvedLabel(term.label);
        const isParentNode = term.children?.length > 0;

        if (isParentNode) {
            this.handleParentTermSelection(termGuid, normalizedTermGuid, resolvedTermLabel, checked);
        } else {
            this.handleLeafTermSelection(term, resolvedTermLabel, checked);
        }
    }

    private updateSelectedTermsState(termId: string, checked: boolean): void {
        this.scheduleStateUpdate(() => {
            this.setState(prevState => {
                const nextSelectedTerms = { ...prevState.selectedTerms };
                nextSelectedTerms[termId] = checked;

                return {
                    selectedTerms: nextSelectedTerms
                };
            });
        });
    }

    private handleParentTermSelection(
        termGuid: string,
        normalizedTermGuid: string,
        resolvedTermLabel: string,
        checked: boolean
    ): void {
        const currentFilterValues = this.props.filter?.values || [];
        const normalizedTermLabel = this.normalizeLabel(resolvedTermLabel);
        const matchingRefiner = this.findMatchingRefiner(currentFilterValues, normalizedTermGuid, normalizedTermLabel);
        const baseParentValues: IDataFilterValueInfo[] = [
            this.createSelectedFilterValue(resolvedTermLabel, this.encodeRefinementToken(`GPP|#${termGuid}`), checked),
            this.createSelectedFilterValue(resolvedTermLabel, this.encodeRefinementToken(`GP0|#${termGuid}`), checked),
            this.createSelectedFilterValue(resolvedTermLabel, resolvedTermLabel, checked)
        ];

        const matchingValue = matchingRefiner
            ? this.createSelectedFilterValue(
                resolvedTermLabel,
                this.sanitizeRefinerValue(matchingRefiner.value),
                checked,
                matchingRefiner.operator
            )
            : undefined;

        const filterValues = [
            ...this.dedupeFilterValues([
                ...(matchingValue ? [matchingValue] : []),
                ...baseParentValues
            ])
        ];

        this.dispatchFilterUpdate(filterValues);
    }

    private handleLeafTermSelection(term: any, resolvedTermLabel: string, checked: boolean): void {
        const currentFilterValues = this.props.filter?.values || [];
        const termGuidForMatching = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
        const normalizedTermLabel = this.normalizeLabel(resolvedTermLabel);
        const matchingRefiner = this.findMatchingRefiner(currentFilterValues, termGuidForMatching, normalizedTermLabel);
        const filterValue = matchingRefiner
            ? this.createSelectedFilterValue(
                resolvedTermLabel,
                this.sanitizeRefinerValue(matchingRefiner.value),
                checked,
                matchingRefiner.operator
            )
            : (() => {
                const fallbackValue = termGuidForMatching
                    ? this.encodeRefinementToken(`GP0|#${termGuidForMatching}`)
                    : term.id;

                return this.createSelectedFilterValue(
                    resolvedTermLabel,
                    fallbackValue,
                    checked
                );
            })();

        if (checked && this.props.domElement) {
            this.dispatchFilterUpdate([filterValue]);
            return;
        }

        this.props.onChecked(this.props.filter?.filterName, filterValue);
    }

    private findMatchingRefiner(filterValues: any[], normalizedTermGuid: string, normalizedTermLabel: string): any {
        return filterValues.find((filterValue: any) => {
            if (!filterValue?.value) {
                return false;
            }

            const filterGuids = TaxonomyHelper.extractGuidsFromFilterValue(filterValue.value);
            if (normalizedTermGuid.length > 0 && filterGuids.includes(normalizedTermGuid)) {
                return true;
            }

            const filterLabels = this.extractLabelsFromFilter(filterValue);
            return normalizedTermLabel.length > 0 && filterLabels.includes(normalizedTermLabel);
        });
    }

    private createSelectedFilterValue(
        name: string,
        value: string,
        selected: boolean,
        operator: FilterComparisonOperator = FilterComparisonOperator.Eq
    ): IDataFilterValueInfo {
        return {
            name,
            value,
            operator,
            selected,
        };
    }

    private dispatchFilterUpdate(filterValues: IDataFilterValueInfo[]): void {
        if (!this.props.domElement) {
            return;
        }

        this.props.domElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
            detail: {
                filterName: this.props.filter?.filterName,
                filterValues,
                instanceId: this.props.instanceId
            },
            bubbles: true,
            cancelable: true
        }));
    }

    private readonly extractLabelsFromTokenString = (token: string): string[] => {
        if (!token) return [];

        const labels = new Set<string>();
        const addLabel = (label: string): void => {
            const normalized = this.normalizeLabel(label);
            if (normalized) {
                labels.add(normalized);
            }
        };

        const taxonomyLabelRegex = /L0\|#0?[0-9a-f-]{32,36}\|([^;)]+)/gi;
        let regexMatch: RegExpExecArray | null;
        while ((regexMatch = taxonomyLabelRegex.exec(token)) !== null) {
            addLabel(regexMatch[1]);
        }

        return Array.from(labels);
    }

    private readonly extractLabelsFromFilter = (filterValue: any): string[] => {
        if (!filterValue) return [];

        const labels = new Set<string>();
        const addLabels = (items: string[]): void => {
            items.forEach(item => labels.add(item));
        };

        if (filterValue.name) {
            const normalizedName = this.normalizeLabel(filterValue.name);
            if (normalizedName) {
                labels.add(normalizedName);
            }

            addLabels(this.extractLabelsFromTokenString(filterValue.name));
        }

        if (filterValue.value) {
            const rawValue = filterValue.value.trim().replace(/^"(.*)"$/, '$1');
            addLabels(this.extractLabelsFromTokenString(rawValue));

            const decodedValue = TaxonomyHelper.decodeHexString(filterValue.value);
            if (decodedValue) {
                addLabels(this.extractLabelsFromTokenString(decodedValue));
            }
        }

        return Array.from(labels);
    }

    private readonly encodeRefinementToken = (token: string): string => {
        if (!token) return token;
        const hex = token
            .split('')
            .map(char => (char.codePointAt(0) || 0).toString(16).padStart(2, '0'))
            .join('');
        return `"ǂǂ${hex}"`;
    }

    private readonly sanitizeRefinerValue = (rawValue: string): string => {
        if (!rawValue) {
            return rawValue;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawValue);
        if (!decodedValue) {
            return rawValue;
        }

        const tokenMatch = /^((?:GP0|GPP|L0)\|#0?)([0-9a-f-]+)/i.exec(decodedValue);
        if (!tokenMatch) {
            return rawValue;
        }

        const guidCandidate = tokenMatch[2];
        const extractedGuid = TaxonomyHelper.extractGuidFromTermId(guidCandidate);
        if (!extractedGuid || extractedGuid === guidCandidate) {
            return rawValue;
        }

        return this.encodeRefinementToken(`${tokenMatch[1]}${extractedGuid}`);
    }

    private readonly dedupeFilterValues = (values: IDataFilterValueInfo[]): IDataFilterValueInfo[] => {
        const seen = new Set<string>();
        return values.filter(value => {
            const key = `${value.operator ?? FilterComparisonOperator.Eq}::${value.value}`;
            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    }

    private readonly termOrDescendantExistsInResults = (term: any, resultGuids: Set<string>, resultLabels: Set<string>): boolean => {
        const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
        if (resultGuids.has(termGuid)) return true;
        const termLabel = this.normalizeLabel(term.label);
        if (termLabel && resultLabels.has(termLabel)) return true;
        if (term.children?.length > 0) {
            return term.children.some((child: any) => this.termOrDescendantExistsInResults(child, resultGuids, resultLabels));
        }
        return false;
    }

    private readonly termOrDescendantMatchesSearch = (term: any, lowerSearchText: string): boolean => {
        if (!lowerSearchText) return true;
        const resolvedTermLabel = this.getResolvedLabel(term.label);
        if (resolvedTermLabel?.toLowerCase().includes(lowerSearchText)) return true;
        if (term.children?.length > 0) {
            return term.children.some((child: any) => this.termOrDescendantMatchesSearch(child, lowerSearchText));
        }
        return false;
    }

    private readonly onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const newSearchText = event.target.value;
        if (this.searchDebounceTimer !== null) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => {
            this.setState({ searchText: newSearchText });
            this.searchDebounceTimer = null;
        }, 150);
    }

    /**
     * Schedules deferred state work and tracks timers so they can be cleared on unmount.
     */
    private scheduleStateUpdate(updateAction: () => void): void {
        const timer = setTimeout(() => {
            this.pendingStateUpdateTimers = this.pendingStateUpdateTimers.filter(currentTimer => currentTimer !== timer);
            updateAction();
        }, 0);

        this.pendingStateUpdateTimers.push(timer);
    }

    private readonly findTermByGuid = (guid: string, terms: any[]): any => {
        for (const term of terms) {
            const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
            if (termGuid === guid) {
                return term;
            }
            if (term.children?.length > 0) {
                const found = this.findTermByGuid(guid, term.children);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    private readonly collectDescendantGuids = (term: any, guids: Set<string>): void => {
        if (term) {
            const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
            guids.add(termGuid);
            if (term.children?.length > 0) {
                term.children.forEach((child: any) => this.collectDescendantGuids(child, guids));
            }
        }
    }

    private readonly renderTerm = (term: any, level: number = 0, resultGuids: Set<string> = new Set(), resultLabels: Set<string> = new Set(), lowerSearchText: string = '', hasResultSignals: boolean = true): JSX.Element | null => {
        const hasChildren = term.children?.length > 0;
        const isExpanded = this.state.expandedTerms[term.id];
        const isSelected = this.state.selectedTerms[term.id];
        const displayLabel = this.getResolvedLabel(term.label);
        const indent = level * 20;

        const termExistsInResults = this.termOrDescendantExistsInResults(term, resultGuids, resultLabels);
        if (!this.termOrDescendantMatchesSearch(term, lowerSearchText)) {
            return null;
        }

        return (
            <div key={term.id} className={styles.termItem}>
                <div className={styles.termRow} style={{ paddingLeft: `${indent}px` }}>
                    {hasChildren && (
                        <Icon
                            iconName={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                            onClick={() => this.toggleExpand(term.id)}
                            className={styles.expandIcon}
                        />
                    )}
                    {!hasChildren && <span className={styles.noChildrenSpacer}></span>}
                    <Checkbox
                        label={displayLabel}
                        checked={isSelected}
                        onChange={(ev, checked) => this.onTermCheckboxChange(term, !!checked)}
                        className={styles.termCheckbox}
                        disabled={hasResultSignals && !termExistsInResults}
                    />
                </div>
                {hasChildren && isExpanded && (
                    <div className={styles.childTerms}>
                        {term.children.map((child: any) => this.renderTerm(child, level + 1, resultGuids, resultLabels, lowerSearchText, hasResultSignals))}
                    </div>
                )}
            </div>
        );
    }

    public render(): React.ReactElement<IFilterHierarchicalProps> {
        const termSetId = this.props.filter?.termSetId;
        const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];

        if (!termSetId) {
            return (
                <div className={styles.filterHierarchical}>
                    <div>Term Set ID not configured</div>
                </div>
            );
        }

        if (hierarchicalTerms.length === 0) {
            return (
                <div className={styles.filterHierarchical}>
                    <div>{strings.Filters.LoadingMessage}</div>
                </div>
            );
        }

        const availableFilterValues = this.props.filter?.values || [];
        const resultGuidSet = new Set<string>();
        const resultLabelSet = new Set<string>();
        availableFilterValues.forEach((fv: any) => {
            if (!fv?.value) return;
            const isAvailable = (typeof fv.count === 'number' ? fv.count > 0 : true) || fv.selected;
            if (!isAvailable) {
                return;
            }
            TaxonomyHelper.extractGuidsFromFilterValue(fv.value).forEach(guid => resultGuidSet.add(guid));
            this.extractLabelsFromFilter(fv).forEach(label => resultLabelSet.add(label));
        });
        const hasResultSignals = resultGuidSet.size > 0 || resultLabelSet.size > 0;

        // Keep enable/disable strictly tied to current dataset signals.
        // A term is enabled only when it (or a visible descendant for branch nodes)
        // exists in current refinement results.
        const enabledResultGuidSet = resultGuidSet;
        
        const lowerSearchText = this.state.searchText.toLowerCase();

        return (
            <div
                className={styles.filterHierarchical}
                data-instance-id={this.props.instanceId}
                data-theme-variant={this.props.themeVariant ? 'true' : 'false'}
            >
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder={strings.Filters.SearchPlaceholder}
                        defaultValue=""
                        onChange={this.onSearchChange}
                        className={styles.searchInput}
                    />
                </div>
                {hierarchicalTerms.map((term: any) => this.renderTerm(term, 0, enabledResultGuidSet, resultLabelSet, lowerSearchText, hasResultSignals)).filter(x => x !== null)}
            </div>
        );
    }
}

export class FilterHierarchicalWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback(): void {
        const props = this.resolveAttributes();
        const hierarchical = <FilterHierarchicalComponent
            {...props}
            domElement={this}
            onChecked={(filterName: string, filterValue: IDataFilterValueInfo) => {
                // Bubble event through the DOM
                this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                    detail: {
                        filterName: filterName,
                        filterValues: [filterValue],
                        instanceId: props.instanceId
                    },
                    bubbles: true,
                    cancelable: true
                }));
            }}
        />;

        ReactDOM.render(hierarchical as any, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}
