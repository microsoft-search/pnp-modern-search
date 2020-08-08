import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from 'search-extensibility';
import { ExampleComponent } from './components/ExampleComponent';

export default class ExampleWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
        
       let props = this.resolveAttributes();

       // You can use this._ctx here to access current Web Part context
       const exampleComponent = React.createElement(ExampleComponent, { 
                                            innerHtml: this.allAttributes.innerHtml, 
                                            ...props 
                                });

       ReactDOM.render(exampleComponent, this);

    }  

}