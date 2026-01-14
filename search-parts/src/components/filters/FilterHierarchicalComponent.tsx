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
        selectedTerms: {}
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

    const filterValue: IDataFilterValueInfo = {
      name: term.label,
      value: term.id,
      selected: checked
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