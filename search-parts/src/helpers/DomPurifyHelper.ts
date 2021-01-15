export class DomPurifyHelper {

    /**
     * Allows custom attributes
     * @param attr the attribute name
     * @param data the DOMPurify data
     */
    public static allowCustomAttributesHook(attr, data) {

        if(data && data.attrName) {
            data.allowedAttributes[data.attrName] = true;
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