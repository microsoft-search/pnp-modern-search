import * as React from 'react';
import { BaseWebComponent, IDataFilterValueInfo, ExtensibilityConstants, IDataFilterInfo } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { IComboBoxOption, Label, Icon, SelectableOptionMenuItemType, ComboBox, IComboBox, mergeStyles, Fabric } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import update from 'immutability-helper';
import styles from './FilterComboBoxComponent.module.scss';
import { FilterMulti } from './FilterMultiComponent';
import * as strings from 'CommonStrings';
import { cloneDeep, isEqual, sortBy } from '@microsoft/sp-lodash-subset';
import 'core-js/features/dom-collections';

type FilterMultiEventCallback = () => void;

const FILTER_MULTI_KEY = 'FILTER_MULTI';

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
     * The options to display in the combo box
     */
    options: IComboBoxOption[];

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Handler when a filter value is selected
     */
    onChange: (filterValues: IDataFilterValueInfo[], forceUpdate?: boolean) => void;

    /**
     * Callback handlers for filter multi events
     */
    onClear: FilterMultiEventCallback;
}

export interface IFilterComboBoxState {

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
            selectedValues: [],
            isDirty: false,
            searchValue: undefined
        };

        this._applyFilters = this._applyFilters.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
        this._onRenderOption = this._onRenderOption.bind(this);
        this._onChange = this._onChange.bind(this);
    }
    
    public render() {

        const wrapperClassName = mergeStyles({
            selectors: {
              '& .ms-ComboBox': { maxWidth: '200px' }
            }
        });

        let options = this.props.options;

        if (this.state.searchValue) {

            options = options.filter(option => {

                if (option.text && option.text.indexOf(this.state.searchValue) !== -1) {
                    return true;
                }

                if (option.key && (option.key as string).indexOf(this.state.searchValue) !== -1) {
                    return true;
                }
            });
        }

        let renderIcon: JSX.Element = null;
        let renderCombo: JSX.Element =  <Fabric className={wrapperClassName}>
                                            <ComboBox 
                                                allowFreeform={true}
                                                text={this.state.searchValue ? this.state.searchValue : this.props.options.filter(option => option.selected).map(option => option.text).join(',')}
                                                componentRef={this.comboRef}
                                                disabled={this.props.options.length === 0}                                              
                                                options={options} // This will be mutated by the combo box when values are selected/unselected
                                                placeholder={this.props.options.length === 0 ? strings.Filters.FilterNoValuesMessage : strings.Filters.ComboBoxPlaceHolder}
                                                onRenderOption={this._onRenderOption}
                                                useComboBoxAsMenuWidth={true}
                                                onPendingValueChanged={(option?: IComboBoxOption, index?: number, value?: string)=> {
                                                    // A new value has been entered
                                                    if (value !== undefined ) {

                                                        if (this.state.searchValue === undefined) {

                                                            // Open the combo box
                                                            this.comboRef.current.focus(true);
                                                        }

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

        if ((!this.props.isMulti && this.state.selectedValues.filter(selectedValue => selectedValue.selected).length > 0) ||
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
        const selectedValues: IDataFilterValueInfo[] = this.props.options.map(option => {

            // Convert the option to a IDataFilterValue
            if (option.itemType === SelectableOptionMenuItemType.Normal && option.selected) {
                return {
                    name: option.data.textWithoutCount,
                    value: option.key as string,
                    selected: option.selected
                };
            }
        });

        const updatedValues = update(this.state.selectedValues, { $set: selectedValues.filter(v => v) });

        this.setState({
            selectedValues: updatedValues
        });

        this._initialOptions = cloneDeep(this.props.options);

        // Save the initial state wo we could compare afterwards
        this._initialSelectedValues = cloneDeep(updatedValues);
    }

    private _onChange(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) {

        if (option) {
            let updatedSelectedValues: IDataFilterValueInfo[] = [];

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
                isDirty: true,
                searchValue: undefined
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
        this.props.onChange(this.state.selectedValues, true);
    }

    /**
     * Clears all selected filters for the current refiner
     */
    private _clearFilters() {
        this.props.onClear();
    }

    private _onRenderOption(option: IComboBoxOption, defaultRender?: (renderProps?: IComboBoxOption) => JSX.Element) {

        if (option.key === FILTER_MULTI_KEY) {
            return (
                    <div style={{
                        fontWeight: 'normal',
                        height: '100%',
                        color: this.props.themeVariant.semanticColors.bodyText,
                        fontSize: 12
                    }}>
                        <FilterMulti
                            onApply={this._applyFilters}
                            onClear={this._clearFilters}
                            themeVariant={this.props.themeVariant}
                            applyDisabled={isEqual(sortBy(this.state.selectedValues, 'value'), sortBy(this._initialSelectedValues, 'value'))}
                            clearDisabled={this._initialOptions.filter(initialOption => initialOption.selected).length === 0}
                        />
                    </div>
              );
        } else {
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
                options.push(
                    {
                        key: undefined,
                        text: undefined,
                        itemType: SelectableOptionMenuItemType.Divider,
                    },
                    {
                        key: FILTER_MULTI_KEY,
                        text: '',
                        disabled: true,
                        itemType: SelectableOptionMenuItemType.Header
                    }
                );
            }
        }
        
        filterComboBox =  <FilterComboBox
                                {...props} 
                                options={options}  
                                onChange={((filterValues: IDataFilterValueInfo[], forceUpdate?: boolean) => {
                                    // Bubble event through the DOM
                                    this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, { 
                                        detail: {                                       
                                            filterName: props.filterName,
                                            filterValues: filterValues,
                                            instanceId: props.instanceId,
                                            forceUpdate: forceUpdate
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

    private toBoolean(value: string): boolean {
        if (/^(true|false)$/.test(value)) {
            return (value === 'true');
        } else {
            return false;
        }
    }
}