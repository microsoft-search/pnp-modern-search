import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Checkbox, ITheme, Text } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface IFilterCheckBoxProps {

    /**
     * If the checkbox should be selected
     */
    selected?: boolean;

    /**
     * If the checkbox should be disabled
     */
    disabled?: boolean;

    /**
     * The count for this filter value
     */
    count?: number;

    /**
     * The filter value to display
     */
    name?: string;

    /**
     * The value to use when selected
     */
    value?: string;

    /**
     * The filter name where belong the value
     */
    filterName?: string;

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Handler when a filter value is selected
     */
    onChecked: (filterName: string, filterValue: IDataFilterValueInfo) => void;

    /**
     * The class name to apply to the checkbox
     */
    className?: string;
    
}

export interface IFilterCheckBoxState {
}

export class FilterCheckBoxComponent extends React.Component<IFilterCheckBoxProps, IFilterCheckBoxState> {
    
    public render() {

        let filterValue: IDataFilterValueInfo = {
            name: this.props.name,
            value: this.props.value,
            selected: this.props.selected
        };

        return  <Checkbox
                    styles={{
                        root: {
                            padding: 10,
                        },
                        label: {
                            width: '100%'
                        },
                        text: {
                            color: this.props.count && this.props.count === 0 ? this.props.themeVariant.semanticColors.disabledText : this.props.themeVariant.semanticColors.bodyText
                        }
                    }}
                    className={this.props.className}
                    theme={this.props.themeVariant as ITheme}
                    defaultChecked={this.props.selected}
                    disabled={this.props.disabled}
                    title={filterValue.name}
                    label={filterValue.name}
                    onChange={(ev, checked: boolean) => {
                        filterValue.selected = checked;
                        this.props.onChecked(this.props.filterName, filterValue);
                    }}
                    onRenderLabel={(props, defaultRender) => {
                        return <Text block nowrap title={props.label}>{props.label}</Text>;
                    }}
                />;
    }
}

export class FilterCheckBoxWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
 
       let props = this.resolveAttributes();
       const checkBox = <FilterCheckBoxComponent {...props} onChecked={((filterName: string, filterValue: IDataFilterValueInfo) => {
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

       ReactDOM.render(checkBox, this);
    }    
}