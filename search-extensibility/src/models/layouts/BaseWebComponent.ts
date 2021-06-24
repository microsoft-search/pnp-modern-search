import * as ReactDOM from 'react-dom';
import { camelCase } from '@microsoft/sp-lodash-subset';
import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements/custom-elements.min';
import { ThemeProvider } from '@microsoft/sp-component-base';
import { ServiceScope, ServiceKey } from '@microsoft/sp-core-library';

export abstract class BaseWebComponent extends HTMLElement {

    // Properties set by the  internal TemplateService via prototype at runtime

    /**
     * The root shared service scope for all Web Part instances on the page. Use this scope to consume common services (ex: SPHttpClient, HttpClient , etc.) 
     */
    public _serviceScope: ServiceScope;

    /**
     * INTERNAL USE ONLY. Array of service scopes of Web Part IDs who registered this web component. Use this array to look up correct service scope for a specific Web Part instance ID.
     */
    public _webPartServiceScopes: Map<string, ServiceScope>;

    /**
     * INTERNAL USE ONLY. Array of service keys of Web Part IDs who registered this web component. Use this array to look up correct service keys context for a specific Web Part instance ID.
     */
    public _webPartServiceKeys: Map<string, {[key:string]: ServiceKey<any>}>;

    /**
     * INTERNAL USE ONLY. For custom web component use `_serviceScope` property and the `DateHelper` service (ex: `this._serviceScope.consume<DateHelper>(DateHelper.ServiceKey)`)
     */
    public _moment: any;

    protected abstract connectedCallback(): void;
        
    protected disconnectedCallback() {
        ReactDOM.unmountComponentAtNode(this);
    }
    
    /**
     * Transforms web component attributes to camel case properties to pass in React components
     * (ex: a 'preview-image' HTML attribute becomes 'previewImage' prop, etc.)
     * @returns the properties with formatted names 
     */
    protected resolveAttributes(): { [key:string] : any } {
        
        let props = {} as any;

        for (let i =0;i < this.attributes.length;i++) {

            if (this.attributes.item(i)) {

                let value = this.attributes.item(i).value; 
                let attr = this.attributes.item(i).name;

                // Resolve 'data-*' attribute name
                const matches = attr.match(/data-(.+)/);
                if (matches && matches.length === 2) {
                    attr = matches[1];
                }

                // If the value is not empty
                if (value) {

                    // Booleans
                    if (/^(true|false)$/.test(value)) {
                        props[camelCase(attr)] = (value === 'true');
                    } else {

                        // Check if the expression is not between quotes (ex: SharePoint refinement tokens). This kind of expression is a valid JSON object for JSON.parse().
                        if (/^(?:'|").*(?:'|")$/.test(value)) {
                            props[camelCase(attr)] = value; // No modification, pass the parameter as a regular string
                        } else {
                            // Objects
                            try {
                                props[camelCase(attr)] = JSON.parse(value);                            
                            } catch (error) {

                                // Date
                                if (this._moment && this._moment(value, this._moment.ISO_8601, true).isValid()) {
                                    props[camelCase(attr)] = new Date(Date.parse(value));
                                } else {
                                    // Return the original value as string
                                    props[camelCase(attr)] = value;
                                }
                            }
                        }    
                    }
                }
            }         
        }

        // Added theme variant to be available in components
        // Be careful: the theme variant will be the one of the last registered Web Part on the page (because serviceScope is set using prototype and called every time a Web part is rendered) 
        // The theme variant may not correspond to the actual Web Part section theme
        // We set this property as a fallback if the web component does not set the data-theme-variant attribute.
        if (this._serviceScope && !props.themeVariant) {
            const themeProvider = this._serviceScope.consume(ThemeProvider.serviceKey);
            const themeVariant = themeProvider.tryGetTheme();
            props.themeVariant = themeVariant;
        }
         
        return props;
    }
}