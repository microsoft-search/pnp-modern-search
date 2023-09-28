import * as React from 'react';
import { BaseWebComponent, IDataFilterValueInfo, ExtensibilityConstants, IDataFilterInfo, FilterConditionOperator } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { IComboBoxOption, Label, Icon, SelectableOptionMenuItemType, ComboBox, IComboBox, mergeStyles, Fabric } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import update from 'immutability-helper';
import styles from './FilterComboBoxComponent.module.scss';
import { FilterMulti } from './FilterMultiComponent';
import * as strings from 'CommonStrings';
import { cloneDeep, isEqual, sortBy } from '@microsoft/sp-lodash-subset';
import 'core-js/features/dom-collections';
import { FilterValueOperator } from './FilterValueOperatorComponent';

type FilterMultiEventCallback = () => void;

const FILTER_MULTI_KEY = 'FILTER_MULTI';
const FILTER_VALUES_OPERATOR_KEY = 'FILTER_VALUES_OPERATOR';

export interface IFilterComboBoxProps {

    /**
     * If the values should show the associated count
     */
    showCount?: boolean;

    /**
     * If the combo box should be multi select
     */
    isMulti?: boolean;

    /**
     * The operator to use between filter values
     */
    operator?: FilterConditionOperator;    

    /**
     * The options to display in the combo box
     */
    defaultOptions: IComboBoxOption[];

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Handler when a filter value is selected
     */
    onChange: (filterValues: IDataFilterValueInfo[], forceUpdate?: boolean, operator?: FilterConditionOperator) => void;

    /**
     * Callback handlers for filter multi events
     */
    onClear: FilterMultiEventCallback;
}

export interface IFilterComboBoxState {

    /**
     * The current selected keys in the combo box
     */
    selectedOptionKeys: string[];

    /**
     * The current values updated by the user (selected or unselected)
     */
    selectedValues: IDataFilterValueInfo[];

    /**
     * Flag indicating values have been updated compared to default
     */
    isDirty: boolean;

    /**
     * The input search value
     */
    searchValue: string;

    /**
     * The current selected operator for filter values
     */
    operator: FilterConditionOperator;

    /**
     * The current combo box options
     */
    options: IComboBoxOption[];
}

export class FilterComboBox extends React.Component<IFilterComboBoxProps, IFilterComboBoxState> {

    private comboRef = React.createRef<IComboBox>();

    /**
     * The initial options passed to the combo box
     */
    private _initialOptions: IComboBoxOption[] = [];

    /**
     * The initial selected values derived from initial options. We use this property to see if the control has been changed by the user.
     */
    private _initialSelectedValues: IDataFilterValueInfo[] = [];

    public constructor(props: IFilterComboBoxProps) {
        
        super(props);
        
        this.state = {
            selectedOptionKeys: [],
            options: cloneDeep(props.defaultOptions),
            selectedValues: [],
            isDirty: false,
            searchValue: undefined,
            operator: undefined
        };

        this._applyFilters = this._applyFilters.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
        this._onRenderOption = this._onRenderOption.bind(this);
        this._updatedOperator = this._updatedOperator.bind(this);
        this._onChange = this._onChange.bind(this);
    }
    
