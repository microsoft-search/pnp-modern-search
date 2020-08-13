import * as React from "react";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { IRefinerState, IExtensionContext, ExtensionTypes, IRefinerInstance, IRefinementResult, RefinementFilterOperationCallback, IRefinementValue, IUserService } from "..";
import { IPropertyPanePage } from "@microsoft/sp-webpart-base";
import { RefinementOperator } from "../models/ISearchResult";
import update from 'immutability-helper';

export abstract class BaseRefiner extends React.Component<IRefinerInstance, IRefinerState> {

    private _operator: RefinementOperator;

    constructor(props:IRefinerInstance) {
        super(props);
        
        this.state = {
            refinerSelectedFilterValues: []
        };
        
        this.onFilterAdded = this.onFilterAdded.bind(this);
        this.onFilterRemoved = this.onFilterRemoved.bind(this);
        this.applyFilters = this.applyFilters.bind(this);
        this.clearFilters = this.clearFilters.bind(this);
        this.onValueFilterChanged = this.onValueFilterChanged.bind(this);
        this.isFilterMatch = this.isFilterMatch.bind(this);
        this.clearValueFilter = this.clearValueFilter.bind(this);

    }

    public abstract render();

    protected filterValuesUpdated():void {

    }

    public componentDidMount() {
        this._operator = this.props.isMultiValue ? RefinementOperator.OR: RefinementOperator.AND;

        this.setState({
            refinerSelectedFilterValues: this.props.selectedValues
        });
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IRefinerInstance) {

        if (nextProps.shouldResetFilters) {
            this.setState({
                refinerSelectedFilterValues: [],
            });
        }

        // Remove an arbitrary value from the inner state
        // Useful when the remove filter action is also present in the parent layout component
        if (nextProps.removeFilterValue) {

            const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
                return elt.RefinementValue !== nextProps.removeFilterValue.RefinementValue;
            });

            this.setState({
                refinerSelectedFilterValues: newFilterValues
            });

            this.applyFilters(newFilterValues);
        }
    }

    /**
     * Checks if the current filter value is present in the list of the selected values for the current refiner
     * @param valueToCheck The filter value to check
     */
    protected isValueInFilterSelection(valueToCheck: IRefinementValue): boolean {

        let newFilters = this.state.refinerSelectedFilterValues.filter((filter) => {
            return filter.RefinementToken === valueToCheck.RefinementToken && filter.RefinementValue === valueToCheck.RefinementValue;
        });

        return newFilters.length === 0 ? false : true;
    }

    /**
     * Handler when a new filter value is selected
     * @param addedValue the filter value added
     */
    protected onFilterAdded(addedValue: IRefinementValue) {

        let newFilterValues = update(this.state.refinerSelectedFilterValues, { $push: [addedValue] });

        this.setState({
            refinerSelectedFilterValues: newFilterValues
        });

        if (!this.props.isMultiValue) {
            this.applyFilters(newFilterValues);
        }
    }

    /**
     * Handler when a filter value is unselected
     * @param removedValue the filter value removed
     */
    protected onFilterRemoved(removedValue: IRefinementValue) {

        const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
            return elt.RefinementValue !== removedValue.RefinementValue;
        });

        this.setState({
            refinerSelectedFilterValues: newFilterValues
        });

        if (!this.props.isMultiValue) {
            this.applyFilters(newFilterValues);
        }
    }

    /**
     * Applies all selected filters for the current refiner
     */
    protected applyFilters(updatedValues: IRefinementValue[]) {
        this.props.onFilterValuesUpdated(this.props.refinementResult.FilterName, updatedValues, this._operator);
    }

    /**
     * Clears all selected filters for the current refiner
     */
    protected clearFilters() {

        this.setState({
            refinerSelectedFilterValues: []
        });

        this.applyFilters([]);
    }

    /**
     * Checks if an item-object matches the provided refinement value filter value
     * @param item The item-object to be checked
     */
    protected isFilterMatch(item: IRefinementValue): boolean {
        if(!this.state.valueFilter) { return false; }
        const isSelected = this.state.refinerSelectedFilterValues.some(selectedValue => selectedValue.RefinementValue === item.RefinementValue);
        if(isSelected) { return false; }
        return item.RefinementValue.toLowerCase().indexOf(this.state.valueFilter.toLowerCase()) === -1;
    }

    /**
     * Event triggered when a new value is provided in the refinement value filter textfield.
     * @param newvalue The new value provided through the textfield
     */
    protected onValueFilterChanged(newValue: string) {
        this.setState({
            valueFilter: newValue
        });
    }

    /**
     * Clears the filter applied to the refinement values
     */
    protected clearValueFilter() {
        this.setState({
            valueFilter: ""
        });
    }

    /**
     * Prevents the parent group to be colapsed
     * @param event The event that triggered the click
     */
    protected onValueFilterClick(event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>) {
        event.stopPropagation();
    }

}

export abstract class RefinerExtensionInstance implements IRefinerInstance {
    
    public extensionType: string = ExtensionTypes.Refiner;
    public context: IExtensionContext;

    public refinementResult: IRefinementResult;
    public selectedValues: IRefinementValue[];
    public onFilterValuesUpdated: RefinementFilterOperationCallback;
    public isMultiValue?: boolean;
    public shouldResetFilters: boolean;
    public removeFilterValue?: IRefinementValue;
    public userService?: IUserService;
    public themeVariant: IReadonlyTheme;
    public showValueFilter: boolean;
    
    public abstract getPropertyPages?: () => IPropertyPanePage[];

    public abstract render: () => Promise<void>;

}