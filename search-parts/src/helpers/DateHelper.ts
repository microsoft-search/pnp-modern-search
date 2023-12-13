import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import LocalizationHelper from "./LocalizationHelper";
const DateHelper_ServiceKey = 'PnPModernSearchDateHelper';

export class DateHelper {

    public static ServiceKey: ServiceKey<DateHelper> = ServiceKey.create(DateHelper_ServiceKey, DateHelper);

    private momentLibrary: any;

    private pageContext: PageContext;

    private lastCulture: string;

    public constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
        });
    }

    public async moment(): Promise<any> {

        let culture = LocalizationHelper.getTranslatedCultureFromUrl();
        if (!culture) {
            culture = this.pageContext.cultureInfo.currentUICultureName.toLowerCase();
        }

        if (!this.lastCulture || this.lastCulture !== culture) {
            // All supported locales
            let momentCultures = ["af", "bo", "en-ca", "fa", "he", "kn", "ms-my", "ro", "te", "uz-latn", "ar-dz", "br", "en-gb", "fi", "hi", "ko", "ms", "ru", "tet", "uz", "ar-kw", "bs", "en-ie", "fil", "hr", "ku", "mt", "sd", "tg", "vi", "ar-ly", "ca", "en-il", "fo", "hu", "ky", "my", "se", "th", "ar-ma", "cs", "en-in", "fr-ca", "hy-am", "lb", "nb", "si", "tk", "yo", "ar-sa", "cv", "en-nz", "fr-ch", "id", "lo", "ne", "sk", "tl-ph", "zh-cn", "ar-tn", "cy", "en-sg", "fr", "is", "lt", "nl-be", "sl", "tlh", "zh-hk", "ar", "da", "eo", "fy", "it-ch", "lv", "nl", "sq", "tr", "zh-mo", "az", "de-at", "es-do", "ga", "it", "me", "nn", "sr-cyrl", "tzl", "zh-tw", "be", "de-ch", "es-mx", "gd", "ja", "mi", "oc-lnc", "sr", "tzm-latn", "bg", "de", "es-us", "gl", "jv", "mk", "pa-in", "ss", "tzm", "bm", "dv", "es", "gom-deva", "ka", "ml", "pl", "sv", "ug-cn", "bn-bd", "el", "et", "gom-latn", "kk", "mn", "pt-br", "sw", "uk", "bn", "en-au", "eu", "gu", "km", "mr", "pt", "ta", "ur"];

            // Check direct match
            if (momentCultures.some((c) => c == culture)) {
                this.lastCulture = culture;
            }

            // Check part match
            if(!this.lastCulture) {
                culture = culture.split('-')[0];
                if (momentCultures.some((c) => c == culture)) {
                    this.lastCulture = culture;
                }
            }

            if (this.lastCulture) {
                await import(
                    /* webpackMode: 'lazy', webpackChunkName: 'pnp-modern-search-moment-locale' */
                    `moment/locale/${this.lastCulture}.js`
                );
            }
        }


        if (this.momentLibrary) {
            this.momentLibrary.locale(culture);
            return Promise.resolve(this.momentLibrary);
        } else {
            let moment: any = await import(
                /* webpackMode: 'lazy', webpackChunkName: 'pnp-modern-search-moment-base' */
                'moment'
            );

            // Needs to use 'default' due to webpack 4.
            this.momentLibrary = moment.default;

            // Set default locale
            this.momentLibrary.locale(culture);
            return this.momentLibrary;
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