    public render() {

        const wrapperClassName = mergeStyles({
            selectors: {
              '& .ms-ComboBox': { maxWidth: '250px' }
            }
        });

        let options = this.state.options;

        let foundValuesCount = 0;
        // Filter the current collection by the search value
        if (this.state.searchValue) {
            
            options = this.state.options.filter(option => {

                if (option.text && option.text.toLocaleLowerCase().indexOf(this.state.searchValue.toLocaleLowerCase()) !== -1) {
                    foundValuesCount++;
                    return true;
                }
    
                if (option.key && (option.key as string).toLocaleLowerCase().indexOf(this.state.searchValue.toLocaleLowerCase()) !== -1) {
                    foundValuesCount++;
                    return true;
                }

                if (option.key && (option.key === FILTER_MULTI_KEY || option.key === FILTER_VALUES_OPERATOR_KEY)) {
                    return true;
                }
            });

            // No value found
            if (foundValuesCount === 0) {
                options = [];
            }
        }

        let renderIcon: JSX.Element = null;
        let renderCombo: JSX.Element =  <Fabric className={wrapperClassName}>
                                            <ComboBox 
                                                allowFreeform={true}
                                                text={this.state.searchValue ? this.state.searchValue : this.props.defaultOptions.filter(option => option.selected).map(option => option.text).join(',')}
                                                componentRef={this.comboRef}
                                                disabled={this.props.defaultOptions.length === 0}     
                                                selectedKey={this.state.selectedOptionKeys}                                         
                                                options={options} // This will be mutated by the combo box when values are selected/unselected
                                                placeholder={this.props.defaultOptions.length === 0 ? strings.Filters.FilterNoValuesMessage : strings.Filters.ComboBoxPlaceHolder}
                                                onRenderOption={this._onRenderOption}
                                                useComboBoxAsMenuWidth={!this.props.isMulti}
                                                onPendingValueChanged={(option?: IComboBoxOption, index?: number, value?: string)=> {
                                                    // Open the combo box
                                                    this.comboRef.current.focus(true);

                                                    // A new value has been entered
                                                    if (value !== undefined) {
                                                        this.setState({
                                                            searchValue: value
                                                        });
                                                    }
                                                }}
                                                autoComplete='off'
                                                styles={{
                                                    optionsContainerWrapper: {
                                                        overflow: 'hidden'
                                                    },
                                                    input: {
                                                        backgroundColor: 'inherit'
                                                    },
                                                    header:{
                                                        height: '100%'
                                                    }
                                                }}
                                                multiSelect={this.props.isMulti}
                                                onChange={this._onChange}            
                                            />
                                        </Fabric>;

        if ((!this.props.isMulti && this.state.selectedOptionKeys.length > 0) ||
            this.props.isMulti && this._initialOptions.filter(option => option.selected).length > 0) {

            renderIcon =    <Label>
                                <Icon
                                    iconName='ClearFilter' 
                                    onClick={() => {
                                        
                                        if (!this.props.isMulti) {
                                            const selectedValueIdx = this.state.selectedValues.map(value => { return value.value; }).indexOf(this.comboRef.current.selectedOptions[0].key as string);

                                            if (selectedValueIdx !== -1) {
                                                const updatedSelectedValues = update(this.state.selectedValues, { [selectedValueIdx]: { selected: { $set: false }}});
    
                                                this.setState({
                                                    selectedValues: updatedSelectedValues
                                                });
                                           
                                                this.props.onChange(updatedSelectedValues);
                                            }
                                        } else {
                                            this._clearFilters();
                                        }
                                    }}>
                                </Icon>
                            </Label>;
        }
        
        return  <div className={styles.filterComboBox}>
                    {renderCombo}
                    {renderIcon}
                </div>;
    }

    public componentDidMount() {

        // Build the initial array of selected values
        const selectedValues: IDataFilterValueInfo[] = this.props.defaultOptions.map(option => {

            // Convert the option to a IDataFilterValue
            if (option.itemType === SelectableOptionMenuItemType.Normal && option.selected) {
                return {
                    name: option.data.textWithoutCount,
                    value: option.key as string,
                    selected: option.selected
                };
            }
        }).filter(s => s);

        this.setState({
            selectedValues: selectedValues,
            selectedOptionKeys: selectedValues.map(v => v.value),
            operator: this.props.operator
        });

        // Save the initial state wo we could compare afterwards
        this._initialOptions = cloneDeep(this.props.defaultOptions);
        this._initialSelectedValues = cloneDeep(selectedValues);
    }

    public async _onChange(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) {

        let selectedKeys = this.state.selectedOptionKeys;

        if (option) {

            // Determine the selection state
            let updatedSelectedValues: IDataFilterValueInfo[] = [];
            const selectedKeyIdx = this.state.selectedOptionKeys.indexOf(option.key as string);

            if (option.selected && selectedKeyIdx === -1) {
                selectedKeys = update(this.state.selectedOptionKeys, {$push: [option.key as string] });
            } else {
                selectedKeys = update(this.state.selectedOptionKeys, { $splice: [[selectedKeyIdx, 1]] });
            }

            // Update options selected state as well to match with selected keys 
            let options: IComboBoxOption[] = [];
            options = this.state.options.map((comboOption) => {
                comboOption.selected = selectedKeys.indexOf(comboOption.key as string) !== -1;
                return comboOption;
            });

            // Get the corresponding value in selected values and change the selected flag
            const selectedValueIdx = this.state.selectedValues.map(selectedValue => { return selectedValue.value; }).indexOf(option.key as string);
    
            // The 'selected' flag is not updated when not multi so we use the opposite as the previous value
            const isSelected = this.props.isMulti ? option.selected : !option.selected;
    
            if (selectedValueIdx !== -1) {
    
                if (!option.selected && this.props.isMulti) {
                    // Don't remove the value from the selected filter values but set it as unselected
                    updatedSelectedValues = update(this.state.selectedValues, { [selectedValueIdx]: { selected: { $set: false } }});
                } else {
                    updatedSelectedValues = update(this.state.selectedValues, { [selectedValueIdx]: { selected: { $set: isSelected }, name: {$set: option.data.textWithoutCount } }});
                }
    
            } else {
    
                const dataFilterValues: IDataFilterValueInfo = {
                    name: option.data.textWithoutCount,
                    value: option.key as string,
                    selected: isSelected
                };
    
                updatedSelectedValues = update(this.state.selectedValues, { $push: [dataFilterValues] });
            }

            this.setState({
                selectedValues: updatedSelectedValues,
                options: options,
                selectedOptionKeys: selectedKeys
            });

            if (!this.props.isMulti) {
                this.props.onChange(updatedSelectedValues);
            }
        } 
    }

