import { Constants } from "../common/Constants";

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

export class DomPurifyHelper {
    private static _instance: any = null;
    private static _config: any = null;

    /**
     * Original values of data-* attributes on web components, keyed by element then attribute name.
     * Populated by allowCustomAttributesHook and consumed by restoreWebComponentDataAttributesHook
     * within the same sanitize() call.
     */
    private static readonly _webComponentDataAttributes: WeakMap<Element, Map<string, string>> = new WeakMap();

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
                // Allow <style> for template CSS, <link> for same-origin stylesheets (restricted via hook),
                // <content> for custom template elements, #comment for HTML comments
                ADD_TAGS: ["style", "#comment", "link", "content"],
                // Allow target (link behavior), loading (lazy images), data-* (custom component config),
                // style (inline CSS — sanitized via sanitizeStyleAttributeHook)
                ADD_ATTR: ["target", "loading", "data-fields-configuration", "data-*", "style"],
                ALLOW_DATA_ATTR: true,
                // Allowlist of safe URI schemes — blocks javascript:, data:, vbscript: etc.
                ALLOWED_URI_REGEXP: Constants.ALLOWED_URI_REGEXP,
                // Must be false — templates are rendered as fragments, not full documents
                WHOLE_DOCUMENT: false,
                SANITIZE_NAMED_PROPS: false,
                RETURN_DOM: false,
                RETURN_DOM_FRAGMENT: false,
                RETURN_DOM_IMPORT: false,
                // Preserve text content when removing disallowed elements
                KEEP_CONTENT: true,
                SAFE_FOR_TEMPLATES: false,
                // SECURITY: Block elements with no legitimate use in search result templates
                // form/button: action/formaction attributes accept javascript: URIs
                // object/embed: plugin execution, external resource loading
                FORBID_TAGS: ['form', 'button', 'object', 'embed'],
                // SECURITY: Block attributes that carry URIs or enable code execution.
                // forceKeepAttr in allowCustomAttributesHook bypasses DOMPurify's URI validation,
                // so these must be explicitly forbidden. Also blocked in the hook as defense-in-depth.
                FORBID_ATTR: ['action', 'formaction', 'xlink:href', 'srcdoc', 'ping', 'dynsrc', 'lowsrc', 'background'],
                IN_PLACE: false,
                // Sanitize DOM clobbering attacks (e.g. id/name that shadow document properties)
                SANITIZE_DOM: true,
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
        DomPurifyHelper._instance.addHook(
            "afterSanitizeAttributes",
            DomPurifyHelper.restoreWebComponentDataAttributesHook
        );
        DomPurifyHelper._instance.addHook(
            "afterSanitizeAttributes",
            DomPurifyHelper.sanitizeStyleAttributeHook
        );
        DomPurifyHelper._instance.addHook(
            "afterSanitizeElements",
            DomPurifyHelper.sanitizeStyleTagContentHook
        );
        DomPurifyHelper._instance.addHook(
            "afterSanitizeElements",
            DomPurifyHelper.restrictLinkTagHook
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

    // Attributes that carry URIs or enable code execution — must not be force-kept.
    // Returning early lets DOMPurify apply its own validation (ALLOWED_URI_REGEXP / FORBID_ATTR).
    private static readonly DANGEROUS_ATTRS: ReadonlySet<string> = new Set([
        'href',        // DOMPurify validates against ALLOWED_URI_REGEXP — don't bypass
        'src',         // images, scripts, iframes — DOMPurify validates URI scheme
        'srcset',      // responsive images — contains URIs
        'action',      // form submit target — accepts javascript: URIs
        'formaction',  // per-button override of action — same risk
        'xlink:href',  // SVG link — accepts javascript: URIs
        'srcdoc',      // iframe HTML injection
        'ping',        // <a> data exfiltration to attacker-controlled URLs
        'poster',      // <video> — external resource loading
        'cite',        // <blockquote>/<q> — URI attribute
        'codebase',    // <object>/<applet> — base URI for code loading
        'usemap',      // client-side image map — URI reference
        'dynsrc',      // legacy IE — javascript: execution
        'lowsrc',      // legacy IE — javascript: execution
        'background',  // legacy body/table — external resource loading
    ]);

    /**
     * Allows custom attributes needed by web components and Handlebars templates.
     * Blocks event handlers (on*) and dangerous URI-carrying attributes.
     * All other attributes are force-kept to support custom components like
     * <my-component data-foo="bar"> and Handlebars data attributes.
     * @param node the HTML node owning the attribute
     * @param data the DOMPurify hook event
     */
    public static allowCustomAttributesHook(node, data) {
        if (data?.attrName) {
            const attrLower = data.attrName.toLowerCase();

            // Block event handlers (onclick, onerror, onload, etc.)
            if (attrLower.startsWith('on')) return;

            // Don't force-keep dangerous URI attributes — let DOMPurify validate them
            if (DomPurifyHelper.DANGEROUS_ATTRS.has(attrLower)) return;

            if (DomPurifyHelper.isWebComponentDataAttribute(node, attrLower)) {
                // DOMPurify's SAFE_FOR_XML check runs on hookEvent.attrValue *before* forceKeepAttr
                // is honored and removes any attribute whose value contains "</style", "</script",
                // "-->", "]>", etc. Web component data-* attributes carry JSON-serialized template
                // context/configuration (e.g. column templates with <style> tags) that legitimately
                // contain such sequences and are consumed by the components as data, never as markup.
                // Hand DOMPurify an empty value for its checks; the DOM attribute keeps its original
                // value (forceKeepAttr skips the write-back) and is restored defensively afterwards.
                DomPurifyHelper.rememberWebComponentDataAttribute(node, attrLower);
                data.attrValue = "";
            }

            data.allowedAttributes[data.attrName] = true;
            data.forceKeepAttr = true;
        }
    }

    /**
     * Whether the attribute is a data-* attribute on a custom element (tag name containing a dash)
     * in the HTML namespace. Elements in foreign content (SVG/MathML) are excluded so that
     * DOMPurify's mXSS protections remain fully effective there.
     */
    private static isWebComponentDataAttribute(node: any, attrLower: string): boolean {
        return attrLower.startsWith("data-")
            && typeof node?.localName === "string"
            && node.localName.includes("-")
            && node.namespaceURI === HTML_NAMESPACE
            && typeof node.getAttribute === "function";
    }

    private static rememberWebComponentDataAttribute(node: Element, attrLower: string): void {
        const originalValue = node.getAttribute(attrLower);
        if (originalValue === null) return;

        let attributes = DomPurifyHelper._webComponentDataAttributes.get(node);
        if (!attributes) {
            attributes = new Map<string, string>();
            DomPurifyHelper._webComponentDataAttributes.set(node, attributes);
        }
        attributes.set(attrLower, originalValue);
    }

    /**
     * Restores data-* attribute values on web components that were neutralized for DOMPurify's
     * attribute value checks in allowCustomAttributesHook.
     * @param node the HTML node
     */
    public static restoreWebComponentDataAttributesHook(node: Element) {
        const attributes = DomPurifyHelper._webComponentDataAttributes.get(node);
        if (!attributes) return;

        DomPurifyHelper._webComponentDataAttributes.delete(node);

        attributes.forEach((originalValue, attrName) => {
            if (node.getAttribute(attrName) !== originalValue) {
                node.setAttribute(attrName, originalValue);
            }
        });
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

    /**
     * Sanitizes CSS inside <style> tags to block exfiltration vectors.
     * Blocks url(), @import, expression(), javascript:, behavior, -moz-binding.
     * Defense-in-depth: also applied in TemplateService.sanitizeHtmlWithStylePreservation.
     */
    public static sanitizeStyleTagContentHook(node) {
        if (node.nodeName && node.nodeName.toLowerCase() === 'style' && node.textContent) {
            node.textContent = DomPurifyHelper.sanitizeCssContent(node.textContent);
        }
    }

    /**
     * Restricts <link> tags to rel="stylesheet" with same-origin or relative href.
     * Removes <link> tags with rel="dns-prefetch", "preconnect", "preload", etc.
     * and external stylesheet references.
     */
    public static restrictLinkTagHook(node) {
        if (node.nodeName && node.nodeName.toLowerCase() === 'link') {
            const rel = (node.getAttribute('rel') || '').toLowerCase().trim();
            const href = node.getAttribute('href') || '';

            // Only allow rel="stylesheet"
            if (rel !== 'stylesheet') {
                node.parentNode?.removeChild(node);
                return;
            }

            // Block external URLs — allow relative paths and same-origin only
            if (href) {
                try {
                    const url = new URL(href, window.location.href);
                    if (url.origin !== window.location.origin) {
                        node.parentNode?.removeChild(node);
                        return;
                    }
                } catch {
                    // With a base URL, only truly malformed URIs throw — treat as unsafe
                    node.parentNode?.removeChild(node);
                    return;
                }
            }
        }
    }

    /**
     * Sanitizes CSS content by removing dangerous patterns.
     * Used by both DOMPurify hooks and TemplateService style preservation.
     */
    public static sanitizeCssContent(css: string): string {
        if (!css) return css;
        // Block @import (external stylesheet loading)
        css = css.replace(/@import\s+[^;]+;?/gi, '/* @import blocked */');
        // Block javascript: URLs inside url()
        // [\s'"]* instead of \s*['"]?\s* to avoid ReDoS via quadratic backtracking
        css = css.replace(/url\s*\([\s'"]*javascript:/gi, 'url(/* blocked */');
        // Block data: URLs inside url() except data:image/* (legitimate use)
        css = css.replace(/url\s*\([\s'"]*data:(?!image\/)/gi, 'url(/* blocked */');
        // Block expression() (IE legacy XSS)
        css = css.replace(/expression\s*\([^)]*\)/gi, '/* expression() blocked */');
        // Block behavior (IE legacy)
        css = css.replace(/behavior\s*:[^;]+;?/gi, '/* behavior blocked */');
        // Block -moz-binding (Firefox legacy XSS)
        css = css.replace(/-moz-binding\s*:[^;]+;?/gi, '/* -moz-binding blocked */');
        // Block javascript: in any context
        css = css.replace(/javascript\s*:/gi, '/* javascript: blocked */');
        return css;
    }

    /**
     * Sanitizes style attribute values to prevent XSS attacks
     * Removes dangerous CSS patterns like:
     * - expression() (IE legacy XSS vector)
     * - javascript: URLs in url()
     * - data: URLs in url() (can contain scripts)
     * - import statements
     * 
     * This provides defense-in-depth on top of DOMPurify's built-in CSS sanitization
     * 
     * @param node the HTML node
     * @param data the DOMPurify data
     */
    public static sanitizeStyleAttributeHook(node) {
        if (node.hasAttribute && node.hasAttribute('style')) {
            let styleValue = node.getAttribute('style');

            if (styleValue) {
                // Remove expression() - IE legacy XSS vector
                styleValue = styleValue.replace(/expression\s*\(/gi, '');

                // Remove javascript: URLs in url()
                // [\s'"]* instead of \s*['"]?\s* to avoid ReDoS via quadratic backtracking
                styleValue = styleValue.replace(/url\s*\([\s'"]*javascript:/gi, 'url(');

                // Remove data: URLs in url() that could contain scripts
                // Allow data:image/* for legitimate image use cases
                styleValue = styleValue.replace(/url\s*\([\s'"]*data:(?!image\/)/gi, 'url(');

                // Remove @import statements (shouldn't be in inline styles but just in case)
                styleValue = styleValue.replace(/@import/gi, '');

                // Remove behavior property (IE legacy)
                styleValue = styleValue.replace(/behavior\s*:/gi, '');

                // Remove -moz-binding (Firefox legacy XSS)
                styleValue = styleValue.replace(/-moz-binding\s*:/gi, '');

                // Update the attribute with sanitized value
                node.setAttribute('style', styleValue);
            }
        }
    }
}
