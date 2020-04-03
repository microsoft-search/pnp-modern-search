import * as React from                                                 'react';
import ISearchResultsTemplateProps from './ISearchResultsTemplateProps';
import ISearchResultsTemplateState from './ISearchResultsTemplateState';
import                                  './SearchResultsTemplate.scss';
import { TemplateService } from '../../../../services/TemplateService/TemplateService';
import * as DOMPurify from 'dompurify';

const TEMPLATE_ID_PREFIX = 'pnp-modern-search-template_';

export default class SearchResultsTemplate extends React.Component<ISearchResultsTemplateProps, ISearchResultsTemplateState> {

    private _domPurify: any;

    constructor(props: ISearchResultsTemplateProps) {
        super(props);
    
        this.state = {
            processedTemplate: null
        };

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            ADD_TAGS: ['style'],
            ADD_ATTR: ['onerror'],
            WHOLE_DOCUMENT: true
        });

        // Allow custom elements (ex: my-component)
        this._domPurify.addHook('uponSanitizeElement', (node, data) =>{
            if(node.nodeName && node.nodeName.match(/^\w+((-\w+)+)+$/)
                && !data.allowedTags[data.tagName]) {
                data.allowedTags[data.tagName] = true;
            }
        });
    }

    public render() {
        const objectNode: any = document.querySelector("object[data='about:blank']");
        if (objectNode) {
            objectNode.style.display = "none";
        }

        return <div key={JSON.stringify(this.props.templateContext)} dangerouslySetInnerHTML={{ __html: this.state.processedTemplate }}></div>;
    }

    public componentDidMount() {
        this._updateTemplate(this.props);
    }

    public componentDidUpdate() {
        // Post render operations (previews on elements, etc.)
        TemplateService.initPreviewElements();  
    }

    public UNSAFE_componentWillReceiveProps(nextProps: ISearchResultsTemplateProps) {
        this._updateTemplate(nextProps);
    }

    private async _updateTemplate(props: ISearchResultsTemplateProps): Promise<void> {

        let templateContent = props.templateContent;

        // Process the Handlebars template
        let template = await this.props.templateService.processTemplate(props.templateContext, templateContent);

        if (template) {

            // Sanitize the template HTML
            template = template ? this._domPurify.sanitize(`${template}`) : template;
            const templateAsHtml = new DOMParser().parseFromString(template, "text/html");

            // Get <style> tags from Handlebars template content and prefix all CSS rules by the Web Part instance ID to isolate styles
            const styles = templateAsHtml.getElementsByTagName("style"); 
            let prefixedStyles = '';
            let i,j = 0;

            if (styles.length > 0) {
                for (i = 0; i < styles.length; i++) {
                    const style = styles[i];
                    const sheet: any = style.sheet; 
                    if ((sheet as CSSStyleSheet).cssRules) {
                        const cssRules = (sheet as CSSStyleSheet).cssRules;
                        
                        for (j = 0; j < cssRules.length; j++) {
                            const rule = cssRules.item(j);

                            const elementPrefixId = `${TEMPLATE_ID_PREFIX}${this.props.instanceId}`;

                            // Check if the cssText already contains an instanceId restriction (for instance using #aequos_template{{@root.instanceId}} in the template). In this case, we dont prefix the CSS rule.
                            if (rule.cssText.indexOf(elementPrefixId) === -1) {
                                prefixedStyles += `#${elementPrefixId} ${rule.cssText}`;
                            } else {
                                prefixedStyles += rule.cssText;
                            }
                        }
                    }
                }
            }

            template = `<style>${prefixedStyles.trim()}</style><div id="${TEMPLATE_ID_PREFIX}${this.props.instanceId}">${templateAsHtml.body.innerHTML}</div>`;
        }

        this.setState({
            processedTemplate: template
        });
    }
}
