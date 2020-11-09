import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';

export interface IObjectParam {
    myProperty: string;
}

export interface ICustomComponentProps {

    /**
     * A sample string param
     */
    myStringParam?: string;

    /**
     * A sample object param
     */
    myObjectParam?: IObjectParam;

    /**
     * A sample date param
     */
    myDateParam?: Date;

    /**
     * A sample number param
     */
    myNumberParam?: number;

    /**
     * A sample boolean param
     */
    myBooleanParam?: boolean;
}

export interface ICustomComponenState {
}

export class CustomComponent extends React.Component<ICustomComponentProps, ICustomComponenState> {
    
    public render() {

        // Parse custom object
        const myObject: IObjectParam = this.props.myObjectParam;

        return  <div>
                    {this.props.myStringParam} {myObject.myProperty}
                </div>;
    }
}

export class MyCustomComponentWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
 
       let props = this.resolveAttributes();
       const customComponent = <CustomComponent {...props}/>;
       ReactDOM.render(customComponent, this);
    }    
}