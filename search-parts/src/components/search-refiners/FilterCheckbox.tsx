import * as React from 'react';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { BaseWebComponent, IRefinementValue, RefinementOperator } from 'search-extensibility';
import * as ReactDOM from 'react-dom';

export interface IFilterCheckboxProps {
    name: string;
    token: string;
    value: string;
    count: number;
    isSelected: boolean;
    disabled?:boolean;
    className?:string;
    isMultiValue?:boolean;
    onFilterChanged: (filter: IRefinementValue, selected: boolean, isMultiValue: boolean) => void;
}

export interface IFilterCheckboxState {
    checked:boolean;
}

export class FilterCheckboxComponent extends React.Component<IFilterCheckboxProps, IFilterCheckboxState> {

    constructor(props: IFilterCheckboxProps){
        super(props);
        this.state = {
            checked : this.props.isSelected
        };
    }

    public render() {
        return <Checkbox 
                    className={this.props.className} 
                    onChange={this._changed.bind(this)} 
                    defaultChecked={this.state.checked} 
                    label={this.props.value + " (" + this.props.count + ")"} 
                    disabled={this.props.disabled}>
                </Checkbox>;
    }

    private _changed(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, 
            checked?: boolean) : void {

        this.setState({ checked: checked });

        this.props.onFilterChanged({
            RefinementCount: this.props.count,
            RefinementName: this.props.name,
            RefinementToken: this.props.token,
            RefinementValue: this.props.value
        }, checked, this.props.isMultiValue);
    
    }

    
}

export class FilterCheckboxWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public connectedCallback() {
       let props :any = this.resolveAttributes();
       const filterComponent = <FilterCheckboxComponent {...props} onFilterChanged={this._onFilterChanged.bind(this)}/>;
       ReactDOM.render(filterComponent, this);
    }

    private _onFilterChanged(filter: IRefinementValue, selected: boolean, isMultiValue: boolean) : void {
        
        const operator : RefinementOperator = isMultiValue ? RefinementOperator.OR : RefinementOperator.AND;
        const eventName : string = selected ? "addFilter" : "removeFilter";

        this.dispatchEvent(new CustomEvent(eventName, { 
            detail: {
                refiner: filter,
                operator: operator
            }, 
            bubbles: true,
            cancelable: true
        }));
        
    }
 }