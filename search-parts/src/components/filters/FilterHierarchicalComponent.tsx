import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants, FilterComparisonOperator } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import styles from './FilterHierarchicalComponent.module.scss';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Icon } from '@fluentui/react/lib/Icon';

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
        const decoded = this.decodeHexString(filterValue.value) || '';
        const parts = decoded.split('|');
        const guidPart = (parts[1] || '').replace('#', '').replace(/-/g, '').toLowerCase();
        this.findAndExpandPathToTerm(hierarchicalTerms, guidPart, expandedTerms);
      }
    });

    return expandedTerms;
  }

  private findAndExpandPathToTerm = (terms: any[], guidToMatch: string, expandedTerms: { [key: string]: boolean }): boolean => {
    for (const term of terms) {
      const termGuid = (this.extractGuidFromTermId(term.id) || '').replace(/-/g, '').toLowerCase();

      if (termGuid === guidToMatch) {
        // If the selected term has children, expand it too.
        if (term.children && term.children.length > 0) {
          expandedTerms[term.id] = true;
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
    
    // Hierarchical filter behaves as single-select: keep only the first selected value.
    const selectedFilterValue = filterValues.find((filterValue: any) => filterValue?.selected && filterValue?.value);
    if (selectedFilterValue) {
      const decoded = this.decodeHexString(selectedFilterValue.value) || '';
      const parts = decoded.split('|');
      const guidPart = (parts[1] || '').replace('#', '').replace(/-/g, '').toLowerCase();

      // Find the term with this GUID and mark it as selected
      const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
      this.findAndMarkTermAsSelected(hierarchicalTerms, guidPart, selectedTerms);
    }

    // Collect all term IDs efficiently in one pass
    const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
    const collectAllTermIds = (terms: any[]) => {
      terms.forEach(term => {
        // Only initialize if not already set
        if (!Object.prototype.hasOwnProperty.call(selectedTerms, term.id)) {
          selectedTerms[term.id] = false;
        }
        // Recursively process children
        if (term.children && term.children.length > 0) {
          collectAllTermIds(term.children);
        }
      });
    };
    collectAllTermIds(hierarchicalTerms);
    
    return selectedTerms;
  }

  private findAndMarkTermAsSelected = (terms: any[], guidToMatch: string, selectedTerms: { [key: string]: boolean }): boolean => {
    for (const term of terms) {
      const termGuid = (this.extractGuidFromTermId(term.id) || '').replace(/-/g, '').toLowerCase();
      if (termGuid === guidToMatch) {
        selectedTerms[term.id] = true;
        return true;
      }
      if (term.children && term.children.length > 0) {
        if (this.findAndMarkTermAsSelected(term.children, guidToMatch, selectedTerms)) {
          return true;
        }
      }
    }
    return false;
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

  public componentDidUpdate(prevProps: IFilterHierarchicalProps) {
    // If filter values changed, update selected terms
    // Compare selected token signatures and avoid expensive JSON.stringify
    const prevValues = prevProps.filter?.values || [];
    const currValues = this.props.filter?.values || [];
    const getSelectedSignature = (values: any[]): string => {
      return values
        .filter(v => v?.selected && v?.value)
        .map(v => v.value)
        .sort()
        .join('|');
    };
    const prevSignature = getSelectedSignature(prevValues);
    const currSignature = getSelectedSignature(currValues);
    
    if (prevValues.length !== currValues.length || prevSignature !== currSignature) {
      const selectedPathExpansions = this.getExpandedTermsForSelectedValues();

      // Use setTimeout to defer heavy state update and avoid blocking the UI
      setTimeout(() => {
        this.setState(prevState => ({
          selectedTerms: this.initializeSelectedTerms()
          ,
          expandedTerms: {
            ...prevState.expandedTerms,
            ...selectedPathExpansions
          }
        }));
      }, 0);
    }
  }

  private toggleExpand = (termId: string): void => {
    // Defer state update asynchronously to avoid blocking on expand/collapse
    setTimeout(() => {
      this.setState(prevState => ({
        expandedTerms: {
          ...prevState.expandedTerms,
          [termId]: !prevState.expandedTerms[termId]
        }
      }));
    }, 0);
  }

  private onTermCheckboxChange = (term: any, checked: boolean): void => {
    // Defer state update asynchronously to avoid blocking on event dispatch
    setTimeout(() => {
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
    }, 0);

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
        const decoded = this.decodeHexString(filterValue.value) || '';
        const parts = decoded.split('|');
        const guidPart = (parts[1] || '').replace('#', '').replace(/-/g, '').toLowerCase();
        return guidPart === termGuidForMatching;
      });

      const filterValue: IDataFilterValueInfo = matchingRefiner ? (() => {
        const decoded = this.decodeHexString(matchingRefiner.value || '');
        const normalizedToken = this.normalizeRefinementToken(decoded);
        const encodedToken = this.encodeRefinementToken(normalizedToken);

        return {
          name: term.label,
          value: encodedToken,
          operator: matchingRefiner.operator,
          selected: checked,
        };
      })() : {
        name: term.label,
        value: term.id,
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

  private normalizeRefinementToken = (token: string): string => {
    if (!token) return token;
    // Expect formats like 'L0|#0<GUID>|Label' or 'GP0|#0<GUID>'
    const parts = token.split('|');
    if (parts.length === 0) {
      return token;
    }

    // Always use GP0 to match checkbox layout behavior (specific term only)
    let prefix = 'GP0';
    
    // If token already has GP prefix, keep it
    if (parts[0].startsWith('GP')) {
      prefix = parts[0];
    }

    // Keep and sanitize the term ID segment (e.g. '#0<GUID>')
    const rawIdPart = parts.length > 1 ? parts[1] : '';
    // Drop the leading '#', then collapse extra leading zeroes after the required '0'
    let guidPart = rawIdPart.replace(/^#/, ''); // now something like '0ffe...' or '00ffe...'
    // Ensure we keep exactly one leading '0' before the GUID as per refiner format
    guidPart = guidPart.replace(/^0+/, (m) => m.length > 0 ? '0' : '');
    const normalizedIdPart = `#${guidPart}`;

    // Ignore trailing label segment if present to mirror checkbox payload
    const normalized = `${prefix}|${normalizedIdPart}`;
    return normalized;
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

  private termOrDescendantExistsInResults = (term: any, filterValues: any[]): boolean => {
    // Check if this term itself matches
    const termGuid = this.extractGuidFromTermId(term.id);
    const hasMatch = filterValues.some((filterValue: any) => {
      if (!filterValue.value) return false;
      const decodedValue = this.decodeHexString(filterValue.value);
      const parts = decodedValue.split('|');
      const guidPart = parts[1] ? parts[1].replace('#0', '') : '';
      return guidPart === termGuid || guidPart.toLowerCase() === termGuid.toLowerCase();
    });
    
    if (hasMatch) return true;
    
    // Check if any descendants match
    if (term.children && term.children.length > 0) {
      return term.children.some((child: any) => this.termOrDescendantExistsInResults(child, filterValues));
    }
    
    return false;
  }

  private termOrDescendantMatchesSearch = (term: any, searchText: string): boolean => {
    if (!searchText) return true;
    
    // Check if this term's label matches
    if (term.label && term.label.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }
    
    // Check if any descendants match
    if (term.children && term.children.length > 0) {
      return term.children.some((child: any) => this.termOrDescendantMatchesSearch(child, searchText));
    }
    
    return false;
  }

  private onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Capture the value before setTimeout
    const newSearchText = event.target.value;
    // Defer search state update asynchronously to avoid blocking on input
    setTimeout(() => {
      this.setState({ searchText: newSearchText });
    }, 0);
  }

  private renderTerm = (term: any, level: number = 0): JSX.Element | null => {
    const hasChildren = term.children && term.children.length > 0;
    const isExpanded = this.state.expandedTerms[term.id];
    const isSelected = this.state.selectedTerms[term.id];
    const indent = level * 20;

    // Check if this term ID or any descendant exists in the available filter values from results
    const filterValues = this.props.filter?.values || [];
    const termExistsInResults = this.termOrDescendantExistsInResults(term, filterValues);
    
    // Filter by search text
    const matchesSearch = this.termOrDescendantMatchesSearch(term, this.state.searchText);
    if (!matchesSearch) {
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
            onChange={(ev, checked) => this.onTermCheckboxChange(term, checked)}
            className={styles.termCheckbox}
            disabled={!termExistsInResults}
          />
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.childTerms}>
            {term.children.map((child: any) => this.renderTerm(child, level + 1))}
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
          <div>No terms available</div>
        </div>
      );
    }

    return (
      <div
        className={styles.filterHierarchical}
        data-instance-id={this.props.instanceId}
        data-theme-variant={this.props.themeVariant ? 'true' : 'false'}
      >
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search..."
            value={this.state.searchText}
            onChange={this.onSearchChange}
            className={styles.searchInput}
          />
        </div>
        {hierarchicalTerms.map((term: any) => this.renderTerm(term)).filter(x => x !== null)}
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
