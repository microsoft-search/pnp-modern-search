import * as React from 'react';
import ITemplateRendererProps from './ITemplateRendererProps';
import ITemplateRendererState from './ITemplateRendererState';
import './TemplateRenderer.scss';
import { isEqual } from "@microsoft/sp-lodash-subset";
import * as DOMPurify from 'dompurify';
import { DomPurifyHelper } from '../../helpers/DomPurifyHelper';
import { TestConstants } from '../../common/Constants';
import { ISearchResultsTemplateContext } from '../../models/common/ITemplateContext';

import { LayoutRenderType } from '@pnp/modern-search-extensibility';

// Need a root class to do not conflict with PnP Modern Search Styles.
const rootCssClassName = "pnp-modern-search";
const TEMPLATE_ID_PREFIX = "pnp-template_";

export class TemplateRenderer extends React.Component<ITemplateRendererProps, ITemplateRendererState> {

    private _domPurify: any;
    private _divTemplateRenderer: React.RefObject<HTMLDivElement>;

    constructor(props: ITemplateRendererProps) {
        super(props);

        this.state = {
        };

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            ADD_TAGS: ['style','#comment'],
            ADD_ATTR: ['target', 'loading'],
            ALLOW_DATA_ATTR: true,
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|file|tel|callto|cid|xmpp|xxx|ms-\w+):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            WHOLE_DOCUMENT: true,
        });

        this._domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        this._domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);

        // Create an instance of the div ref container 
        this._divTemplateRenderer = React.createRef<HTMLDivElement>();
    }

    public render() {
        return <div className={rootCssClassName} ref={this._divTemplateRenderer} />;
    }

    public async componentDidMount() {
        await this.updateTemplate(this.props);
    }

    public async componentDidUpdate(prevProps: ITemplateRendererProps) {

        if (!isEqual(prevProps.templateContent, this.props.templateContent) ||
            !isEqual((prevProps.templateContext as ISearchResultsTemplateContext).inputQueryText, (this.props.templateContext as ISearchResultsTemplateContext).inputQueryText) ||
            !isEqual((prevProps.templateContext as ISearchResultsTemplateContext).data, (this.props.templateContext as ISearchResultsTemplateContext).data) ||
            !isEqual(prevProps.templateContext.filters, this.props.templateContext.filters) ||
            !isEqual(prevProps.templateContext.properties, this.props.templateContext.properties) ||
            !isEqual(prevProps.templateContext.theme, this.props.templateContext.theme) ||
            !isEqual((prevProps.templateContext as ISearchResultsTemplateContext).selectedKeys, (this.props.templateContext as ISearchResultsTemplateContext).selectedKeys)) {

            await this.updateTemplate(this.props);
        }
    }

    private legacyStyleParser(style: HTMLStyleElement, elementPrefixId: string): string {

        let prefixedStyles: string[] = [];

        const sheet: any = style.sheet;

        if ((sheet as CSSStyleSheet).cssRules) {
            const cssRules = (sheet as CSSStyleSheet).cssRules;

            for (let j = 0; j < cssRules.length; j++) {
                const cssRule: CSSRule = cssRules.item(j);

                // CSS Media rule
                if ((cssRule as CSSMediaRule).media) {
                    const cssMediaRule = cssRule as CSSMediaRule;

                    let cssPrefixedMediaRules = '';
                    for (let k = 0; k < cssMediaRule.cssRules.length; k++) {
                        const cssRuleMedia = cssMediaRule.cssRules.item(k);
                        cssPrefixedMediaRules += `#${elementPrefixId} ${cssRuleMedia.cssText}`;
                    }

                    prefixedStyles.push(`@media ${cssMediaRule.conditionText} { ${cssPrefixedMediaRules} }`);

                } else {
                    if (cssRule.cssText.indexOf(TestConstants.SearchResultsErrorMessage) !== -1) {
                        // Special handling for error message as it's outside the template container to allow user override
                        prefixedStyles.push(`${cssRule.cssText}`);
                    } else {
                        prefixedStyles.push(`#${elementPrefixId} ${cssRule.cssText}`);
                    }
                }
            }
        }

        return prefixedStyles.join(' ');

    }

    private async updateTemplate(props: ITemplateRendererProps): Promise<void> {
        let templateContent = props.templateContent;

        // Process the Handlebars template
        let template = await this.props.templateService.processTemplate(props.templateContext, templateContent, props.renderType);

        if (props.renderType == LayoutRenderType.Handlebars && typeof template === 'string') {

            // Sanitize the template HTML
            template = template ? this._domPurify.sanitize(`${template}`) : template;
            const templateAsHtml = new DOMParser().parseFromString(template as string, "text/html");

            // Get <style> tags from Handlebars template content and prefix all CSS rules by the Web Part instance ID to isolate styles
            const styleElements = templateAsHtml.getElementsByTagName("style");
            // let styles: string[] = [];
            // debugger;
            const allStyles = [];

            if (styleElements.length > 0) {

                // The prefix for all CSS selectors
                const elementPrefixId = `${TEMPLATE_ID_PREFIX}${this.props.instanceId}`;


                for (let i = 0; i < styleElements.length; i++) {
                    const style = styleElements.item(i);

                    let cssscope = style.dataset.cssscope as string;

                    if (cssscope !== undefined && cssscope === "layer") {

                        allStyles.push(`@layer { ${style.innerText} }`);

                    } else {

                        allStyles.push(this.legacyStyleParser(style, elementPrefixId));

                    }
                }

            }

            this._divTemplateRenderer.current.innerHTML = `<style>${allStyles.join(' ')}</style><div id="${TEMPLATE_ID_PREFIX}${this.props.instanceId}">${templateAsHtml.body.innerHTML}</div>`

        } else if (props.renderType == LayoutRenderType.AdaptiveCards && template instanceof HTMLElement) {

            this._divTemplateRenderer.current.innerHTML = "";
            this._divTemplateRenderer.current.appendChild(template as HTMLElement);
        }
    }
}
