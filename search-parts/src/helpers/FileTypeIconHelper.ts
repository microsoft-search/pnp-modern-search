import { FLUENT_CDN_BASE_URL } from "@fluentui/style-utilities";

/**
 * Single source of truth for the base URL used to resolve Fluent UI file type icons.
 *
 * The file type icons are served from a Microsoft CDN. The exact URL is version-stamped by Fluent UI
 * (e.g. `.../fabric-cdn-prod_20260506.001/...`) and changes with every Fluent release, so we always
 * derive the *path* (which includes the version) from `FLUENT_CDN_BASE_URL` rather than hard-coding it.
 *
 * Resolving the URL ourselves (instead of relying on `getFileTypeIconProps`, which looks names up in
 * Fluent's shared, mutable icon registry) keeps icon rendering deterministic and immune to other apps
 * on the page re-registering the icons against a different CDN (issue #4376).
 *
 * Resolution order for the base URL:
 *   1. A global override (closed / sovereign / air-gapped environments) - used verbatim:
 *        window.__pnpModernSearchFileTypeIconBaseUrl = "https://my-cdn/assets/item-types/";
 *      The override must include the trailing `assets/item-types/` segment and a trailing slash.
 *   2. The SharePoint page CDN host derived from `pageContext.legacyPageContext.cdnPrefix` (provided
 *      via `setCdnPrefix`) combined with the version-correct icon path from `FLUENT_CDN_BASE_URL`.
 *      This keeps requests on the same CDN host SharePoint itself uses (e.g.
 *      "res-1.public.onecdn.static.microsoft"), which is more likely to be reachable in restricted
 *      environments than the default `res.cdn.office.net` host.
 *   3. The Fluent UI default CDN (`FLUENT_CDN_BASE_URL`).
 */
export class FileTypeIconHelper {

    /**
     * The name of the global variable used to override the file type icon base URL.
     */
    public static readonly OverrideGlobalName = "__pnpModernSearchFileTypeIconBaseUrl";

    /**
     * The SharePoint CDN prefix (from `pageContext.legacyPageContext.cdnPrefix`), provided by the
     * caller that has access to the SPFx page context (see `TemplateService`). Cached so the value is
     * available to render-time callers (e.g. `FileIconComponent`) that do not have a page context.
     */
    private static _cdnPrefix: string | undefined = undefined;

    /**
     * Stores the SharePoint CDN prefix read from the SPFx page context
     * (`pageContext.legacyPageContext.cdnPrefix`). Call once during initialization.
     */
    public static setCdnPrefix(cdnPrefix: string | undefined): void {
        FileTypeIconHelper._cdnPrefix = cdnPrefix;
    }

    /**
     * Returns the base URL used to resolve and register file type icons.
     */
    public static getBaseUrl(): string {

        // 1. Explicit override wins, used as-is.
        const override = (typeof window !== "undefined")
            ? (window as unknown as { [key: string]: string })[FileTypeIconHelper.OverrideGlobalName]
            : undefined;

        if (override && typeof override === "string" && override.trim().length > 0) {
            return override.trim();
        }

        // The version-stamped icon path, e.g. "/files/fabric-cdn-prod_20260506.001/assets/item-types/".
        // Always taken from Fluent so it matches the bundled icon version.
        const fluentBaseUrl = `${FLUENT_CDN_BASE_URL}/assets/item-types/`;

        // 2. Reuse the SharePoint CDN host (cdnPrefix) when available, keeping the Fluent icon path.
        try {
            const cdnHost = FileTypeIconHelper.getSharePointCdnHost();
            if (cdnHost) {
                const iconPath = new URL(fluentBaseUrl).pathname;
                return `https://${cdnHost}${iconPath}`;
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Fall through to the Fluent default below.
        }

        // 3. Fluent UI default CDN.
        return fluentBaseUrl;
    }

    /**
     * Normalizes the cached SharePoint CDN prefix to a bare host (e.g.
     * "res-1.public.onecdn.static.microsoft"). The `cdnPrefix` typically carries a trailing path
     * segment (such as "/bld") that is not part of the icon path, so it is stripped.
     * Returns undefined when no usable host is available.
     */
    private static getSharePointCdnHost(): string | undefined {

        const cdnPrefix = FileTypeIconHelper._cdnPrefix ? FileTypeIconHelper._cdnPrefix.trim() : undefined;

        if (!cdnPrefix) {
            return undefined;
        }

        // cdnPrefix looks like "res-1.public.onecdn.static.microsoft/bld" - keep only the host part.
        const host = cdnPrefix.replace(/^https?:\/\//i, "").split("/")[0];

        return host && host.length > 0 ? host : undefined;
    }
}
