import * as React from 'react';
import ITemplateRendererProps from './ITemplateRendererProps';
import ITemplateRendererState from './ITemplateRendererState';
import './TemplateRenderer.scss';
import { isEqual } from "@microsoft/sp-lodash-subset";
import * as DOMPurify from 'dompurify';
import { DomPurifyHelper } from '../../helpers/DomPurifyHelper';


// Need a root class to do not conflict with PnP Modern Search Styles.
const rootCssClassName = "pnp-modern-search";
const TEMPLATE_ID_PREFIX = "pnp-template_";

export class TemplateRenderer extends React.Component<ITemplateRendererProps, ITemplateRendererState> {

    private _domPurify: any;

    constructor(props: ITemplateRendererProps) {
        super(props);
    
        this.state = {
            processedTemplate: null
        };

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            ADD_TAGS: ['style'],
            ADD_ATTR: ['onerror', 'target', 'loading'],
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|ms-\w+):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            WHOLE_DOCUMENT: true
        });

        this._domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        this._domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);        
    }

    public render() {

       
        if (this.state.processedTemplate) {
             // We need to set a key to force an update if Wthe template context changes
            return  <div className={rootCssClassName} dangerouslySetInnerHTML={{__html: this.state.processedTemplate }}></div>;
        } else {
            return null;
        }
    }

    public async componentDidMount() {
        await this.updateTemplate(this.props);
    }

    public async componentDidUpdate(prevProps: ITemplateRendererProps) {

        if (!isEqual(prevProps, this.props)) {
            await this.updateTemplate(this.props);
        }
    }

    private async updateTemplate(props: ITemplateRendererProps): Promise<void> {

        let templateContent = props.templateContent;

        // Process the Handlebars template
        let template = await this.props.templateService.processTemplate(props.templateContext, templateContent);

        if (template) {

            // Sanitize the template HTML
            template = template ? this._domPurify.sanitize(`${template}`) : template;
            const templateAsHtml = new DOMParser().parseFromString(template, "text/html");

            // Get <style> tags from Handlebars template content and prefix all CSS rules by the Web Part instance ID to isolate styles
            const styleElements = templateAsHtml.getElementsByTagName("style"); 
            let prefixedStyles: string[] = [];
            let i,j,k = 0;

            if (styleElements.length > 0) {

                // The prefix for all CSS selectors
                const elementPrefixId = `${TEMPLATE_ID_PREFIX}${this.props.instanceId}`;

                for (i = 0; i < styleElements.length; i++) {
                    const style = styleElements.item(i);
                    const sheet: any = style.sheet; 
                    if ((sheet as CSSStyleSheet).cssRules) {
                        const cssRules = (sheet as CSSStyleSheet).cssRules;
                        
                        for (j = 0; j < cssRules.length; j++) {
                            const cssRule: CSSRule = cssRules.item(j);
                            
                            // CSS Media rule
                            if ((cssRule as CSSMediaRule).media) {
                                const cssMediaRule = cssRule as CSSMediaRule;

                                let cssPrefixedMediaRules = '';
                                for (k= 0; k < cssMediaRule.cssRules.length; k++) {
                                    const cssRuleMedia = cssMediaRule.cssRules.item(k);
                                    cssPrefixedMediaRules += `#${elementPrefixId} ${cssRuleMedia.cssText}`;
                                }

                                prefixedStyles.push(`@media ${cssMediaRule.conditionText} { ${cssPrefixedMediaRules} }`);

                            } else {
                                prefixedStyles.push(`#${elementPrefixId} ${cssRule.cssText}`);
                            }
                        }
                    }

                    // Remove the element from DOM
                    style.remove(); 
                }
            }

            template = `<style>${prefixedStyles.join(' ')}</style><div id="${TEMPLATE_ID_PREFIX}${this.props.instanceId}">${templateAsHtml.body.innerHTML}</div>`;
        }
            
        this.setState({
            processedTemplate: template
        });
    }
}
