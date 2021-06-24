import * as React from 'react';
import { BaseWebComponent,IDataFilterInfo, IDataFilterValueInfo, IDataFilterInternal, ExtensibilityConstants, FilterComparisonOperator  } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { ITheme, ChoiceGroup, IChoiceGroupOption, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import * as strings from 'CommonStrings';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { DateHelper } from '../../helpers/DateHelper';

export enum DateFilterInterval {
    AnyTime,
    Past24,
    PastWeek,
    PastMonth,
    Past3Months,
    PastYear,
    OlderThanAYear
}

export interface IFilterDateIntervalComponentProps {

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

export interface IFilterDateIntervalComponentState {
    options: IChoiceGroupOption[];
}

export class FilterDateIntervalComponent extends React.Component<IFilterDateIntervalComponentProps, IFilterDateIntervalComponentState> {

    private _allOptions = [
        {
            key: DateFilterInterval.AnyTime.toString(),
            text: strings.General.DateIntervalStrings.AnyTime
        },
        {
            key: DateFilterInterval.Past24.toString(),
            text: strings.General.DateIntervalStrings.PastDay
        },
        {
            key: DateFilterInterval.PastWeek.toString(),
            text: strings.General.DateIntervalStrings.PastWeek,
        },
        {
            key: DateFilterInterval.PastMonth.toString(),
            text: strings.General.DateIntervalStrings.PastMonth
        },
        {
            key: DateFilterInterval.Past3Months.toString(),
            text: strings.General.DateIntervalStrings.Past3Months
        },
        {
            key: DateFilterInterval.PastYear.toString(),
            text: strings.General.DateIntervalStrings.PastYear
        },
        {
            key: DateFilterInterval.OlderThanAYear.toString(),
            text: strings.General.DateIntervalStrings.Older
        }
    ];

    public constructor(props: IFilterDateIntervalComponentProps) {
        super(props);

        this.state = {
            options: []
        };

        this._onChange = this._onChange.bind(this);
    }
    
    public render() {

        let dateAsString: string = undefined;
        const values = this.props.filter.values.filter(value => value.selected).sort((a,b) => {
            return new Date(a.value).getTime() - new Date(b.value).getTime();
        });
        
        // Values currently in the range (we take on the first one to determine the correct interval)
        if (values.length >= 1) {
            dateAsString = values[0].value;
        }

        return <div>
            <ChoiceGroup
                theme={this.props.themeVariant as ITheme}
                options={this.state.options}
                selectedKey={this._getIntervalKeyForValue(dateAsString)}            
                onChange={this._onChange}
                styles={{
                    root: {
                        paddingLeft: 10,
                        backgroundColor: 'inherit'
                    },
                    flexContainer:{
                        selectors: {
                            label: {
                                color: this.props.themeVariant.semanticColors.bodyText
                            }
                        }
                    }
                }}
            />
        </div>;
    }

    public componentDidMount() {

        const intervals: {
            /**
             * The key represents the DateFilterInterval and the number equals to the count for this interval
             */
            [key: string] : number
        } = {};
  
        // Determine intervals according current filter values
        if (this.props.filter.values.length > 0) {
            this.props.filter.values.filter(v => !v.selected).forEach(value => {

                // Could have count 0 with SharePoint date ranges
                if (value.count > 0) {
                    const interval = this._getIntervalKeyForValue(value.value);
                    if (interval) {
                        if (Object.keys(intervals).indexOf(interval) === -1) {
                            intervals[interval] = value.count;
                        } else {
                            intervals[interval] = (intervals[interval] += value.count);
                        }
                    }
                }
            });
    
            const availableOptions = this._allOptions.map(option => {
    
                if (Object.keys(intervals).indexOf(option.key) !== -1) {
                    option.text = this.props.filter.showCount ? `${option.text} (${intervals[option.key]})` : option.text;
                    return option;
                } else if (option.key === DateFilterInterval.AnyTime.toString()) {
                    return option;
                }
                
            }).filter(o => o);
    
            this.setState({
                options: availableOptions
            });
        }         
    }

    public _onChange(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) {
        
        // Buld filters
        let updatedValues: IDataFilterValueInfo[] = [];

        switch (option.key) {

            case String(DateFilterInterval.OlderThanAYear):
                updatedValues.push(
                    {
                        name: strings.General.DateIntervalStrings.Older,
                        value: this.props.moment(new Date()).subtract(1, 'years').subtract('minutes', 1).toISOString(), // Needed to distinguish past yeart VS older than a year
                        selected: true,
                        operator: FilterComparisonOperator.Lt
                    }
                );
                break;

            case String(DateFilterInterval.Past24):
                updatedValues.push(
                    {
                        name: strings.General.DateIntervalStrings.PastDay,
                        value: new Date().toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Leq
                    },
                    {
                        name: strings.General.DateIntervalStrings.PastDay,
                        value: this.props.moment(new Date()).subtract(24, 'hours').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Geq
                    }
                );
                break;

            case String(DateFilterInterval.Past3Months):
                updatedValues.push(
                    {
                        name: strings.General.DateIntervalStrings.Past3Months,
                        value: this.props.moment(new Date()).subtract(1, 'months').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Leq
                    },
                    {
                        name: strings.General.DateIntervalStrings.Past3Months,
                        value: this.props.moment(new Date()).subtract(3, 'months').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Geq
                    }
                );
                break;

            case String(DateFilterInterval.PastMonth):
                updatedValues.push(
                    {
                        name: strings.General.DateIntervalStrings.PastMonth,
                        value: this.props.moment(new Date()).subtract(1, 'week').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Leq
                    },
                    {
                        name:strings.General.DateIntervalStrings.PastMonth,
                        value: this.props.moment(new Date()).subtract(1, 'months').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Geq
                    }
                );
                break;

            case String(DateFilterInterval.PastWeek):
                updatedValues.push(
                    {
                        name: strings.General.DateIntervalStrings.PastWeek,
                        value: this.props.moment(new Date()).subtract(24, 'hours').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Leq
                    },
                    {
                        name:strings.General.DateIntervalStrings.PastWeek,
                        value: this.props.moment(new Date()).subtract(1, 'week').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Geq
                    }
                );
                break;

            case String(DateFilterInterval.PastYear):
                updatedValues.push(
                    {
                        name: strings.General.DateIntervalStrings.PastYear,
                        value: this.props.moment(new Date()).subtract(3, 'months').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Leq
                    },
                    {
                        name:strings.General.DateIntervalStrings.PastYear,
                        value: this.props.moment(new Date()).subtract(1, 'years').toISOString(),
                        selected: true,
                        operator: FilterComparisonOperator.Geq
                    }
                );
                break;
        }

        this.props.onUpdate(updatedValues);
    }

    private _getIntervalDate(unit: string, count: number): Date {
        return this._getIntervalDateFromStartDate(new Date(), unit, count);
    }

    private _getIntervalDateFromStartDate(startDate: Date, unit: string, count: number): Date {
        return this.props.moment(startDate).subtract(count, unit).toDate();
    }

    private _getIntervalKeyForValue(dateAsString: string): string {

        if (dateAsString) {

            // Value from SharePoint Search (RefinableDateXX properties)
            if (dateAsString.indexOf('range(') !== -1) {
                const matches = dateAsString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)/gi);
                if (matches) {
                        
                    // Return the last date of the range expression to get the correct interval 
                    dateAsString = matches[matches.length-1];
                }
            }

            const selectedStartDate = new Date(dateAsString);

            // The 1 minute time addition represents a 'buffer' between the time the filter is selected in the component and the time when the filter value is sent back from the data source to the component 
            // If the data source takes too long to execute, it may cause of the wrong interval to be selected at render
            const pastYearDate = this._getIntervalDateFromStartDate(this._getIntervalDate("years", 1), 'minutes', 1);

            if (selectedStartDate < pastYearDate) {
                return DateFilterInterval.OlderThanAYear.toString(); 
            } else {

                const past24Date = this._getIntervalDateFromStartDate(this._getIntervalDate("days", 1), 'minutes', 1);
                const pastWeekDate = this._getIntervalDateFromStartDate(this._getIntervalDate("weeks", 1), 'minutes', 1);
                const pastMonthDate = this._getIntervalDateFromStartDate(this._getIntervalDate("months", 1), 'minutes', 1);
                const past3MonthsDate = this._getIntervalDateFromStartDate(this._getIntervalDate("months", 3), 'minutes', 1);
                
                if (selectedStartDate >= past24Date) {
                    return DateFilterInterval.Past24.toString();
                } else if (selectedStartDate >= pastWeekDate) {
                    return DateFilterInterval.PastWeek.toString();
                } else if (selectedStartDate >= pastMonthDate) {
                    return DateFilterInterval.PastMonth.toString();
                } else if (selectedStartDate >= past3MonthsDate) {
                    return DateFilterInterval.Past3Months.toString();
                } else if (selectedStartDate >= pastYearDate) {
                    return DateFilterInterval.PastYear.toString();
                }
            }
        } else {
            return DateFilterInterval.AnyTime.toString();
        }      
    }
}

export class FilterDateIntervalWebComponent extends BaseWebComponent {
   
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
            renderDateRange = <FilterDateIntervalComponent {...props} moment={moment} filter={filter} onUpdate={((filterValues: IDataFilterValueInfo[]) => {

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
                                    {`Component <pnp-date-interval> misconfigured. The HTML attribute 'filter' is missing.`}
                                </MessageBar>;
        }

        ReactDOM.render(renderDateRange, this);
    }    
}