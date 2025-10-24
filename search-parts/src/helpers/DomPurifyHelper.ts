import { Constants } from "../common/Constants";

export class DomPurifyHelper {
  private static _instance: any = null;
  private static _config: any = null;

  /**
   * Gets the singleton DOMPurify instance with shared configuration
   */
  public static get instance(): any {
    if (!DomPurifyHelper._instance) {
      DomPurifyHelper._instance = require("dompurify");
      DomPurifyHelper.configureInstance();
    }
    return DomPurifyHelper._instance;
  }

  /**
   * Gets the shared DOMPurify configuration
   */
  private static getConfig(): any {
    if (!DomPurifyHelper._config) {
      DomPurifyHelper._config = {
        ADD_TAGS: ["style", "#comment", "link", "content"],
        ADD_ATTR: ["target", "loading", "data-fields-configuration", "data-*"],
        ALLOW_DATA_ATTR: true,
        ALLOWED_URI_REGEXP: Constants.ALLOWED_URI_REGEXP,
        // CRITICAL: Must be false for fragments, but we handle <style> via hook
        WHOLE_DOCUMENT: false,
        // Explicitly allow very long attribute values for configuration data
        SANITIZE_NAMED_PROPS: false,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM_IMPORT: false,
        // More permissive configuration to preserve custom attributes
        KEEP_CONTENT: true,
        SAFE_FOR_TEMPLATES: false,
        // Force allow style tags and custom elements
        FORBID_TAGS: [],
        FORBID_ATTR: [],
        // CRITICAL: Allow <style> in body context
        IN_PLACE: false,
      };
    }
    return DomPurifyHelper._config;
  }

  /**
   * Configures the DOMPurify instance with shared settings
   */
  private static configureInstance(): void {
    // Add hooks for custom elements and attributes
    DomPurifyHelper._instance.addHook(
      "uponSanitizeElement",
      DomPurifyHelper.allowCustomComponentsHook
    );
    DomPurifyHelper._instance.addHook(
      "uponSanitizeAttribute",
      DomPurifyHelper.allowCustomAttributesHook
    );
    DomPurifyHelper._instance.addHook(
      "uponSanitizeElement",
      DomPurifyHelper.allowStyleAndContentTagsHook
    );
  }

  /**
   * Forces DomPurify to allow <style> and <content> tags
   * In DomPurify 3.x with WHOLE_DOCUMENT:false, <style> tags are rejected
   * This hook forces them to be allowed regardless of context
   */
  public static allowStyleAndContentTagsHook(node, data) {
    // Force allow style and content tags in ANY context
    if (data.tagName === 'style' || data.tagName === 'content' || data.tagName === 'link') {
      data.allowedTags[data.tagName] = true;
      // Keep the element even if it would normally be removed
      data.keepElement = true;
    }
  }

  /**
   * Sanitizes HTML with the configured settings
   * In DomPurify 3.x, config must be passed to each sanitize() call
   */
  public static sanitize(dirty: string): string {
    const config = DomPurifyHelper.getConfig();
    return DomPurifyHelper.instance.sanitize(dirty, config);
  }

  /**
   * Allows custom attributes
   * @param attr the attribute name
   * @param data the DOMPurify data
   */
  public static allowCustomAttributesHook(attr, data) {
    if (data && data.attrName) {
      if (data.attrName.indexOf("on") == 0) return;
      if (data.attrName == "href") return;

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
    if (
      node.nodeName &&
      node.nodeName.match(/^\w+(-\w+)+$/) &&
      !data.allowedTags[data.tagName]
    ) {
      data.allowedTags[data.tagName] = true;
    }
  }
}
