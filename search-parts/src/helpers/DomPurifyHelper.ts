import { Constants } from '../common/Constants';

export class DomPurifyHelper {

    private static _instance: any = null;

    /**
     * Gets the singleton DOMPurify instance with shared configuration
     */
    public static get instance(): any {
        if (!DomPurifyHelper._instance) {
            DomPurifyHelper._instance = require('dompurify');
            DomPurifyHelper.configureInstance();
        }
        return DomPurifyHelper._instance;
    }

    /**
     * Configures the DOMPurify instance with shared settings
     * Using WHOLE_DOCUMENT: false since we work with HTML fragments that get inserted into larger DOM
     */
    private static configureInstance(): void {
        DomPurifyHelper._instance.setConfig({
            ADD_TAGS: ['style', '#comment'],
            ADD_ATTR: ['target', 'loading', 'data-*'],
            ALLOW_DATA_ATTR: true,
            ALLOWED_URI_REGEXP: Constants.ALLOWED_URI_REGEXP,
            WHOLE_DOCUMENT: false,
            // Explicitly allow very long attribute values for configuration data
            SANITIZE_NAMED_PROPS: false,
            RETURN_DOM: false,
            RETURN_DOM_FRAGMENT: false,
            RETURN_DOM_IMPORT: false,
            // More permissive configuration to preserve custom attributes
            KEEP_CONTENT: true,
            SAFE_FOR_TEMPLATES: false,
        });

        DomPurifyHelper._instance.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        DomPurifyHelper._instance.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);
    }

    /**
     * Allows custom attributes
     * @param attr the attribute name
     * @param data the DOMPurify data
     */
    public static allowCustomAttributesHook(attr, data) {

        if(data && data.attrName) {
            if(data.attrName.indexOf("on") == 0) return;
            if(data.attrName == "href") return;
            
            data.allowedAttributes[data.attrName] = true;
            data.forceKeepAttr = true;
        }        
    }

    /**
     * Allows custom components (ex: <my-component>)
     * @param node the HTML node
     * @param data the DOMPurify data
     */
    public static allowCustomComponentsHook(node, data) {
        if(node.nodeName && node.nodeName.match(/^\w+(-\w+)+$/)
            && !data.allowedTags[data.tagName]) {            
            data.allowedTags[data.tagName] = true;
        }
    }

    /**
     * Sanitizes HTML while preserving style tags
     * @param html the HTML string to sanitize
     * @param config optional DOMPurify configuration
     * @returns sanitized HTML string with style tags preserved
     */
    public static sanitizeWithStyleTags(html: string, config?: any): string {
        if (!html) return html;
        
        // Extract style tags before sanitization
        const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        const styleTags: string[] = [];
        let match;
        
        while ((match = styleTagRegex.exec(html)) !== null) {
            styleTags.push(match[0]);
        }
        
        // Remove style tags from HTML for sanitization
        const htmlWithoutStyles = html.replace(styleTagRegex, '');
        
        // Sanitize the HTML without style tags
        const sanitizedHtml = DomPurifyHelper.instance.sanitize(htmlWithoutStyles, config);
        
        // Add back the style tags at the end
        if (styleTags.length > 0) {
            return sanitizedHtml + '\n' + styleTags.join('\n');
        }
        
        return sanitizedHtml;
    }

    
}