import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from '../models/BaseWebComponent';
import { Panel, PanelType, ActionButton } from "office-ui-fabric-react";

export interface IObjectParam {
    [key: string]: string;
}

export interface ICustomComponentProps {

    /**
     * A dummy string param
     */
    myStringParam?: string;

    /***
     * 
     */
    myObjectParam?: string;
}

export interface ICustomComponenState {
    showPanel: boolean;
}

export class CustomComponent extends React.Component<ICustomComponentProps, ICustomComponenState> {
    
    constructor(props: ICustomComponentProps) {
        super(props);
        this.state = {
            showPanel: false
        };
    }

    public render() {

        let myObject: IObjectParam = {};
        
        // Parse custom object
        try {
            myObject = JSON.parse(this.props.myObjectParam);
        } catch (error) {
            myObject = {};
        }

        return <div>
            <ActionButton iconProps={ { iconName: 'TextDocument'}} text="Show properties (from custom component)" onClick={() => {
                this.setState({
                    showPanel: true
                });
            }} />
            <Panel
                headerText={`Item properties for '${this.props.myStringParam}'`}
                isOpen={this.state.showPanel}
                type={PanelType.medium}
                isLightDismiss={true}
                onDismiss={() => {
                    this.setState({
                        showPanel: false
                    });
                }}
                closeButtonAriaLabel="Close"
            >
                <div>
                    {Object.keys(myObject).map((key, i) => {
                        return  <div key={i}>
                                    <strong>{key}</strong>: <span>{myObject[key]}</span>
                                </div>;
                    })}
                </div>
            </Panel>
        </div>;
    }
}

export class MyCustomComponentWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
        
       let props = this.resolveAttributes();

       // You can use this._ctx here to access current Web Part context
       const customComponent = <CustomComponent {...props}/>;
       ReactDOM.render(customComponent, this);
    }    
}