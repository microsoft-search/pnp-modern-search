import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants, FilterComparisonOperator } from '@pnp/modern-search-extensibility';
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

    constructor(props: IFilterHierarchicalProps) {
        super(props);

        this.state = {
            expandedTerms: this.initializeExpandedTerms(),
            selectedTerms: this.initializeSelectedTerms(),
            searchText: ''
        };
    }

    private initializeExpandedTerms = (): { [key: string]: boolean } => {
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

    private getExpandedTermsForSelectedValues = (): { [key: string]: boolean } => {
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

    private expandAllDescendants = (terms: any[], expandedTerms: { [key: string]: boolean }): void => {
        terms.forEach(term => {
            if (term.children && term.children.length > 0) {
                expandedTerms[term.id] = true;
                this.expandAllDescendants(term.children, expandedTerms);
            }
        });
    }

    private normalizeLabel = (value: string): string => {
        return value ? value.trim().toLowerCase() : '';
    }

    private findAndExpandPathToTerm = (terms: any[], guidToMatch: string, expandedTerms: { [key: string]: boolean }): boolean => {
        for (const term of terms) {
            const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));

            if (termGuid === guidToMatch) {
                // Expand the selected term and all its descendants so the full sub-tree is visible.
                if (term.children && term.children.length > 0) {
                    expandedTerms[term.id] = true;
                    this.expandAllDescendants(term.children, expandedTerms);
                }
                return true;
            }

            if (term.children && term.children.length > 0) {
                if (this.findAndExpandPathToTerm(term.children, guidToMatch, expandedTerms)) {
                    expandedTerms[term.id] = true;
                    return true;
                }
            }
        }

        return false;
    }

    private findAndExpandPathToTermByLabel = (terms: any[], labelToMatch: string, expandedTerms: { [key: string]: boolean }): boolean => {
        for (const term of terms) {
            const termLabel = this.normalizeLabel(term.label);

            if (termLabel === labelToMatch) {
                if (term.children && term.children.length > 0) {
                    expandedTerms[term.id] = true;
                    this.expandAllDescendants(term.children, expandedTerms);
                }
                return true;
            }

            if (term.children && term.children.length > 0) {
                if (this.findAndExpandPathToTermByLabel(term.children, labelToMatch, expandedTerms)) {
                    expandedTerms[term.id] = true;
                    return true;
                }
            }
        }

        return false;
    }

    private initializeSelectedTerms = (): { [key: string]: boolean } => {
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
                if (term.children && term.children.length > 0) {
                    collectTerms(term.children);
                }
            });
        };
        collectTerms(hierarchicalTerms);

        return selectedTerms;
    }

    private getSelectedFilterValues = (): any[] => {
        const submittedSelections = this.props.selectedFilters || [];
        if (submittedSelections.length > 0) {
            return submittedSelections
                .flatMap((filter: any) => filter?.values || [])
                .filter((value: any) => value?.value);
        }

        return (this.props.filter?.values || []).filter((value: any) => value?.selected && value?.value);
    }

    private isTermSelectedFromCurrentValues = (term: any): boolean => {
        const filterValues = this.getSelectedFilterValues();
        if (filterValues.length === 0) {
            return false;
        }

        const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
        const termLabel = this.normalizeLabel(term.label);

        return filterValues.some((fv: any) => {
            if (!fv?.value) {
                return false;
            }

            const filterGuids = TaxonomyHelper.extractGuidsFromFilterValue(fv.value);
            if (termGuid && filterGuids.includes(termGuid)) {
                return true;
            }

            const filterLabels = this.extractLabelsFromFilter(fv);
            return termLabel.length > 0 && filterLabels.includes(termLabel);
        });
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

    private getSelectedSignature = (values: any[]): string => {
        return values
            .filter(v => v?.selected && v?.value)
            .map(v => v.value)
            .sort()
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

    private toggleExpand = (termId: string): void => {
        this.scheduleStateUpdate(() => {
            this.setState(prevState => ({
                expandedTerms: {
                    ...prevState.expandedTerms,
                    [termId]: !prevState.expandedTerms[termId]
                }
            }));
        });
    }

    private onTermCheckboxChange = (term: any, checked: boolean): void => {
        this.scheduleStateUpdate(() => {
            this.setState(prevState => ({
                selectedTerms: checked
                    ? Object.keys(prevState.selectedTerms).reduce((acc, key) => {
                        acc[key] = key === term.id;
                        return acc;
                    }, {} as { [key: string]: boolean })
                    : {
                        ...prevState.selectedTerms,
                        [term.id]: false
                    }
            }));
        });

        const termGuid = TaxonomyHelper.extractGuidFromTermId(term.id) || '';
        const normalizedTermGuid = TaxonomyHelper.normalizeGuid(termGuid);
        const isParentNode = term.children && term.children.length > 0;

        if (isParentNode) {
            // For parent nodes, prefer raw refiner values from search results when available.
            // These can already include provider-specific descendant semantics (for example an or(GPP,GP0) payload).
            const gppToken = `GPP|#${termGuid}`;
            const gppEncoded = this.encodeRefinementToken(gppToken);
            const gp0Encoded = this.encodeRefinementToken(`GP0|#${termGuid}`);

            const currentFilterValues = this.props.filter?.values || [];
            const normalizedTermLabel = this.normalizeLabel(term.label);
            const matchingRefiner = currentFilterValues.find((filterValue: any) => {
                if (!filterValue?.value) return false;

                const filterGuids = TaxonomyHelper.extractGuidsFromFilterValue(filterValue.value);
                if (normalizedTermGuid.length > 0 && filterGuids.includes(normalizedTermGuid)) {
                    return true;
                }

                const filterLabels = this.extractLabelsFromFilter(filterValue);
                return normalizedTermLabel.length > 0 && filterLabels.includes(normalizedTermLabel);
            });

            // Dispatch custom event with single-select behavior
            if (this.props.domElement) {
                const valuesToClear = currentFilterValues
                    .filter((value: any) => value?.selected)
                    .map((value: any) => ({
                        name: value.name,
                        value: value.value,
                        operator: value.operator || FilterComparisonOperator.Eq,
                        selected: false
                    } as IDataFilterValueInfo));

                const baseParentValues: IDataFilterValueInfo[] = [{
                    name: term.label,
                    value: gppEncoded,
                    operator: FilterComparisonOperator.Eq,
                    selected: checked,
                }, {
                    name: term.label,
                    value: gp0Encoded,
                    operator: FilterComparisonOperator.Eq,
                    selected: checked,
                }, {
                    name: term.label,
                    value: term.label,
                    operator: FilterComparisonOperator.Eq,
                    selected: checked,
                }];

                const matchingValue = matchingRefiner
                    ? {
                        name: term.label,
                        value: this.sanitizeRefinerValue(matchingRefiner.value),
                        operator: matchingRefiner.operator,
                        selected: checked,
                    } as IDataFilterValueInfo
                    : undefined;

                const nextSelectedValues = this.dedupeFilterValues([
                    ...(matchingValue ? [matchingValue] : []),
                    ...baseParentValues
                ]);

                const filterValues: IDataFilterValueInfo[] = [
                    ...valuesToClear,
                    ...nextSelectedValues
                ];

                this.props.domElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                    detail: {
                        filterName: this.props.filter?.filterName,
                        filterValues: filterValues,
                        instanceId: this.props.instanceId
                    },
                    bubbles: true,
                    cancelable: true
                }));
            }
        } else {
            // For leaf nodes: emit only GP0
            const filterValues = this.props.filter?.values || [];
            const termGuidForMatching = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
            const normalizedTermLabel = this.normalizeLabel(term.label);
            const matchingRefiner = filterValues.find((filterValue: any) => {
                if (!filterValue?.value) return false;
                const filterGuids = TaxonomyHelper.extractGuidsFromFilterValue(filterValue.value);
                if (filterGuids.includes(termGuidForMatching)) {
                    return true;
                }

                const filterLabels = this.extractLabelsFromFilter(filterValue);
                return normalizedTermLabel.length > 0 && filterLabels.includes(normalizedTermLabel);
            });

            // Use the raw refiner value from search as-is (handles both localized or(...) FQL and ǂǂHEX formats).
            // buildFqlRefinementString passes or(...) through unchanged and ǂǂHEX with its surrounding quotes,
            // both of which produce correct RefinementFilters FQL and return results.
            const filterValue: IDataFilterValueInfo = matchingRefiner ? {
                name: term.label,
                value: this.sanitizeRefinerValue(matchingRefiner.value),
                operator: matchingRefiner.operator,
                selected: checked,
            } : {
                name: term.label,
                value: termGuidForMatching ? this.encodeRefinementToken(`GP0|#${termGuidForMatching}`) : term.id,
                selected: checked,
            };

            if (checked && this.props.domElement) {
                const currentFilterValues = this.props.filter?.values || [];
                const valuesToClear = currentFilterValues
                    .filter((value: any) => value?.selected)
                    .map((value: any) => ({
                        name: value.name,
                        value: value.value,
                        operator: value.operator || FilterComparisonOperator.Eq,
                        selected: false
                    } as IDataFilterValueInfo));

                const nextSelectedValues: IDataFilterValueInfo[] = [filterValue];

                this.props.domElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                    detail: {
                        filterName: this.props.filter?.filterName,
                        filterValues: [
                            ...valuesToClear,
                            ...nextSelectedValues
                        ],
                        instanceId: this.props.instanceId
                    },
                    bubbles: true,
                    cancelable: true
                }));
            } else {
                this.props.onChecked(this.props.filter?.filterName, filterValue);
            }
        }
    }

    private extractLabelsFromTokenString = (token: string): string[] => {
        if (!token) return [];

        const labels = new Set<string>();
        const addLabel = (label: string): void => {
            const normalized = this.normalizeLabel(label);
            if (normalized) {
                labels.add(normalized);
            }
        };

        const taxonomyLabelRegex = /L0\|#0?[-0-9a-fA-F]{32,36}\|([^;\)]+)/g;
        let regexMatch: RegExpExecArray | null;
        while ((regexMatch = taxonomyLabelRegex.exec(token)) !== null) {
            addLabel(regexMatch[1]);
        }

        return Array.from(labels);
    }

    private extractLabelsFromFilter = (filterValue: any): string[] => {
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
            .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');
        return `"ǂǂ${hex}"`;
    }

    private sanitizeRefinerValue = (rawValue: string): string => {
        if (!rawValue) {
            return rawValue;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawValue);
        if (!decodedValue) {
            return rawValue;
        }

        const tokenMatch = decodedValue.match(/^((?:GP0|GPP|L0)\|#0?)([-0-9a-fA-F]+)/i);
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

    private dedupeFilterValues = (values: IDataFilterValueInfo[]): IDataFilterValueInfo[] => {
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

    private termOrDescendantExistsInResults = (term: any, resultGuids: Set<string>, resultLabels: Set<string>): boolean => {
        const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
        if (resultGuids.has(termGuid)) return true;
        const termLabel = this.normalizeLabel(term.label);
        if (termLabel && resultLabels.has(termLabel)) return true;
        if (term.children && term.children.length > 0) {
            return term.children.some((child: any) => this.termOrDescendantExistsInResults(child, resultGuids, resultLabels));
        }
        return false;
    }

    private termOrDescendantMatchesSearch = (term: any, lowerSearchText: string): boolean => {
        if (!lowerSearchText) return true;
        if (term.label && term.label.toLowerCase().includes(lowerSearchText)) return true;
        if (term.children && term.children.length > 0) {
            return term.children.some((child: any) => this.termOrDescendantMatchesSearch(child, lowerSearchText));
        }
        return false;
    }

    private onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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

    private findTermByGuid = (guid: string, terms: any[]): any => {
        for (const term of terms) {
            const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
            if (termGuid === guid) {
                return term;
            }
            if (term.children && term.children.length > 0) {
                const found = this.findTermByGuid(guid, term.children);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    private collectDescendantGuids = (term: any, guids: Set<string>): void => {
        if (term) {
            const termGuid = TaxonomyHelper.normalizeGuid(TaxonomyHelper.extractGuidFromTermId(term.id));
            guids.add(termGuid);
            if (term.children && term.children.length > 0) {
                term.children.forEach((child: any) => this.collectDescendantGuids(child, guids));
            }
        }
    }

    private renderTerm = (term: any, level: number = 0, resultGuids: Set<string> = new Set(), resultLabels: Set<string> = new Set(), lowerSearchText: string = '', hasResultSignals: boolean = true): JSX.Element | null => {
        const hasChildren = term.children && term.children.length > 0;
        const isExpanded = this.state.expandedTerms[term.id];
        const isSelected = this.state.selectedTerms[term.id];
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
                        label={term.label}
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
        const selectedFilterValues = this.getSelectedFilterValues();
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
        
        // Keep selected descendants available when a parent node is selected,
        // but do not globally enable unrelated terms that are absent from the dataset.
        const expandedResultGuidSet = new Set(resultGuidSet);
        const guidsToExpand = new Set<string>();
        selectedFilterValues.forEach((fv: any) => {
            if (!fv?.value) {
                return;
            }

            TaxonomyHelper.extractGuidsFromFilterValue(fv.value).forEach(guid => guidsToExpand.add(guid));
        });
        guidsToExpand.forEach((guid: string) => {
            const term = this.findTermByGuid(guid, hierarchicalTerms);
            if (term && term.children && term.children.length > 0) {
                term.children.forEach((child: any) => {
                    const childDescendants = new Set<string>();
                    this.collectDescendantGuids(child, childDescendants);
                    childDescendants.forEach(cguid => expandedResultGuidSet.add(cguid));
                });
            }
        });
        
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
                {hierarchicalTerms.map((term: any) => this.renderTerm(term, 0, expandedResultGuidSet, resultLabelSet, lowerSearchText, hasResultSignals)).filter(x => x !== null)}
            </div>
        );
    }
}

export class FilterHierarchicalWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {
        let props = this.resolveAttributes();
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
                    } as IDataFilterInfo,
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