    /**
     * Applies all selected filter values for the current filter
     */
    private _applyFilters() {
        this.props.onChange(this.state.selectedValues, true, this.state.operator);
    }

    /**
     * Clears all selected filters for the current refiner
     */
    private _clearFilters() {
        this.props.onClear();
    }

    /**
     * Updates the operator to use between filter values
     * @param operator the new operator
     */
    private _updatedOperator(operator: FilterConditionOperator) {

        this.setState({
            operator: operator
        });
    }

    private _onRenderOption(option: IComboBoxOption, defaultRender?: (renderProps?: IComboBoxOption) => JSX.Element) {

        switch(option.key) {

            case FILTER_MULTI_KEY:

                return (
                    <div style={{
                        fontWeight: 'normal',
                        height: '100%',
                        color: this.props.themeVariant.semanticColors.bodyText,
                        fontSize: 12,
                        marginLeft: -8
                    }}>
                        <FilterMulti
                            onApply={this._applyFilters}
                            onClear={this._clearFilters}
                            themeVariant={this.props.themeVariant}
                            applyDisabled={this.state.selectedValues.filter(s => s.selected).length === 0 || (isEqual(sortBy(this.state.selectedValues, 'value'), sortBy(this._initialSelectedValues, 'value')) && this.props.operator === this.state.operator)}
                            clearDisabled={this._initialOptions.filter(initialOption => initialOption.selected).length === 0}
                        />
                    </div>
                );

            case FILTER_VALUES_OPERATOR_KEY:
                return (
                    <div style={{
                        fontWeight: 'normal',
                        height: '100%',
                        color: this.props.themeVariant.semanticColors.bodyText,
                        fontSize: 12,
                        marginLeft: 5
                    }}>
                        <FilterValueOperator
                            onFilterOperatorUpdated={this._updatedOperator}
                            operator={this.props.operator} 
                            themeVariant={this.props.themeVariant}
                        />
                    </div>
                );
            
            default:
                return defaultRender(option);
        }
    }
}

export class FilterComboBoxWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {

        let props = this.resolveAttributes();
        let options: IComboBoxOption[] = [];
        let filterComboBox: JSX.Element = null;

        // Resolve all <option> nodes in the web component inner HTML
        const htmlOptions = this.querySelectorAll("option");

        if (htmlOptions.length > 0) {
            htmlOptions.forEach((htmlOption, key) => {
                options.push({
                    index: key,
                    key: htmlOption.value,
                    text: props.showCount ? `${htmlOption.text} (${Number(htmlOption.getAttribute('data-count'))})` : htmlOption.text,
                    itemType: SelectableOptionMenuItemType.Normal,
                    disabled: this.toBoolean(htmlOption.getAttribute('data-disabled')),
                    selected:  this.toBoolean(htmlOption.getAttribute('data-selected')),
                    data: {
                        textWithoutCount: htmlOption.text
                    },
                    styles: {
                        root: {
                            paddingTop: 8,
                            paddingBottom: 8
                        }
                    }
                } as IComboBoxOption);
            });

            if (props.isMulti) {

                // Values operator control
                options.unshift(
                    {
                        key: FILTER_VALUES_OPERATOR_KEY,
                        text: '',
                        disabled: true,
                        itemType: SelectableOptionMenuItemType.Header
                    },
                    {
                        key: undefined,
                        text: undefined,
                        itemType: SelectableOptionMenuItemType.Divider,
                    }
                );

                // Multi control
                options.unshift(
                    {
                        key: FILTER_MULTI_KEY,
                        text: '',
                        disabled: true,
                        itemType: SelectableOptionMenuItemType.Header
                    },
                    {
                        key: undefined,
                        text: undefined,
                        itemType: SelectableOptionMenuItemType.Divider,
                    }
                );
            }
        }
        
        filterComboBox =  <FilterComboBox
                                {...props} 
                                defaultOptions={options}  
                                onChange={((filterValues: IDataFilterValueInfo[], forceUpdate?: boolean, operator?: FilterConditionOperator) => {
                                    // Bubble event through the DOM
                                    this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, { 
                                        detail: {                                       
                                            filterName: props.filterName,
                                            filterValues: filterValues,
                                            instanceId: props.instanceId,
                                            forceUpdate: forceUpdate,
                                            operator: operator // Specific the operator explicitly
                                        } as IDataFilterInfo, 
                                        bubbles: true,
                                        cancelable: true
                                    }));
                                }).bind(this)}
                                onClear={(() => {
                                    // Bubble event through the DOM
                                    this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, { 
                                        detail: {
                                            filterName: props.filterName,
                                            instanceId: props.instanceId
                                        },
                                        bubbles: true,
                                        cancelable: true
                                    }));
                                }).bind(this)}
                            />;
        
        ReactDOM.render(filterComboBox, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }

    private toBoolean(value: string): boolean {
        if (/^(true|false)$/.test(value)) {
            return (value === 'true');
        } else {
            return false;
        }
    }
}