import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from '../models/BaseWebComponent';

export interface IObjectParam {
    myProperty: string;
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
}

export class CustomComponent extends React.Component<ICustomComponentProps, ICustomComponenState> {
    
    public render() {

        let myObject: IObjectParam = {
            myProperty: undefined
        };
        
        // Parse custom object
        try {
            myObject = JSON.parse(this.props.myObjectParam);
        } catch (error) {
            myObject.myProperty = null;
        }

        return <div>{this.props.myStringParam} {myObject.myProperty}</div>;
    }
}

export class MyCustomComponentWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
 
       let props = this.resolveAttributes();
       const debugView = <CustomComponent {...props}/>;
       ReactDOM.render(debugView, this);
    }    
}