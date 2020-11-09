import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
const DateHelper_ServiceKey = 'PnPModernSearchDateHelper';

export class DateHelper {

    public static ServiceKey: ServiceKey<DateHelper> = ServiceKey.create(DateHelper_ServiceKey, DateHelper);

    private momentLibrary: any;

    private pageContext: PageContext;

    public constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(()=> {
            this.pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
        });
    }

    public async moment(): Promise<any> {

        if (this.momentLibrary) {
            return Promise.resolve(this.momentLibrary);
        } else {
            let moment: any = await import(
                /* webpackChunkName: 'moment' */
                'moment'
            );

            // Moment is by default 'en-us'
            if (['en-us','en'].indexOf(this.pageContext.cultureInfo.currentUICultureName.toLowerCase()) === -1) {
                await import(
                    /* webpackChunkName: 'moment' */
                    `moment/locale/${this.pageContext.cultureInfo.currentUICultureName.toLowerCase().split('-')[0]}.js`
                );
            }

            // Needs to use 'default' due to webpack 4.
            this.momentLibrary = moment.default;

            // Set default locale
            this.momentLibrary.locale(this.pageContext.cultureInfo.currentUICultureName ? this.pageContext.cultureInfo.currentUICultureName : 'en');
            return this.momentLibrary;
        }
    }

    public isDST() {
        let today = new Date();
        var jan = new Date(today.getFullYear(), 0, 1);
        var jul = new Date(today.getFullYear(), 6, 1);
        let stdTimeZoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        return today.getTimezoneOffset() < stdTimeZoneOffset;
    }

    public addMinutes(isDst: boolean, date: Date, minutes: number, dst: number) {
        if (isDst) {
            minutes += dst;
        }
        return new Date(date.getTime() + minutes * 60000);
    }
}