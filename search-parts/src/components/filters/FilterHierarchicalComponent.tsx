import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants, FilterComparisonOperator } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import styles from './FilterHierarchicalComponent.module.scss';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Icon } from '@fluentui/react/lib/Icon';
import * as strings from 'CommonStrings';

/* eslint-disable @typescript-eslint/no-unused-vars */
export interface IFilterHierarchicalProps {

  /**
   * The filter configuration
   */
  filter?: any;

  /**
   * The Web Part instance ID from where the filter component belongs
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  instanceId?: string;

  /**
   * The current theme settings
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    
    // Never auto-expand all terms by default to avoid rendering massive trees
    // Users can expand on demand instead. This prevents UI freeze with large hierarchies.
    // If needed, only expand the first level
    const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
    if (hierarchicalTerms.length > 0 && this.props.filter?.expandByDefault === true) {
      // Only expand root level to avoid massive DOM rendering
      hierarchicalTerms.forEach(term => {
        expandedTerms[term.id] = true;
      });
    }

    // Always expand the path to currently selected terms so users can see context
    // (for example, Europa -> Germany -> Berlin when Berlin is selected).
    const selectedPathExpansions = this.getExpandedTermsForSelectedValues();
    Object.assign(expandedTerms, selectedPathExpansions);
    
    return expandedTerms;
  }

  private getExpandedTermsForSelectedValues = (): { [key: string]: boolean } => {
    const expandedTerms: { [key: string]: boolean } = {};
    const filterValues = this.props.filter?.values || [];
    const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];

    filterValues.forEach((filterValue: any) => {
      if (filterValue?.selected && filterValue?.value) {
        const guidPart = this.extractGuidsFromFilterValue(filterValue.value)[0] || '';
        this.findAndExpandPathToTerm(hierarchicalTerms, guidPart, expandedTerms);
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

  private findAndExpandPathToTerm = (terms: any[], guidToMatch: string, expandedTerms: { [key: string]: boolean }): boolean => {
    for (const term of terms) {
      const termGuid = (this.extractGuidFromTermId(term.id) || '').replace(/-/g, '').toLowerCase();

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

  private initializeSelectedTerms = (): { [key: string]: boolean } => {
    const selectedTerms: { [key: string]: boolean } = {};
    const filterValues = this.props.filter?.values || [];
    const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];

    // Determine the selected term's GUID (single-select: use first selected value)
    const selectedFilterValue = filterValues.find((fv: any) => fv?.selected && fv?.value);
    let selectedGuid = '';
    if (selectedFilterValue) {
      selectedGuid = this.extractGuidsFromFilterValue(selectedFilterValue.value)[0] || '';
    }

    // Single-pass: initialize all terms and mark the selected one
    const collectTerms = (terms: any[]) => {
      terms.forEach(term => {
        const termGuid = (this.extractGuidFromTermId(term.id) || '').replace(/-/g, '').toLowerCase();
        selectedTerms[term.id] = selectedGuid.length > 0 && termGuid === selectedGuid;
        if (term.children && term.children.length > 0) {
          collectTerms(term.children);
        }
      });
    };
    collectTerms(hierarchicalTerms);

    return selectedTerms;
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
    
    if (prevValues.length !== currValues.length || prevSignature !== currSignature) {
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

    const termGuid = this.extractGuidFromTermId(term.id) || '';
    const isParentNode = term.children && term.children.length > 0;

    if (isParentNode) {
      // For parent nodes: emit only GPP (include children) - implicitly includes parent and all descendants
      const gppToken = `GPP|#${termGuid}`;
      const gppEncoded = this.encodeRefinementToken(gppToken);

      // Dispatch custom event with single-select behavior
      if (this.props.domElement) {
        const currentFilterValues = this.props.filter?.values || [];
        const valuesToClear = currentFilterValues
          .filter((value: any) => value?.selected && value?.value !== gppEncoded)
          .map((value: any) => ({
            name: value.name,
            value: value.value,
            operator: value.operator || FilterComparisonOperator.Eq,
            selected: false
          } as IDataFilterValueInfo));

        const filterValues: IDataFilterValueInfo[] = [
          ...valuesToClear,
          {
            name: term.label,
            value: gppEncoded,
            operator: FilterComparisonOperator.Eq,
            selected: checked,
          }
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
      const termGuidForMatching = (this.extractGuidFromTermId(term.id) || '').replace(/-/g, '').toLowerCase();
      const matchingRefiner = filterValues.find((filterValue: any) => {
        if (!filterValue?.value) return false;
        const filterGuids = this.extractGuidsFromFilterValue(filterValue.value);
        return filterGuids.some(guid => guid === termGuidForMatching);
      });

      // Use the raw refiner value from search as-is (handles both localized or(...) FQL and ǂǂHEX formats).
      // buildFqlRefinementString passes or(...) through unchanged and ǂǂHEX with its surrounding quotes,
      // both of which produce correct RefinementFilters FQL and return results.
      const filterValue: IDataFilterValueInfo = matchingRefiner ? {
        name: term.label,
        value: matchingRefiner.value,
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
          .filter((value: any) => value?.selected && value?.value !== filterValue.value)
          .map((value: any) => ({
            name: value.name,
            value: value.value,
            operator: value.operator || FilterComparisonOperator.Eq,
            selected: false
          } as IDataFilterValueInfo));

        this.props.domElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
          detail: {
            filterName: this.props.filter?.filterName,
            filterValues: [
              ...valuesToClear,
              filterValue
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

  private decodeHexString = (hexStr: string): string => {
    try {
      // Remove surrounding quotes if present (avoid replaceAll for older targets)
      let str = hexStr;
      if (str.startsWith('"')) {
        str = str.substring(1);
      }
      if (str.endsWith('"')) {
        str = str.substring(0, str.length - 1);
      }
      // Remove the ǂǂ prefix used by SharePoint for hex encoding
      str = str.replace(/^ǂǂ/, '');
      // Decode hex to string
      return decodeURIComponent('%' + str.match(/.{1,2}/g)!.join('%'));
    } catch {
      return '';
    }
  }

  private stripWrappingQuotes = (value: string): string => {
    if (!value) return value;
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.substring(1, value.length - 1);
    }
    return value;
  }

  private extractGuidsFromTokenString = (token: string): string[] => {
    if (!token) return [];

    const guids = new Set<string>();

    const addGuid = (rawGuid: string): void => {
      if (!rawGuid) return;
      const normalized = rawGuid.replace(/^#/, '').replace(/^0+/, '').replace(/-/g, '').toLowerCase();
      if (/^[0-9a-f]{32}$/.test(normalized)) {
        guids.add(normalized);
      }
    };

    // Handles GP0|#<guid>, GPP|#<guid> and L0|#0<guid> patterns.
    const taxonomyTokenRegex = /(?:GP0|GPP|L0)\|#0?([0-9a-fA-F-]{32,36})/g;
    let regexMatch: RegExpExecArray | null;
    while ((regexMatch = taxonomyTokenRegex.exec(token)) !== null) {
      addGuid(regexMatch[1]);
    }

    // Handles direct token formats when not wrapped in larger expressions.
    const parts = token.split('|');
    if (parts.length > 1) {
      addGuid(parts[1]);
    }

    return Array.from(guids);
  }

  private extractGuidsFromFilterValue = (rawValue: string): string[] => {
    if (!rawValue) return [];

    const guids = new Set<string>();
    const addGuids = (items: string[]): void => {
      items.forEach(item => guids.add(item));
    };

    const value = this.stripWrappingQuotes(rawValue.trim());

    // 1) Parse value as-is (covers localized or(GP0|...,L0|...) expressions)
    addGuids(this.extractGuidsFromTokenString(value));

    // 2) Parse decoded value when token is hex-encoded (ǂǂ...)
    const decoded = this.decodeHexString(rawValue);
    if (decoded) {
      addGuids(this.extractGuidsFromTokenString(decoded));
    }

    // 3) Parse any encoded sub-tokens embedded inside an expression (for robustness)
    const encodedTokenRegex = /"ǂǂ([0-9a-fA-F]+)"/g;
    let encodedMatch: RegExpExecArray | null;
    while ((encodedMatch = encodedTokenRegex.exec(rawValue)) !== null) {
      const decodedEmbedded = this.decodeHexString(`"ǂǂ${encodedMatch[1]}"`);
      if (decodedEmbedded) {
        addGuids(this.extractGuidsFromTokenString(decodedEmbedded));
      }
    }

    // 4) Fallback when raw value directly contains a GUID-like term id
    const fallbackGuid = (this.extractGuidFromTermId(value) || '').replace(/-/g, '').toLowerCase();
    if (/^[0-9a-f]{32}$/.test(fallbackGuid)) {
      guids.add(fallbackGuid);
    }

    return Array.from(guids);
  }

  private encodeRefinementToken = (token: string): string => {
    if (!token) return token;
    const hex = token
      .split('')
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    return `"ǂǂ${hex}"`;
  }

  private extractGuidFromTermId = (termId: string): string => {
    if (!termId) return '';
    const cleaned = termId.replace(/^\/+|\/+$/g, '');
    const guidMatch = cleaned.match(/Guid\(([0-9a-fA-F\-]{36})\)/);
    if (guidMatch && guidMatch[1]) {
      return guidMatch[1];
    }
    const plainGuidMatch = cleaned.match(/[0-9a-fA-F\-]{36}/);
    if (plainGuidMatch) {
      return plainGuidMatch[0];
    }
    return termId;
  }

  private termOrDescendantExistsInResults = (term: any, resultGuids: Set<string>): boolean => {
    const termGuid = (this.extractGuidFromTermId(term.id) || '').replace(/-/g, '').toLowerCase();
    if (resultGuids.has(termGuid)) return true;
    if (term.children && term.children.length > 0) {
      return term.children.some((child: any) => this.termOrDescendantExistsInResults(child, resultGuids));
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

  private renderTerm = (term: any, level: number = 0, resultGuids: Set<string> = new Set(), lowerSearchText: string = ''): JSX.Element | null => {
    const hasChildren = term.children && term.children.length > 0;
    const isExpanded = this.state.expandedTerms[term.id];
    const isSelected = this.state.selectedTerms[term.id];
    const indent = level * 20;

    const termExistsInResults = this.termOrDescendantExistsInResults(term, resultGuids);
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
            disabled={!termExistsInResults}
          />
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.childTerms}>
            {term.children.map((child: any) => this.renderTerm(child, level + 1, resultGuids, lowerSearchText))}
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

    const filterValues = this.props.filter?.values || [];
    const resultGuidSet = new Set<string>();
    filterValues.forEach((fv: any) => {
      if (!fv?.value) return;
      this.extractGuidsFromFilterValue(fv.value).forEach(guid => resultGuidSet.add(guid));
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
        {hierarchicalTerms.map((term: any) => this.renderTerm(term, 0, resultGuidSet, lowerSearchText)).filter(x => x !== null)}
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
/* eslint-enable @typescript-eslint/no-unused-vars */
