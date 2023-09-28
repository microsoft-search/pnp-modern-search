import * as React from "react";
import { BaseWebComponent, ExtensibilityConstants, FilterConditionOperator } from "@pnp/modern-search-extensibility";
import * as ReactDOM from "react-dom";
import { ChoiceGroup, Icon } from "office-ui-fabric-react";
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import * as commonStrings from 'CommonStrings';
import styles from "./FilterValueOperatorComponent.module.scss";

type FilterValueOperatorEventCallback = (operator: FilterConditionOperator) => void;

export interface IFilterValueOperatorProps {

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
    operator?: FilterConditionOperator;

    /**
     * Callback handlers for search
     */
    onFilterOperatorUpdated: FilterValueOperatorEventCallback;
}

export interface IFilterValueOperatorState {
}

export class FilterValueOperator extends React.Component<IFilterValueOperatorProps, IFilterValueOperatorState> {

    public constructor(props: IFilterValueOperatorProps) {
        super(props);  
    }
    
    public render() {

        let renderOperators: JSX.Element =  <ChoiceGroup tabIndex={0}
                                                styles={{
                                                    flexContainer: {
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        selectors: {
                                                            '.ms-ChoiceField': {
                                                                marginTop: 0
                                                            },
                                                            '.ms-ChoiceField + .ms-ChoiceField': {
                                                                marginLeft: 0
                                                            },
                                                            'label::before, label::after': {
                                                                display: 'none',
                                                            },
                                                            'span.ms-ChoiceFieldLabel': {
                                                                paddingLeft: 0
                                                            },
                                                            'label.is-checked span.ms-ChoiceFieldLabel, label.is-checked:hover, label.is-checked span.ms-ChoiceFieldLabel:hover': {
                                                                fontWeight: 700,
                                                                color: this.props.themeVariant ? this.props.themeVariant.palette.themePrimary : '#005a9e'
                                                            },
                                                            'label span.ms-ChoiceFieldLabel, label span.ms-ChoiceFieldLabel:hover': {
                                                                color: this.props.themeVariant.isInverted ? '#fff' : this.props.themeVariant.semanticColors.bodyText
                                                            }
                                                        }
                                                    }
                                                }}
                                                defaultSelectedKey={this.props.operator} 
                                                options={[
                                                    {
                                                        key: FilterConditionOperator.AND,
                                                        text: commonStrings.Filters.AndOperator,
                                                        title: commonStrings.Filters.UseAndOperatorValues
                                                    },
                                                    {
                                                        key: null,
                                                        text: "/",
                                                        disabled: true
                                                    },
                                                    {
                                                        key: FilterConditionOperator.OR,
                                                        text: commonStrings.Filters.OrOperator,
                                                        title: commonStrings.Filters.UseOrOperatorValues
                                                    }
                                                ]} 
                                                onChange={(ev, option) => {
                                                    this.props.onFilterOperatorUpdated(option.key as FilterConditionOperator);
                                                }}
                                            />;

        return  <div className={styles.filterValueOperator}>
                    <Icon iconName="FilterSettings" title={commonStrings.Filters.UseValuesOperators}/>
                    {renderOperators}
                </div>;
    }
}

export class FilterValueOperatorWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }

    public async connectedCallback() {
 
       let props = this.resolveAttributes();
       const renderFilterValueOperator =    <FilterValueOperator {...props}
                                                onFilterOperatorUpdated={((operator: FilterConditionOperator) => {
        
                                                    // Bubble event through the DOM
                                                    this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_VALUE_OPERATOR_UPDATED, { 
                                                        detail: {                                       
                                                                filterName: props.filterName,
                                                                operator: operator,
                                                                instanceId: props.instanceId
                                                            }, 
                                                            bubbles: true,
                                                            cancelable: true
                                                        }));
                                            
                                                }).bind(this)}
                                            />;

       ReactDOM.render(renderFilterValueOperator, this);
    }    

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}