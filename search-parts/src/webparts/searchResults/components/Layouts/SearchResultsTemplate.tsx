import * as React from 'react';
import ISearchResultsTemplateProps from './ISearchResultsTemplateProps';
import ISearchResultsTemplateState from './ISearchResultsTemplateState';
import './SearchResultsTemplate.scss';
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
            ADD_ATTR: ['target', 'loading'],
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|ms-\w+):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            WHOLE_DOCUMENT: true
        });

        let customTags = [];
        // Allow custom elements (ex: my-component)
        this._domPurify.addHook('uponSanitizeElement', (node, data) => {
            if (node.nodeName && node.nodeName.match(/^\w+((-\w+)+)+$/)
                && !data.allowedTags[data.tagName]) {
                data.allowedTags[data.tagName] = true;                
                customTags.push(data.tagName.toLocaleUpperCase());
            }
        });

        /*
        Leaving this out to fix script injection - might reintroduce if needed to support non-data prefixed attributes
        // Allow all custom attributes on custom elements - except javascript ones
        this._domPurify.addHook('uponSanitizeAttribute', (attr, data) => {
            if (data && data.attrName && customTags.indexOf(attr.tagName) !== -1) {
                if(data.attrName.indexOf("on") == 0) return;
                data.allowedAttributes[data.attrName] = true;
            }
        });
        */
    }

    public render() {
        const objectNode: any = document.querySelector("object[data='about:blank']");
        if (objectNode) {
            objectNode.style.display = "none";
        }

        return <div key={JSON.stringify(this.props.templateContext)} dangerouslySetInnerHTML={{ __html: DOMPurify.default.sanitize(this.state.processedTemplate) }}></div>;
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
            template = this._domPurify.sanitize(template);
            const templateAsHtml = new DOMParser().parseFromString(template, "text/html");

            // Get <style> tags from Handlebars template content and prefix all CSS rules by the Web Part instance ID to isolate styles
            const styleElements = templateAsHtml.getElementsByTagName("style");
            let prefixedStyles: string[] = [];
            let i, j, k = 0;

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
                                for (k = 0; k < cssMediaRule.cssRules.length; k++) {
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
                    if (style.remove) {
                        style.remove();
                    } else if ((style as any).removeNode) {
                        //IE11
                        (style as any).removeNode();
                    }
                }
            }

            template = `<style>${prefixedStyles.join(' ')}</style><div id="${TEMPLATE_ID_PREFIX}${this.props.instanceId}">${templateAsHtml.body.innerHTML}</div>`;
        }

        this.setState({
            processedTemplate: template
        });
    }
}
