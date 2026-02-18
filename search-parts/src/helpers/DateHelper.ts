import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import LocalizationHelper from "./LocalizationHelper";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

// Extend dayjs with the localizedFormat plugin (supports "LL", "LLL", etc.)
dayjs.extend(localizedFormat);

const DateHelper_ServiceKey = 'PnPModernSearchDateHelper';

export class DateHelper {

    public static ServiceKey: ServiceKey<DateHelper> = ServiceKey.create(DateHelper_ServiceKey, DateHelper);

    private pageContext: PageContext;

    /** Raw culture last requested — avoids re-resolving on repeated calls */
    private lastRequestedCulture: string;

    /** Resolved dayjs locale key (e.g. "de" when "de-us" was requested but didn't exist) */
    private lastResolvedLocale: string;

    /** Locales already dynamically imported — shared across all DateHelper instances */
    private static importedLocales: Set<string> = new Set();

    public constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
        });
    }

    /**
     * Returns the dayjs constructor configured for the current UI locale.
     *
     * Resolution order:
     *  1. Exact culture tag  (e.g. "de-at" → dayjs/locale/de-at.js)
     *  2. Language-only part  (e.g. "de"    → dayjs/locale/de.js)
     *  3. English             (built-in, always available)
     *
     * Locale files are loaded lazily; once loaded they stay registered in dayjs
     * and in the static `importedLocales` set so repeat calls are essentially free.
     */
    public async moment(): Promise<typeof dayjs> {

        let culture = LocalizationHelper.getTranslatedCultureFromUrl()
            || this.pageContext.cultureInfo.currentUICultureName.toLowerCase();

        if (culture === this.lastRequestedCulture) {
            // Nothing changed — dayjs is already configured
            return dayjs;
        }

        const resolved = await this.resolveLocale(culture);

        this.lastRequestedCulture = culture;

        if (resolved !== this.lastResolvedLocale) {
            this.lastResolvedLocale = resolved;
            dayjs.locale(resolved);
        }

        return dayjs;
    }

    /** Try to import a locale file; skip the network call if we already imported it. */
    private async resolveLocale(culture: string): Promise<string> {

        // 1. Exact match
        if (await this.ensureLocale(culture)) return culture;

        // 2. Language-only fallback (e.g. "de" from "de-ch")
        const lang = culture.split('-')[0];
        if (lang !== culture && await this.ensureLocale(lang)) return lang;

        // 3. English (built-in)
        return "en";
    }

    /** Import the locale chunk if it hasn't been loaded yet. Returns true on success. */
    private async ensureLocale(key: string): Promise<boolean> {
        if (DateHelper.importedLocales.has(key)) return true;
        try {
            await import(
                /* webpackMode: 'lazy', webpackChunkName: 'pnp-modern-search-dayjs-locale-[request]' */
                `dayjs/locale/${key}.js`
            );
            DateHelper.importedLocales.add(key);
            return true;
        } catch {
            return false;
        }
    }

    public isDST() {
        const today = new Date();
        const jan = new Date(today.getFullYear(), 0, 1);
        const jul = new Date(today.getFullYear(), 6, 1);
        const stdTimeZoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        return today.getTimezoneOffset() < stdTimeZoneOffset;
    }

    public addMinutes(isDst: boolean, date: Date, minutes: number, dst: number) {
        if (isDst) {
            minutes += dst;
        }
        return new Date(date.getTime() + minutes * 60000);
    }
}