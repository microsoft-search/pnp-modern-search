import * as Handlebars from 'handlebars';
import { initializeIcons } from '@uifabric/icons';
import { initializeFileTypeIcons } from '@uifabric/file-type-icons';
import { GlobalSettings, warn } from '@uifabric/utilities';

export class Loader {
    public static async LoadHandlebarsHelpers() {
        if ((window as any).searchMoment !== undefined) {
            // early check - seems to never hit(?)
            return;
        }
        let moment = await import(
            /* webpackChunkName: 'search-handlebars-helpers' */
            /* webpackMode: 'lazy' */
            'moment'
        );
        if ((window as any).searchMoment !== undefined) {
            return;
        }
        (window as any).searchMoment = (<any>moment).default;


        if ((window as any).searchHBHelper !== undefined) {
            // early check - seems to never hit(?)
            return;
        }
        let component = await import(
            /* webpackChunkName: 'search-handlebars-helpers' */
            /* webpackMode: 'lazy' */
            'handlebars-helpers'
        );
        if ((window as any).searchHBHelper !== undefined) {
            return;
        }
        (window as any).searchHBHelper = component.default({
            handlebars: Handlebars
        });

        // Repeat the block N times
        // https://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js
        // <p>{{#times 10}}</p>

        Handlebars.unregisterHelper('times'); // unregister times alias for multiply from helpers
        Handlebars.registerHelper('times', (n, block) => {
            var accum = '';
            for (var i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        });
    }

    public static async LoadVideoLibrary() {
        // Load Videos-Js on Demand
        // Webpack will create a other bundle loaded on demand just for this library
        if ((window as any).searchVideoJS === undefined) {
            const videoJs = await import(
                /* webpackChunkName: 'videos-js' */
                './video-js'
            );
            (window as any).searchVideoJS = videoJs.default.getVideoJs();
        }
    }

    public static LoadUIFabricIcons() {
        const icons = GlobalSettings.getValue("icons");
        if (icons && !icons["pagelink"]) {
            //load regular fabric icons if not present
            initializeIcons(void 0, { disableWarnings: true });
        }
        if (icons && !icons["spo16_svg"]) {
            // load file type icons if not present
            initializeFileTypeIcons(void 0, { disableWarnings: true });
        }
    }
}