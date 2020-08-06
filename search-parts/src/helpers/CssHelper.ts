export class CssHelper {
    
    public static DEFAULT_STYLE_TAG = "<style></style>";

    /**
     * Converts input text into a valid css classname
     * @param text the string we want to convert into a valid classname
     */
    public static convertToClassName(text:string) : string {
    
        // Credit to: https://gist.github.com/dbowling/2589645
        return text 
                ? text
                    .replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '')
                    .replace(/＆/g,'')
                    .replace(/[\W]/g, '-')
                    .replace(/-+/g,'-')
                    .toLowerCase()
                : "";

    }

    /**
     * Appends a prefix to a css classname and ensures the className is valid CSS
     * @param prefix the prefix to append to the class name
     * @param className the text we want to convert into a valid css class
     */
    public static prefixAndValidateClassName(prefix:string,className:string) : string {
        return this.convertToClassName(prefix + "-" + className);
    }

    /**
     * Get <style> tags from html document and prefix all CSS rules by the Web Part instance ID to isolate styles
     * @param templateAsHtml the html template we want to prefix
     * @param templateIdPrefix the prefix to add to the element
     */
    public static prefixStyleElements(templateAsHtml: Document, templateIdPrefix: string, stripHtml:boolean = false) : string {
        
        const styleElements = templateAsHtml.getElementsByTagName("style");
        let prefixedStyles: string[] = [];
        let i, j, k = 0;

        if (styleElements.length > 0) {

            // The prefix for all CSS selectors
            const elementPrefixId = `${templateIdPrefix}`;

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

        return stripHtml === true
                ? `<style>${prefixedStyles.join(' ')}</style>`
                : `<style>${prefixedStyles.join(' ')}</style><div id="${templateIdPrefix}">${templateAsHtml.body.innerHTML}</div>`;

    }

}