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
     */
    private static configureInstance(): void {
        DomPurifyHelper._instance.setConfig({
            ADD_TAGS: ['style','#comment'],
            ADD_ATTR: ['target', 'loading'],
            ALLOW_DATA_ATTR: true,
            ALLOWED_URI_REGEXP: Constants.ALLOWED_URI_REGEXP,
            WHOLE_DOCUMENT: true,
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
}