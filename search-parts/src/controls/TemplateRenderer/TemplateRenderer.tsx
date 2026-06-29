"use client";
import * as React from "react";
import ITemplateRendererProps from "./ITemplateRendererProps";
import ITemplateRendererState from "./ITemplateRendererState";
import "./TemplateRenderer.scss";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { ISearchResultsTemplateContext } from "../../models/common/ITemplateContext";
import { LayoutRenderType } from "@pnp/modern-search-extensibility";

// Need a root class to do not conflict with PnP Modern Search Styles.
const rootCssClassName = "pnp-modern-search";

export class TemplateRenderer extends React.Component<
    ITemplateRendererProps,
    ITemplateRendererState
> {
    private readonly _divTemplateRenderer: React.RefObject<HTMLDivElement>;
    private _isTemplateUpdateInProgress: boolean = false;
    private _hasPendingTemplateUpdate: boolean = false;
    private _lastRenderedTemplateContent: string = "";

    constructor(props: ITemplateRendererProps) {
        super(props);

        this.state = {};

        this.updateTemplate = this.updateTemplate.bind(this);

        // Create an instance of the div ref container
        this._divTemplateRenderer = React.createRef<HTMLDivElement>();
    }

    public render() {
        return <div className={rootCssClassName} ref={this._divTemplateRenderer} />;
    }

    private shouldUpdateTemplate(prevProps: ITemplateRendererProps, nextProps: ITemplateRendererProps): boolean {
        return (
            !isEqual(prevProps.templateContent, nextProps.templateContent) ||
            !isEqual(
                (prevProps.templateContext as ISearchResultsTemplateContext)
                    .inputQueryText,
                (nextProps.templateContext as ISearchResultsTemplateContext)
                    .inputQueryText
            ) ||
            !isEqual(
                (prevProps.templateContext as ISearchResultsTemplateContext).data,
                (nextProps.templateContext as ISearchResultsTemplateContext).data
            ) ||
            !isEqual(prevProps.templateContext.filters, nextProps.templateContext.filters) ||
            !isEqual(prevProps.templateContext.properties, nextProps.templateContext.properties) ||
            !isEqual(prevProps.templateContext.theme, nextProps.templateContext.theme) ||
            !isEqual(
                (prevProps.templateContext as ISearchResultsTemplateContext)
                    .selectedKeys,
                (nextProps.templateContext as ISearchResultsTemplateContext)
                    .selectedKeys
            )
        );
    }

    private async scheduleTemplateUpdate(props: ITemplateRendererProps): Promise<void> {
        if (this._isTemplateUpdateInProgress) {
            this._hasPendingTemplateUpdate = true;
            return;
        }

        this._isTemplateUpdateInProgress = true;

        let propsToRender: ITemplateRendererProps | null = props;

        try {
            while (propsToRender) {
                const renderedProps = propsToRender;
                await this.updateTemplate(renderedProps);

                if (this._hasPendingTemplateUpdate) {
                    this._hasPendingTemplateUpdate = false;

                    if (this.shouldUpdateTemplate(renderedProps, this.props)) {
                        propsToRender = this.props;
                    } else {
                        propsToRender = null;
                    }
                } else {
                    propsToRender = null;
                }
            }
        } finally {
            this._isTemplateUpdateInProgress = false;
        }
    }

    public componentDidMount() {
        this.scheduleTemplateUpdate(this.props).catch(() => undefined);
    }

    public componentDidUpdate(prevProps: ITemplateRendererProps) {
        if (this.shouldUpdateTemplate(prevProps, this.props)) {
            this.scheduleTemplateUpdate(this.props).catch(() => undefined);
        }
    }

    private async updateTemplate(props: ITemplateRendererProps): Promise<void> {
        // Process the Handlebars template
        let template = await this.props.templateService.processTemplate(
            props.templateContext,
            props.templateContent,
            props.renderType
        );

        if (
            props.renderType == LayoutRenderType.Handlebars &&
            typeof template === "string"
        ) {
            await this.renderHandlebarsTemplate(template, props);
        } else if (
            props.renderType == LayoutRenderType.AdaptiveCards &&
            template instanceof HTMLElement
        ) {
            this.renderAdaptiveCardTemplate(template);
        }
    }

    private async renderHandlebarsTemplate(template: string, props: ITemplateRendererProps): Promise<void> {
        if (template === this._lastRenderedTemplateContent) {
            return;
        }

        const originalTemplate = template;
        const sanitizedTemplate = this.props.templateService.sanitizeHtmlWithStylePreservation(originalTemplate);
        const restoredTemplate = this.restoreStrippedDataAttributes(originalTemplate, sanitizedTemplate);
        const useMicrosoftGraphToolkit = !!props.templateContext.properties.useMicrosoftGraphToolkit;
        const { templateRoot, styleElements } = await this.parseTemplate(restoredTemplate, useMicrosoftGraphToolkit);
        const allStyles = this.collectStyles(styleElements, props, useMicrosoftGraphToolkit);

        styleElements.forEach((style) => {
            style.remove();
        });

        this.renderTemplateContent(templateRoot, allStyles, useMicrosoftGraphToolkit);
        this._lastRenderedTemplateContent = originalTemplate;
    }

    private restoreStrippedDataAttributes(originalTemplate: string, sanitizedTemplate: string): string {
        if (originalTemplate.length <= sanitizedTemplate.length) {
            return sanitizedTemplate;
        }

        const dataAttributePattern = /data-[a-zA-Z][a-zA-Z0-9-]*="[^"]*"/g;
        const originalDataAttrs: string[] = originalTemplate.match(dataAttributePattern) ?? [];
        const sanitizedDataAttrs: string[] = sanitizedTemplate.match(dataAttributePattern) ?? [];
        const strippedAttrs = originalDataAttrs.filter(
            (attr) => !sanitizedDataAttrs.includes(attr)
        );

        if (strippedAttrs.length === 0) {
            return sanitizedTemplate;
        }

        let restoredTemplate = sanitizedTemplate;
        strippedAttrs.forEach((strippedAttr) => {
            const attrNameMatch = /^(data-[a-zA-Z][a-zA-Z0-9-]*)/.exec(strippedAttr);
            const attrName = attrNameMatch?.[1];

            if (!attrName || restoredTemplate.includes(strippedAttr)) {
                return;
            }

            const componentPatterns = [
                /<(pnp-[a-zA-Z][a-zA-Z0-9-]*)([^>]*?)>/g,
                /<([a-zA-Z][a-zA-Z0-9-]*-[a-zA-Z][a-zA-Z0-9-]*)([^>]*?)>/g,
            ];

            componentPatterns.forEach((pattern) => {
                restoredTemplate = this.restoreAttributeForPattern(restoredTemplate, strippedAttr, attrName, pattern);
            });
        });

        return restoredTemplate;
    }

    private restoreAttributeForPattern(template: string, strippedAttr: string, attrName: string, pattern: RegExp): string {
        const regex = new RegExp(pattern.source, pattern.flags);
        const matches: RegExpExecArray[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(template)) !== null) {
            matches.push(match);
        }

        return matches.reduce((updatedTemplate, componentMatch) => {
            const [fullTag, tagName, existingAttrs] = componentMatch;

            if (fullTag.includes(attrName)) {
                return updatedTemplate;
            }

            const newTag = `<${tagName}${existingAttrs} ${strippedAttr}>`;
            return updatedTemplate.replace(fullTag, newTag);
        }, template);
    }

    private async parseTemplate(template: string, useMicrosoftGraphToolkit: boolean): Promise<{
        templateRoot: Document | DocumentFragment;
        styleElements: HTMLStyleElement[];
    }> {
        if (useMicrosoftGraphToolkit) {
            const templateAsHtml = new DOMParser().parseFromString(template, "text/html");

            await this.props.templateService.replaceDisambiguatedMgtElementNames(templateAsHtml);

            return {
                templateRoot: templateAsHtml,
                styleElements: Array.from(templateAsHtml.getElementsByTagName("style")),
            };
        }

        const parsingRange = document.createRange();
        parsingRange.selectNodeContents(document.body);
        const parsedFragment = parsingRange.createContextualFragment(template);

        return {
            templateRoot: parsedFragment,
            styleElements: Array.from(parsedFragment.querySelectorAll("style")),
        };
    }

    private collectStyles(
        styleElements: HTMLStyleElement[],
        props: ITemplateRendererProps,
        useMicrosoftGraphToolkit: boolean
    ): string[] {
        const allStyles: string[] = [];

        if (styleElements.length === 0) {
            return allStyles;
        }

        const elementPrefixId = `${this.props.templateService.TEMPLATE_ID_PREFIX}${this.props.instanceId}`;

        for (const style of styleElements) {
            const cssscope = style.dataset.cssscope;

            if (cssscope === "layer") {
                allStyles.push(`@layer { ${style.innerText} }`);
            } else {
                allStyles.push(this.props.templateService.legacyStyleParser(style, elementPrefixId));
            }
        }

        if (
            useMicrosoftGraphToolkit &&
            props.templateService.MgtCustomElementHelper?.isDisambiguated
        ) {
            return allStyles.map((style) => (
                props.templateService as any
            ).applyDisambiguatedMgtPrefixIfNeeded(style));
        }

        return allStyles;
    }

    private renderTemplateContent(
        templateRoot: Document | DocumentFragment,
        allStyles: string[],
        useMicrosoftGraphToolkit: boolean
    ): void {
        const container = this._divTemplateRenderer.current;

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (allStyles.length > 0) {
            const styleEl = document.createElement("style");
            styleEl.textContent = allStyles.join(" ");
            container.appendChild(styleEl);
        }

        const contentDiv = document.createElement("div");
        contentDiv.id = `${this.props.templateService.TEMPLATE_ID_PREFIX}${this.props.instanceId}`;
        const contentFragment = document.createDocumentFragment();

        const sourceNode = useMicrosoftGraphToolkit
            ? (templateRoot as Document).body
            : (templateRoot as DocumentFragment);

        while (sourceNode.firstChild) {
            contentFragment.appendChild(sourceNode.firstChild);
        }

        contentDiv.appendChild(contentFragment);
        container.appendChild(contentDiv);
    }

    private renderAdaptiveCardTemplate(template: HTMLElement): void {
        const container = this._divTemplateRenderer.current;

        if (!container) {
            return;
        }

        container.innerHTML = "";
        container.appendChild(template);
        this._lastRenderedTemplateContent = "";
    }
}
