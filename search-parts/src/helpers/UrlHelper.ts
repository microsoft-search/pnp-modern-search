export class UrlHelper {

    /**
     * Test if the provided string is a valid URL
     * @param url the URL to check
     */
    public static isValidUrl(url: string): boolean {
        return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(url);
    }

    /**
     * Get the value of a querystring
     * @param  {String} field The field to get the value of
     * @param  {String} url   The URL to get the value from (optional)
     * @return {String}       The field value
     */
    public static getQueryStringParam(field: string, url: string): string {
        const href = url ? url : window.location.href;
        const reg = new RegExp("[?&#]" + field + "=([^&#]*)", "i");
        const qs = reg.exec(href);
        return qs ? qs[1] : null;
    }

    /**
     * @param {String} field The field name of the query string to remove
     * @param {String} sourceURL The source URL
     * @return {String}       The updated URL
     */
    public static removeQueryStringParam(field: string, sourceURL: string): string {
        let rtn = sourceURL.split("?")[0];
        let param = null;
        let paramsArr = [];
        const hash = window.location.hash;
        const queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";

        if (queryString !== "") {
            paramsArr = queryString.split("&");
            for (let i = paramsArr.length - 1; i >= 0; i -= 1) {
                param = paramsArr[i].split("=")[0];
                if (param === field) {
                    paramsArr.splice(i, 1);
                }
            }

            if (paramsArr.length > 0) {
                rtn = rtn + "?" + paramsArr.join("&").replace(hash, '') + hash;
            }
        }
        return rtn;
    }

    /**
     * Add or replace a query string parameter
     * @param url The current URL
     * @param param The query string parameter to add or replace
     * @param value The new value
     */
    public static addOrReplaceQueryStringParam(url: string, param: string, value: string): string {
        param = param.replace(/[.~*()]/g,''); // // Ensure param is safe from DOS attacks - so we strip away RegEx special characters
        const re = new RegExp("[\\?&]" + param + "=([^&#]*)"); 
        const match = re.exec(url);
        let delimiter;
        let newString;

        if (match === null) {
            // Append new param
            const hash = window.location.hash && window.location.hash !== '' ? window.location.hash : '#';
            const hasQuestionMark = /\?/.test(url);
            delimiter = hasQuestionMark ? "&" : "?";
            newString = url.replace(hash, '') + delimiter + param + "=" + encodeURIComponent(value) + hash;
        } else {
            delimiter = match[0].charAt(0);
            newString = url.replace(re, delimiter + param + "=" + encodeURIComponent(value));
        }

        return newString;
    }

    /**
     * Gets the current query string parameters
     * @returns query string parameters as object
     */
    public static getQueryStringParams(): {[parameter: string]: string } {

        let queryStringParameters: {[parameter: string]: string } = {};
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.forEach((value, key) => {
            queryStringParameters[key] = value;
        });

        return queryStringParameters;
    }

    /**
     * Decodes a provided string
     * @param encodedStr the string to decode
     */
    public static decode(encodedStr: string) {
        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(`<!doctype html><body>${encodedStr}</body>`, 'text/html');
        return htmlContent.body.textContent;
    }

    /**
     * Try to guess the item URL according to its . (i.e the URL where the user will be redirected to)
     * @param item the result item
     */
    public static getGraphPreviewUrl(url: string) {

        // Try to guess the href link according to URL using the Microsoft Graph format
        if (url) {
            // See https://support.microsoft.com/en-us/office/file-types-supported-for-previewing-files-in-onedrive-sharepoint-and-teams-e054cd0f-8ef2-4ccb-937e-26e37419c5e4
            url = UrlHelper.createOdspPreviewUrl(url);
        }
    
        return url;
    }

    public static createOdspPreviewUrl(url: string): string {

        let previewUrl: string = url;

        if (url) {

            const matches = url.match(/^(http[s]?:\/\/[^\/]*)(.+)\/(.+)$/);
            // First match is the complete URL
            if (matches) {
                const [host, path, file] = matches.slice(1);
                if (host && path && file) {
                    previewUrl = `${host}${path}/?id=${path}/${file}&parent=${path}`;
                }
            }
        }

        return previewUrl;
    }
}

export enum PageOpenBehavior {
    "Self" = "Self",
    "NewTab" = "NewTab"
}

export enum QueryPathBehavior {
    "URLFragment" = "URLFragment",
    "QueryParameter" = "QueryParameter"
}