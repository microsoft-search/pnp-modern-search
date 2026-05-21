import * as ReactDOM from 'react-dom';

/**
 * Converts a kebab-case string to camelCase.
 * Replaces @microsoft/sp-lodash-subset dependency.
 */
function camelCase(str: string): string {
    return str.replace(/-([a-z])/g, function (_match: string, letter: string) { return letter.toUpperCase(); });
}

export abstract class BaseWebComponent extends HTMLElement {

    // Properties set by the  internal TemplateService via prototype at runtime

    /**
     * The root shared service scope for all Web Part instances on the page. Use this scope to consume common services (ex: SPHttpClient, HttpClient , etc.) 
     */
    public _serviceScope: any;

    /**
     * INTERNAL USE ONLY. Array of service scopes of Web Part IDs who registered this web component. Use this array to look up correct service scope for a specific Web Part instance ID.
     */
    public _webPartServiceScopes: Map<string, any>;

    /**
     * INTERNAL USE ONLY. Array of service keys of Web Part IDs who registered this web component. Use this array to look up correct service keys context for a specific Web Part instance ID.
     */
    public _webPartServiceKeys: Map<string, { [key: string]: any }>;

    /**
     * INTERNAL USE ONLY. For custom web component use `_serviceScope` property and the `DateHelper` service (ex: `this._serviceScope.consume<DateHelper>(DateHelper.ServiceKey)`)
     */
    public _dayjs: any;

    protected abstract connectedCallback(): void;

    protected disconnectedCallback() {
        // eslint-disable-next-line @rushstack/pair-react-dom-render-unmount -- render is called in subclass connectedCallback implementations
        ReactDOM.unmountComponentAtNode(this);
    }

    /**
     * Transforms web component attributes to camel case properties to pass in React components
     * (ex: a 'preview-image' HTML attribute becomes 'previewImage' prop, etc.)
     * @returns the properties with formatted names 
     */
    protected resolveAttributes(): { [key: string]: any } {

        const props = {} as any;

        for (let i = 0; i < this.attributes.length; i++) {

            if (this.attributes.item(i)) {

                const value = this.attributes.item(i).value;
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

                                // Return the original value as string.
                                // Date-like strings are intentionally kept as
                                // strings so they are safe to render as React
                                // children. Components that need a Date object
                                // can parse the ISO string themselves.
                                props[camelCase(attr)] = value;
                            }
                        }
                    }
                }
            }
        }

        // Theme variant is now set explicitly by the host via the data-theme-variant attribute.
        // No automatic ThemeProvider consumption needed.

        return props;
    }
}