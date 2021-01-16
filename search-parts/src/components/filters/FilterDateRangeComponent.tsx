import * as React from 'react';
import { BaseWebComponent, FilterComparisonOperator,IDataFilterInfo, IDataFilterValueInfo, IDataFilterInternal, ExtensibilityConstants  } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { ITheme } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IDatePickerProps, IDatePickerStyles, IDatePickerStyleProps, DatePicker, Link, MessageBar, MessageBarType } from "office-ui-fabric-react";
import * as strings from 'CommonStrings';
import { DateHelper } from '../../helpers/DateHelper';

export interface IFilterDateRangeComponentProps {

    /**
     * The current selected filters. Because we can select values outside of values retrieved from results, we need this information to display the default date picker values correctly after the user selection
     */
    filter: IDataFilterInternal;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Handler when the date is updated
     */
    onUpdate: (filterValues: IDataFilterValueInfo[]) => void;

    /**
     * The moment.js library reference
     */
    moment: any;
}

export interface IFilterDateRangeComponentState {

    /**
     * The current selected 'From' date
     */
    selectedFromDate: Date;

    /**
     * The current selected 'To' date
     */
    selectedToDate: Date;
}

export class FilterDateRangeComponent extends React.Component<IFilterDateRangeComponentProps, IFilterDateRangeComponentState> {

    public constructor(props: IFilterDateRangeComponentProps) {
        super(props);

        this.state = {
            selectedFromDate: null,
            selectedToDate: null
        };

        this._updateFromDate = this._updateFromDate.bind(this);
        this._updateToDate = this._updateToDate.bind(this);
        this._updateFilter = this._updateFilter.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
        this._onFormatDate = this._onFormatDate.bind(this);
    }
    
    public render() {

        const datePickerStyles = (props: IDatePickerStyleProps) => {
            const customStyles: Partial<IDatePickerStyles> = {
                textField: {
                    selectors: {
                        input: {
                            backgroundColor: this.props.themeVariant.semanticColors.bodyBackground,
                            color: this.props.themeVariant.semanticColors.bodyText
                        },
                        'input::placeholder': {
                            color: this.props.themeVariant.semanticColors.bodyText
                        }
                    }
                }
            };
            
            return customStyles;
        };

        const fromProps: IDatePickerProps = {
            placeholder: strings.General.DateFromLabel,
            onSelectDate: this._updateFromDate,
            value: this.state.selectedFromDate,
            showGoToToday: true,
            borderless: true,
            styles: datePickerStyles,
            theme: this.props.themeVariant as ITheme,
            strings: strings.General.DatePickerStrings,
            formatDate: this._onFormatDate
        };

        let toProps: IDatePickerProps = {
            placeholder: strings.General.DateTolabel,
            onSelectDate: this._updateToDate,
            value: this.state.selectedToDate,
            showGoToToday: true,
            styles: datePickerStyles,
            theme: this.props.themeVariant as ITheme,
            borderless: true,
            strings: strings.General.DatePickerStrings,
            formatDate: this._onFormatDate
        };        

        if (this.state.selectedFromDate) {
            const minDdate = new Date(this.state.selectedFromDate.getTime());
            minDdate.setDate(this.state.selectedFromDate.getDate() + 1);
            toProps.minDate = minDdate;
        }

        if (this.state.selectedToDate) {
            const maxDate = new Date(this.state.selectedToDate.getTime());
            maxDate.setDate(this.state.selectedToDate.getDate() - 1);
            fromProps.maxDate = maxDate;
        }

        return  <div>
                    <DatePicker {...fromProps} />
                    <DatePicker {...toProps} />
                    <Link theme={this.props.themeVariant as ITheme} onClick={this._clearFilters} disabled={!this.state.selectedToDate && !this.state.selectedFromDate}>{strings.Filters.ClearAllFiltersButtonLabel}</Link>
                </div>;
    }

    public componentDidMount() {

        if (this.props.filter.values.length > 0) {

            let selectedFromDate: Date = undefined;
            let selectedToDate: Date = undefined;

            // Determine 'from' and 'to' dates by lokking at the operator for currently selected values
            this.props.filter.values.filter(value => value.selected).forEach(filterValue => {
                if (filterValue.operator === FilterComparisonOperator.Geq && !selectedFromDate) {
                    selectedFromDate =  new Date(filterValue.value);
                }

                if (filterValue.operator === FilterComparisonOperator.Lt && !selectedToDate) {
                    selectedToDate = new Date(filterValue.value);
                }
            });

            this.setState({
                selectedFromDate: selectedFromDate,
                selectedToDate: selectedToDate
            });
        }  
    }

    private _updateFromDate(fromDate: Date) {

        this.setState({
            selectedFromDate: fromDate
        });

        this._updateFilter(fromDate, this.state.selectedToDate, true);
    }

    private _updateToDate(toDate: Date) {

        this.setState({
            selectedToDate: toDate
        });

        this._updateFilter(this.state.selectedFromDate, toDate, true);
    }

    private _updateFilter(selectedFromDate: Date, selectedToDate: Date, selected: boolean) {

        let updatedValues: IDataFilterValueInfo[] = [];

        let startDate = selectedFromDate ? selectedFromDate.toISOString() : null;
        let endDate = selectedToDate ? selectedToDate.toISOString() : null;

        // Build values
        if (startDate) {
            updatedValues.push({
                name: startDate,
                value: startDate,
                operator: FilterComparisonOperator.Geq,
                selected: selected
            });
        }

        if (endDate) {
            updatedValues.push({
                name: endDate,
                value: endDate,
                operator: FilterComparisonOperator.Lt,
                selected: selected
            });
        }

        this.props.onUpdate(updatedValues);
    }

    private _clearFilters() {

        this._updateFilter(this.state.selectedFromDate, this.state.selectedToDate, false);

        this.setState({
            selectedFromDate: null,
            selectedToDate: null
        });
    }

    private _onFormatDate(date: Date): string {
        return this.props.moment(date).format('LL');
    }
}

export class FilterDateRangeWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {

        const dateHelper = this._serviceScope.consume<DateHelper>(DateHelper.ServiceKey);
        const moment = await dateHelper.moment();
 
        let props = this.resolveAttributes();
        let renderDateRange: JSX.Element = null;

        if (props.filter) {
 
            const filter = props.filter as IDataFilterInternal;
            renderDateRange = <FilterDateRangeComponent {...props} moment={moment} filter={filter} onUpdate={((filterValues: IDataFilterValueInfo[]) => {

                                    // Unselect all previous values
                                    const updatedValues = filter.values.map(value => {

                                        // Exclude current selected values
                                        if (filterValues.filter(filterValue => { return filterValue.value === value.value; }).length === 0) {
                                            return {
                                                name: value.name,
                                                selected: false,
                                                value: value.value,
                                                operator: value.operator
                                            } as IDataFilterValueInfo;
                                        }
                                    });

                                    // Bubble event through the DOM
                                    this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, { 
                                        detail: {                                       
                                            filterName: filter.filterName,
                                            filterValues: filterValues.concat(updatedValues.filter(v => v)),
                                            instanceId: props.instanceId
                                        } as IDataFilterInfo, 
                                        bubbles: true,
                                        cancelable: true
                                    }));
                                }).bind(this)}
                            />;
        } else {
            renderDateRange =   <MessageBar
                                    messageBarType={MessageBarType.warning}
                                    isMultiline={false}>
                                    {`Component <pnp-date-range> misconfigured. The HTML attribute 'filter' is missing.`}
                                </MessageBar>;
        }

        ReactDOM.render(renderDateRange, this);
    }    
}