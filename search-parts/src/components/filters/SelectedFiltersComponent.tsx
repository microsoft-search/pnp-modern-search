import * as React from 'react';
import { BaseWebComponent, IDataFilter, IDataFilterValue, FilterConditionOperator, FilterComparisonOperator, IDataFilterInfo, ExtensibilityConstants, IDataFilterConfiguration, IDataFilterValueInfo } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Label, Icon, ITheme } from 'office-ui-fabric-react';
import styles from './SelectedFiltersComponent.module.scss';
import * as strings from 'CommonStrings';
import { Log } from '@microsoft/sp-core-library';
import { DateHelper } from '../../helpers/DateHelper';
import { TestConstants } from '../../common/Constants';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
const SelectedFilters_LogSource = "PnPModernSearch:SelectedFiltersComponent";

export interface ISelectedFiltersProps {

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * The current selected filters
     */
    filters: IDataFilter[];

    /**
     * The current filters configuration
     */
    filtersConfiguration: IDataFilterConfiguration[];

    /**
     * The operator used between filters
     */
    operator?: string;

    /**
     * The moment.js library reference
     */
    moment: any;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;
}

export interface ISelectedFiltersState {
}

export class SelectedFiltersComponent extends React.Component<ISelectedFiltersProps, ISelectedFiltersState> {

    public constructor(props) {

        super(props);

        this.state = {
            selectedFilters:  []
        };

        this._onRemovefilter = this._onRemovefilter.bind(this);
    }


    public render() {

        let renderSelectedFilterValues: JSX.Element = null;
        const filters = this.props.filters;
    
        if (filters.length > 0 ) {

            // Display only filter with values
            const renderFilters = filters.map((filter: IDataFilter, i) => {     
                
                let filterValuesString;

                if (filter.values.length > 0) {

                    let renderValues: JSX.Element[] = null;
                    let operator = this.getConditionOperatorString(filter.operator);

                    // Get display name of the filter if specified 
                    let filterName = filter.filterName;
                    const currentFilterConfig = this.props.filtersConfiguration.filter(filterConfig => filterConfig.filterName === filter.filterName);
                    if (currentFilterConfig.length === 1 ) {
                        filterName = currentFilterConfig[0].displayValue ? currentFilterConfig[0].displayValue : filterName;
                    }
    
                    renderValues =  filter.values.map((value, j) => {                                        
                                        const displayValue = this.props.moment && this.props.moment(value.value, this.props.moment.ISO_8601, true).isValid() ? this.props.moment(value.value).format('LL') : value.name;
                                        const filterString = `${filterName}${this.getComparisonOperatorString(value.operator)}"${displayValue}"`;
                                        filterValuesString = `${filterString}`;
                                        let renderFilterValues = null;

                                        if (j < filter.values.length - 1) {
                                            renderFilterValues =  <span className={styles.operator} style={{ marginLeft: 5, marginRight: 5}}>{`${operator}`}</span>;
                                            filterValuesString = `${filterValuesString} ${operator}`;
                                        }
                                        
                                        return  <>
                                                    {filterString}
                                                    {renderFilterValues}
                                                </>;
                                    });
                            
                    return  <>
                                <div className={styles.filterRow}>
                                    <Label theme={this.props.themeVariant as ITheme}>
                                        <Icon   iconName='ClearFilter' 
                                                data-ui-test-id={TestConstants.SelectedFiltersClearFilter}
                                                theme={this.props.themeVariant as ITheme}
                                                onClick={() => {
                                                    // Remove all the values for that filter
                                                    this._onRemovefilter(filter.filterName, filter.values, this.props.instanceId);
                                                }}>
                                        </Icon>
                                    </Label>                                    
                                    <Label className={styles.filterRowValues} style={{minWidth: 0}} theme={this.props.themeVariant as ITheme}>
                                        <div className={styles.ellipsis}>[{renderValues}]</div>
                                    </Label>
                                </div>
                                {i < filters.length - 1 && filter.values.length > 0 ? 
                                    <div className={styles.filterRow}>
                                        <Label className={styles.operator} theme={this.props.themeVariant as ITheme}>{`${this.getConditionOperatorString(this.props.operator as FilterConditionOperator)}`}</Label>
                                    </div>
                                    : null
                                }
                            </>; 
                }
            });

            renderSelectedFilterValues = <div className={styles.selectedFilters}>
                {renderFilters}
            </div>;
        }

        return renderSelectedFilterValues;
    }

    private _onRemovefilter(filterName: string, filterValues: IDataFilterValue[], instanceId: string) {

        // Notify the filter container
        const webPartDomElement = window.document.querySelector(`div[data-instance-id="${instanceId}"]`);

        if (webPartDomElement) {

            const filterInfoValues  = filterValues.map(filterValue => {
                return {
                    name: filterValue.name,
                    value: filterValue.value,
                    selected: false,
                    operator: filterValue.operator
                } as IDataFilterValueInfo;
            });

            webPartDomElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                detail: {                                       
                    filterName: filterName,
                    filterValues: filterInfoValues,
                    instanceId: instanceId,
                    forceUpdate: true
                } as IDataFilterInfo, 
                bubbles: true,
                cancelable: true
            })); 
        } else { 
            Log.info(SelectedFilters_LogSource, `Unable to find the data filter WP. Did you forget to add the 'instance-id' attribute to the 'pnp-selectedfilters' component?`);
        } 
    }

    private getConditionOperatorString(operator: FilterConditionOperator): string {
        return operator === FilterConditionOperator.AND ? strings.Filters.AndOperator : strings.Filters.OrOperator;
    }

    private getComparisonOperatorString(operator: FilterComparisonOperator): string {

        let operatorString;

        switch (operator) {

            case FilterComparisonOperator.Eq:
                operatorString = '=';
                break;

            case FilterComparisonOperator.Geq:
                operatorString = '>=';
                break;

            case FilterComparisonOperator.Gt:
                operatorString = '>';
                break;

            case FilterComparisonOperator.Leq:
                operatorString = '<=';
                break;

            case FilterComparisonOperator.Lt:
                operatorString = '<';
                break;

            case FilterComparisonOperator.Neq:
                operatorString = '<>';
                break;

            case FilterComparisonOperator.Contains:
                operatorString = ':';
                break;

            default:
                operatorString = ':';
                break;
        }

        return operatorString;
    }
}

export class SelectedFiltersWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
 
        const dateHelper = this._serviceScope.consume<DateHelper>(DateHelper.ServiceKey);
        const moment = await dateHelper.moment();

        let props = this.resolveAttributes();
        const filters = props.filters ? props.filters as IDataFilter[] : [];
        const filtersConfiguration = props.filtersConfiguration ? props.filtersConfiguration as IDataFilterConfiguration[] : [];

        const filtersComponent = <SelectedFiltersComponent {...props} moment={moment} filters={filters} filtersConfiguration={filtersConfiguration}/>;
        ReactDOM.render(filtersComponent, this);
    }    
}