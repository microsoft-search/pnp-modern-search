import * as React from 'react';
import { BaseWebComponent, IDataFilter, IDataFilterValue, FilterConditionOperator, FilterComparisonOperator, IDataFilterInfo, ExtensibilityConstants, IDataFilterConfiguration, IDataFilterValueInfo } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Label, Icon, ITheme, getTheme } from '@fluentui/react';
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
     * The dayjs library reference
     */
    dayjs: any;

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
            selectedFilters: []
        };

        this._onRemovefilter = this._onRemovefilter.bind(this);
    }


    public render() {

        let renderSelectedFilterValues: JSX.Element = null;
        const filters = this.props.filters;
        const renderableFilters = filters.filter(filter => filter.values.length > 0);

        if (renderableFilters.length > 0) {

            // Display only filters with values.
            const renderFilters = renderableFilters.map((filter: IDataFilter, i) => {
                let renderValues: JSX.Element[] = null;
                const operator = this.getConditionOperatorString(filter.operator);

                // Get display name of the filter if specified 
                let filterName = filter.filterName;
                const currentFilterConfig = this.props.filtersConfiguration.filter(filterConfig => filterConfig.filterName === filter.filterName);
                if (currentFilterConfig.length === 1) {
                    filterName = currentFilterConfig[0].displayValue ? currentFilterConfig[0].displayValue : filterName;
                }

                const uniqueDisplayValues: Array<{ displayValue: string; operator: FilterComparisonOperator }> = [];
                const seenDisplayValues = new Set<string>();

                filter.values.forEach(value => {
                    let displayValue = this.props.dayjs && this.props.dayjs(value.value).isValid() ? this.props.dayjs(value.value).format('LL') : value.name;

                    // For taxonomy filters (GPP/GP0 tokens), extract the label if name is not set
                    if (!displayValue || displayValue.indexOf("GPP|#") === 0 || displayValue.indexOf("GP0|#") === 0) {
                        // Try to extract label from the token value field
                        const labelFromToken = this.extractLabelFromToken(value.value);
                        if (labelFromToken) {
                            displayValue = labelFromToken;
                        }
                    }

                    if (displayValue && displayValue.indexOf("i:0#") > -1) {
                        //displayValue = displayValue.split("|")[1] + " (" + displayValue.split("|")[0] +")";  //like [PeopleCheckBox=" Lee Gu (LeeG@tcwlv.onmicrosoft.com )"]
                        displayValue = displayValue.split("|")[1];  //like [PeopleCheckBox=" Lee Gu"]
                    }

                    const normalizedDisplayValue = displayValue ? displayValue.trim().toLocaleLowerCase() : '';
                    if (normalizedDisplayValue.length > 0 && !seenDisplayValues.has(normalizedDisplayValue)) {
                        seenDisplayValues.add(normalizedDisplayValue);
                        uniqueDisplayValues.push({
                            displayValue,
                            operator: value.operator
                        });
                    }
                });

                renderValues = uniqueDisplayValues.map((entry, j) => {
                    const filterString = `${filterName}${this.getComparisonOperatorString(entry.operator)}"${entry.displayValue}"`;
                    let renderFilterValues = null;

                    if (j < uniqueDisplayValues.length - 1) {
                        renderFilterValues = <span className={styles.operator} style={{ marginLeft: 5, marginRight: 5 }}>{`${operator}`}</span>;
                    }

                    return <React.Fragment key={`${filter.filterName}-${entry.displayValue}-${j}`}>
                        {filterString}
                        {renderFilterValues}
                    </React.Fragment>;
                });

                return <React.Fragment key={`${filter.filterName}-${i}`}>
                    <div className={styles.filterRow}>
                        <Label theme={(this.props.themeVariant as ITheme) || getTheme()}>
                            <Icon iconName='ClearFilter'
                                data-ui-test-id={TestConstants.SelectedFiltersClearFilter}
                                theme={(this.props.themeVariant as ITheme) || getTheme()}
                                onClick={() => {
                                    // Remove all the values for that filter
                                    this._onRemovefilter(filter.filterName, filter.values, this.props.instanceId);
                                }}>
                            </Icon>
                        </Label>
                        <Label className={styles.filterRowValues} style={{ minWidth: 0 }} theme={(this.props.themeVariant as ITheme) || getTheme()}>
                            <div className={styles.ellipsis}>[{renderValues}]</div>
                        </Label>
                    </div>
                    {i < renderableFilters.length - 1 ?
                        <div className={styles.filterRow}>
                            <Label className={styles.operator} theme={(this.props.themeVariant as ITheme) || getTheme()}>{`${this.getConditionOperatorString(this.props.operator as FilterConditionOperator)}`}</Label>
                        </div>
                        : null
                    }
                </React.Fragment>;
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

            const filterInfoValues = filterValues.map(filterValue => {
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

    private extractLabelFromToken = (tokenValue: string): string => {
        if (!tokenValue) return null;

        try {
            // Handle encoded hex format (ǂǂHEX)
            let decodedToken = tokenValue;
            if (tokenValue.startsWith('"') && tokenValue.includes('ǂǂ')) {
                const hexPart = tokenValue.slice(tokenValue.indexOf('ǂǂ') + 2, -1); // Remove quotes and ǂǂ prefix
                const hexPairs = hexPart.match(/.{1,2}/g);
                if (hexPairs) {
                    decodedToken = String.fromCharCode(...hexPairs.map(hex => parseInt(hex, 16)));
                } else {
                    return null;
                }
            }

            // Extract label from taxonomy token patterns like:
            // - GPP|#GUID|Label or GPP|#0|Label (parent)
            // - GP0|#GUID|Label (leaf)
            // - or(...) patterns
            const labelRegex = /\|#[^|]*\|([^|;)]+)/;
            const match = decodedToken.match(labelRegex);
            if (match && match[1]) {
                return match[1];
            }

            // Try to extract from L0|#GUID|Label pattern
            const l0Regex = /L0\|#[^|]*\|([^|;)]+)/;
            const l0Match = decodedToken.match(l0Regex);
            if (l0Match && l0Match[1]) {
                return l0Match[1];
            }
        } catch {
            // Fail silently and return null
            Log.warn(SelectedFilters_LogSource, `Failed to extract label from token: ${tokenValue}`);
        }

        return null;
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

        const dateHelper: DateHelper = this._serviceScope.consume(DateHelper.ServiceKey);
        const dayjs = await dateHelper.moment();

        let props = this.resolveAttributes();
        const filters = props.filters ? props.filters as IDataFilter[] : [];
        const filtersConfiguration = props.filtersConfiguration ? props.filtersConfiguration as IDataFilterConfiguration[] : [];

        const filtersComponent = <SelectedFiltersComponent {...props} dayjs={dayjs} filters={filters} filtersConfiguration={filtersConfiguration} />;
        ReactDOM.render(filtersComponent, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}