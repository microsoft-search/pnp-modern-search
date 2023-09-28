import * as React from "react";
import { BaseWebComponent, ExtensibilityConstants, IDataFilterInfo, IDataFilterInternal, IDataFilterValueInfo, IDataFilterValueInternal } from "@pnp/modern-search-extensibility";
import * as ReactDOM from "react-dom";
import { IconButton, ITag, ITagPickerProps, TagPicker, Text, ITheme } from "office-ui-fabric-react";
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { sortBy } from "@microsoft/sp-lodash-subset";
import styles from './FilterSearchBoxComponent.module.scss';
import * as commonStrings from 'CommonStrings';

type FilterSearchBoxEventCallback = (filterName: string, filterValue: IDataFilterValueInfo) => void;

export interface IFilterSearchBoxProps {

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * The current filter information
     */
    filter?: IDataFilterInternal;

    /**
     * Callback handlers for search
     */
    onFilterValueUpdated: FilterSearchBoxEventCallback;
}

export interface IFilterSearchBoxState {
}

export class FilterSearchBox extends React.Component<IFilterSearchBoxProps, IFilterSearchBoxState> {

    public constructor(props: IFilterSearchBoxProps) {
        super(props);
    }

    public render() {

        let textColor: string = this.props.themeVariant && this.props.themeVariant.isInverted ? (this.props.themeVariant ? this.props.themeVariant.semanticColors.bodyText : '#323130') : this.props.themeVariant.semanticColors.inputText;

        const availableValues: ITag[] = this.props.filter.values.map(filterValue => {
            return {
                key: filterValue.value,
                name: filterValue.name
            };
        });

        const selectedValues: ITag[] = this.props.filter.values.filter(f => f.selected).map(filterValue => {
            return {
                key: filterValue.value,
                name: filterValue.name
            };
        });

        let pickerProps: ITagPickerProps = {
            removeButtonAriaLabel: "Remove",
            itemLimit: availableValues.length,
            inputProps: {
                placeholder: selectedValues.length === 0 ? commonStrings.General.TagPickerStrings.SearchPlaceholder : '',
            },
            styles: {
                text: {
                    borderColor: '#c2c2c2',
                    borderLeft: 0,
                    borderRight: 0,
                    borderTop: 0
                },
                input: {
                    backgroundColor: 'transparent',
                    color: textColor,
                    selectors: {
                        '::placeholder': {
                            color: textColor
                        },
                        '::-ms-input-placeholder': {
                            color: textColor
                        }
                    }
                }
            },
            selectedItems: sortBy(selectedValues, 'name'), // Sort items alphabetically by their label every time. Otherwise, when submitting multiple filters, the order could change unexpectedly
            onResolveSuggestions: (filter: string, selectedItems?: ITag[]) => {

                const foundValues = availableValues.filter(s => s.name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1);

                // Make sure the matching values are not already selected
                return foundValues.filter(foundValue => {
                    return !selectedValues.some(selectedValue => selectedValue.key === foundValue.key);
                });
            },
            pickerSuggestionsProps: {
                noResultsFoundText: commonStrings.General.TagPickerStrings.NoResultsSearchMessage
            },
            onChange: (selectedTagItems: ITag[]) => {

                // Determine the removed item according to current selected tags
                const removedItems = this.props.filter.values.filter((selectedValue: IDataFilterValueInternal) => {
                    return selectedValue.selected && !selectedTagItems.some(tag => tag.key === selectedValue.value);
                });

                if (removedItems.length > 0) {

                    const filterValue: IDataFilterValueInfo = {
                        name: removedItems[0].name,
                        value: removedItems[0].value,
                        selected: false
                    };

                    this.props.onFilterValueUpdated(this.props.filter.filterName, filterValue);
                }
            },
            onRenderItem: (props) => {

                return <div
                    className={styles.tagItem}
                    style={
                        {
                            border: this.props.themeVariant && this.props.themeVariant.isInverted ? '1px solid #fff' : 'inherit'
                        }
                    }
                    role="listitem"
                    data-selection-index={props.index}
                    data-is-focusable="true"
                >
                    <Text
                        className={styles.tagItemText}
                        aria-label={props.item.name}
                    >
                        {props.item.name}
                    </Text>
                    <IconButton
                        className={styles.tagRemoveBtn}
                        iconProps={{ iconName: "Cancel" }}
                        styles={{ root: { height: '26px' } }}
                        onClick={() => {

                            const filterValue: IDataFilterValueInfo = {
                                name: props.item.name,
                                value: props.item.key.toString(),
                                selected: false
                            };

                            this.props.onFilterValueUpdated(this.props.filter.filterName, filterValue);
                        }}
                    >
                    </IconButton>
                </div>;
            },
            resolveDelay: 200,
            onItemSelected: (selectedItem: ITag) => {

                // Find the filter value 
                const filterValue: IDataFilterValueInfo = {
                    name: selectedItem.name,
                    value: selectedItem.key.toString(),
                    selected: true
                };

                this.props.onFilterValueUpdated(this.props.filter.filterName, filterValue);
                return selectedItem;
            },
            disabled: this.props.filter.values.length === 0
        };

        if (this.props.themeVariant) {
            pickerProps.theme = this.props.themeVariant as ITheme;
        }

        return <div><TagPicker {...pickerProps} /></div>;
    }
}

export class FilterSearchBoxWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        let props = this.resolveAttributes();
        const renderFilterSearchBox = <FilterSearchBox {...props}
            onFilterValueUpdated={((filterName: string, filterValue: IDataFilterValueInfo) => {
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
            }).bind(this)}
        />;
        ReactDOM.render(renderFilterSearchBox, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}