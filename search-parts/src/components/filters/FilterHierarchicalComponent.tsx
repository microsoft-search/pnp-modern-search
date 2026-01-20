import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
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
}

export interface IFilterHierarchicalState {
    expandedTerms: { [key: string]: boolean };
    selectedTerms: { [key: string]: boolean };
}

export class FilterHierarchicalComponent extends React.Component<IFilterHierarchicalProps, IFilterHierarchicalState> {

  constructor(props: IFilterHierarchicalProps) {
    super(props);

    this.state = {
        expandedTerms: this.initializeExpandedTerms(),
        selectedTerms: this.initializeSelectedTerms()
    };
  }

  private initializeExpandedTerms = (): { [key: string]: boolean } => {
    const expandedTerms: { [key: string]: boolean } = {};
    const shouldExpandAll = this.props.filter?.expandByDefault === true;
    
    if (shouldExpandAll) {
      const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
      this.expandAllTermsRecursive(hierarchicalTerms, expandedTerms);
    }
    
    return expandedTerms;
  }

  private initializeSelectedTerms = (): { [key: string]: boolean } => {
    const selectedTerms: { [key: string]: boolean } = {};
    const filterValues = this.props.filter?.values || [];
    
    // Mark terms as selected only if they are in the selected filter values
    filterValues.forEach((filterValue: any) => {
      if (filterValue?.selected && filterValue?.value) {
        const decoded = this.decodeHexString(filterValue.value) || '';
        const parts = decoded.split('|');
        const guidPart = (parts[1] || '').replace('#', '').replace(/-/g, '').toLowerCase();
        
        // Find the term with this GUID and mark it as selected
        const hierarchicalTerms = this.props.filter?.hierarchicalTerms || [];
        this.findAndMarkTermAsSelected(hierarchicalTerms, guidPart, selectedTerms);
      }
    });
    
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

  public componentDidUpdate(prevProps: IFilterHierarchicalProps) {
    // If filter values changed, update selected terms
    if (prevProps.filter?.values !== this.props.filter?.values) {
      this.setState({
        selectedTerms: this.initializeSelectedTerms()
      });
    }
  }

  private expandAllTermsRecursive = (terms: any[], expandedTerms: { [key: string]: boolean }): void => {
    terms.forEach(term => {
      expandedTerms[term.id] = true;
      if (term.children && term.children.length > 0) {
        this.expandAllTermsRecursive(term.children, expandedTerms);
      }
    });
  }

  private toggleExpand = (termId: string): void => {
    this.setState(prevState => ({
      expandedTerms: {
        ...prevState.expandedTerms,
        [termId]: !prevState.expandedTerms[termId]
      }
    }));
  }

  private onTermCheckboxChange = (term: any, checked: boolean): void => {
    
    this.setState(prevState => ({
      selectedTerms: {
        ...prevState.selectedTerms,
        [term.id]: checked
      }
    }));

    // Reuse the exact refinement token (hex-encoded GP0/L0 value) from search results so URL/state matches other refiners
    const filterValues = this.props.filter?.values || [];
    const termGuid = (this.extractGuidFromTermId(term.id) || '').replace(/-/g, '').toLowerCase();
    const matchingRefiner = filterValues.find((filterValue: any) => {
      if (!filterValue?.value) return false;
      const decoded = this.decodeHexString(filterValue.value) || '';
      const parts = decoded.split('|');
      const guidPart = (parts[1] || '').replace('#', '').replace(/-/g, '').toLowerCase();
      return guidPart === termGuid;
    });

    // Prefer the exact refiner object from the results so we emit the same payload as the checkbox layout
    const filterValue: IDataFilterValueInfo = matchingRefiner ? (() => {
      const decoded = this.decodeHexString(matchingRefiner.value || '');
      const normalizedToken = this.normalizeRefinementToken(decoded);
      const encodedToken = this.encodeRefinementToken(normalizedToken);

      return {
        name: normalizedToken,
        value: encodedToken,
        operator: matchingRefiner.operator,
        selected: checked,
      };
    })() : {
      name: term.label,
      value: term.id,
      selected: checked,
    };
    
    this.props.onChecked(this.props.filter?.filterName, filterValue);
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

    // Replace L0 with GP0 to match checkbox layout output
    let prefix = parts[0];
    if (prefix.startsWith('L0')) {
      prefix = prefix.replace('L0', 'GP0');
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

  private renderTerm = (term: any, level: number = 0): JSX.Element => {
    const hasChildren = term.children && term.children.length > 0;
    const isExpanded = this.state.expandedTerms[term.id];
    const isSelected = this.state.selectedTerms[term.id];
    const indent = level * 20;

    // Check if this term ID or any descendant exists in the available filter values from results
    // filter.values contain hex-encoded strings like '"ǂǂ4c307c233034633135356433362d643663622d346231332…"'
    // Decoded format is: 'L0|#0<GUID>|<Name>' e.g. 'L0|#04c155d36-d6cb-4b13-a4d3-32581f755174|Lyon, Auvergne-Rhône-Alpes, France'
    const filterValues = this.props.filter?.values || [];
    const termExistsInResults = this.termOrDescendantExistsInResults(term, filterValues);
    
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
        {hierarchicalTerms.map((term: any) => this.renderTerm(term, 0))}
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
    const hierarchical = <FilterHierarchicalComponent {...props} onChecked={(filterName: string, filterValue: IDataFilterValueInfo) => {
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

    ReactDOM.render(hierarchical, this);
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this);
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */