import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from '../models/BaseWebComponent';

import {Providers, SharePointProvider} from '@microsoft/mgt';
import { WebPartContext } from '@microsoft/sp-webpart-base';

declare global {
  namespace JSX {
      interface IntrinsicElements {
          'mgt-person': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      }
  }
}

export interface IObjectParam {
    [key: string]: string;
}

export interface IGraphPersonaComponentProps {
    webpartContext: WebPartContext;
    myStringParam?: string;
    myObjectParam?: string;
}

export interface IGraphPersonaComponentState {

}

export class GraphPersonaComponent extends React.Component<IGraphPersonaComponentProps, IGraphPersonaComponentState> {

    constructor(props: IGraphPersonaComponentProps) {
        super(props);

        Providers.globalProvider = new SharePointProvider(this.props.webpartContext);
    }

    public render() {
        let myObject: IObjectParam = {};

        // Parse custom object
        try {
            myObject = JSON.parse(this.props.myObjectParam);
        } catch (error) {
            console.log("GraphPersonaComponent_Error", error);
            return <div>Unable to load User data</div>;
        }

        // AccountName from Search property looks like: i:0#.f|membership|sstark@sambori.onmicrosoft.com
        const accountName: string = myObject.AccountName.split('|')[2];

        return (
          <mgt-person user-id={accountName} show-name show-email person-card="hover"></mgt-person>
        );
    }
}

export class GraphPersonaComponentWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

       let props = this.resolveAttributes();

       // You can use this._ctx here to access current Web Part context
       const customComponent = <GraphPersonaComponent webpartContext={this._ctx} {...props}/>;
       ReactDOM.render(customComponent, this);
    }
}
