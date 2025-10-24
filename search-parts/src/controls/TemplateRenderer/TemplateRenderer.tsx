"use client";
import * as React from "react";
import ITemplateRendererProps from "./ITemplateRendererProps";
import ITemplateRendererState from "./ITemplateRendererState";
import "./TemplateRenderer.scss";
import { isEqual } from "@microsoft/sp-lodash-subset";
import { DomPurifyHelper } from "../../helpers/DomPurifyHelper";
import { ISearchResultsTemplateContext } from "../../models/common/ITemplateContext";
import { LayoutRenderType } from "@pnp/modern-search-extensibility";

// Need a root class to do not conflict with PnP Modern Search Styles.
const rootCssClassName = "pnp-modern-search";

export class TemplateRenderer extends React.Component<
  ITemplateRendererProps,
  ITemplateRendererState
> {
  private _divTemplateRenderer: React.RefObject<HTMLDivElement>;

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

  public async componentDidMount() {
    await this.updateTemplate(this.props);
  }

  public async componentDidUpdate(prevProps: ITemplateRendererProps) {
    if (
      !isEqual(prevProps.templateContent, this.props.templateContent) ||
      !isEqual(
        (prevProps.templateContext as ISearchResultsTemplateContext)
          .inputQueryText,
        (this.props.templateContext as ISearchResultsTemplateContext)
          .inputQueryText
      ) ||
      !isEqual(
        (prevProps.templateContext as ISearchResultsTemplateContext).data,
        (this.props.templateContext as ISearchResultsTemplateContext).data
      ) ||
      !isEqual(
        prevProps.templateContext.filters,
        this.props.templateContext.filters
      ) ||
      !isEqual(
        prevProps.templateContext.properties,
        this.props.templateContext.properties
      ) ||
      !isEqual(
        prevProps.templateContext.theme,
        this.props.templateContext.theme
      ) ||
      !isEqual(
        (prevProps.templateContext as ISearchResultsTemplateContext)
          .selectedKeys,
        (this.props.templateContext as ISearchResultsTemplateContext)
          .selectedKeys
      )
    ) {
      await this.updateTemplate(this.props);
    }
  }

  private async updateTemplate(props: ITemplateRendererProps): Promise<void> {
    let templateContent = props.templateContent;

    // Process the Handlebars template
    let template = await this.props.templateService.processTemplate(
      props.templateContext,
      templateContent,
      props.renderType
    );

    if (
      props.renderType == LayoutRenderType.Handlebars &&
      typeof template === "string"
    ) {
      const originalTemplate = template as string;

      // Sanitize with style preservation (DomPurify 3.x strips <style> tags in fragment mode)
      template = this.props.templateService.sanitizeHtmlWithStylePreservation(originalTemplate);
      const sanitizedTemplate = template as string;

      // Post-process: Detect and restore any stripped data-* attributes
      // Only proceed if sanitization actually removed some content
      if (originalTemplate.length > sanitizedTemplate.length) {
        // Extract all data-* attributes from the original template
        const dataAttributePattern = /data-[a-zA-Z][a-zA-Z0-9-]*="[^"]*"/g;
        const originalDataAttrs =
          originalTemplate.match(dataAttributePattern) || [];
        const sanitizedDataAttrs =
          sanitizedTemplate.match(dataAttributePattern) || [];

        // Find attributes that were stripped during sanitization
        const strippedAttrs = originalDataAttrs.filter(
          (attr) =>
            !sanitizedDataAttrs.some((sanitizedAttr) => sanitizedAttr === attr)
        );

        if (strippedAttrs.length > 0) {
          let restoredTemplate = sanitizedTemplate;

          // For each stripped attribute, try to restore it to common web component patterns
          strippedAttrs.forEach((strippedAttr) => {
            const attrName = strippedAttr.match(
              /^(data-[a-zA-Z][a-zA-Z0-9-]*)/
            )?.[1];
            if (!attrName || restoredTemplate.includes(strippedAttr)) return;

            // Common web component patterns that might use data attributes
            const componentPatterns = [
              /<(pnp-[a-zA-Z][a-zA-Z0-9-]*)([^>]*?)>/g,
              /<([a-zA-Z][a-zA-Z0-9-]*-[a-zA-Z][a-zA-Z0-9-]*)([^>]*?)>/g, // Generic web components with dashes
            ];

            componentPatterns.forEach((pattern) => {
              const regex = new RegExp(pattern.source, pattern.flags);
              let match;

              // Use a manual loop instead of matchAll for better compatibility
              const matches = [];
              while ((match = regex.exec(restoredTemplate)) !== null) {
                matches.push(match);
              }

              matches.forEach((componentMatch) => {
                const fullTag = componentMatch[0];
                const tagName = componentMatch[1];
                const existingAttrs = componentMatch[2];

                // Only add if this tag doesn't already have the attribute
                if (!fullTag.includes(attrName)) {
                  const newTag = `<${tagName}${existingAttrs} ${strippedAttr}>`;
                  restoredTemplate = restoredTemplate.replace(fullTag, newTag);
                }
              });
            });
          });

          template = restoredTemplate;
        }
      }

      const templateAsHtml = new DOMParser().parseFromString(
        template as string,
        "text/html"
      );

      if (props.templateContext.properties.useMicrosoftGraphToolkit) {
        await this.props.templateService.replaceDisambiguatedMgtElementNames(
          templateAsHtml
        );
      }

      // Get <style> tags from Handlebars template content and prefix all CSS rules by the Web Part instance ID to isolate styles
      const styleElements = templateAsHtml.getElementsByTagName("style");
      const allStyles = [];

      if (styleElements.length > 0) {
        // The prefix for all CSS selectors
        const elementPrefixId = `${this.props.templateService.TEMPLATE_ID_PREFIX}${this.props.instanceId}`;

        for (let i = 0; i < styleElements.length; i++) {
          const style = styleElements.item(i);

          let cssscope = style.dataset.cssscope as string;

          if (cssscope !== undefined && cssscope === "layer") {
            allStyles.push(`@layer { ${style.innerText} }`);
          } else {
            allStyles.push(
              this.props.templateService.legacyStyleParser(
                style,
                elementPrefixId
              )
            );
          }
        }
      }

      if (
        this.props.templateContext.properties.useMicrosoftGraphToolkit &&
        this.props.templateService.MgtCustomElementHelper?.isDisambiguated
      ) {
        allStyles.forEach((style, index) => {
          allStyles[index] = (
            this.props.templateService as any
          ).applyDisambiguatedMgtPrefixIfNeeded(style);
        });
      }

      if (!this._divTemplateRenderer?.current) {
        return;
      }
      this._divTemplateRenderer.current.innerHTML = `<style>${allStyles.join(
        " "
      )}</style><div id="${this.props.templateService.TEMPLATE_ID_PREFIX}${
        this.props.instanceId
      }">${templateAsHtml.body.innerHTML}</div>`;
    } else if (
      props.renderType == LayoutRenderType.AdaptiveCards &&
      template instanceof HTMLElement
    ) {
      if (!this._divTemplateRenderer?.current) {
        return;
      }
      this._divTemplateRenderer.current.innerHTML = "";
      this._divTemplateRenderer.current.appendChild(template as HTMLElement);
    }
  }
}
