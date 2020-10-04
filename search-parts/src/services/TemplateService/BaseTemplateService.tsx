import 'core-js/features/array';
import 'core-js/modules/es.string.includes';
import 'core-js/modules/es.number.is-nan';
import * as Handlebars from 'handlebars';
import { ISearchResult } from '../../models/ISearchResult';
import { isEmpty, uniqBy, uniq, trimEnd, get } from '@microsoft/sp-lodash-subset';
import * as strings from 'SearchResultsWebPartStrings';
import { Text } from '@microsoft/sp-core-library';
import { DomHelper } from '../../helpers/DomHelper';
import { ISearchResultType, ResultTypeOperator } from '../../models/ISearchResultType';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import PreviewContainer from '../../controls/PreviewContainer/PreviewContainer';
import { IPreviewContainerProps, PreviewType } from '../../controls/PreviewContainer/IPreviewContainerProps';
import { IPropertyPaneField } from '@microsoft/sp-property-pane';
import ResultsLayoutOption from '../../models/ResultsLayoutOption';
import { ISearchResultsWebPartProps } from '../../webparts/searchResults/ISearchResultsWebPartProps';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { IComponentFieldsConfiguration, TemplateService } from './TemplateService';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import groupBy from 'handlebars-group-by';
import { Loader } from './LoadHelper';
import { IComponentDefinition } from '../ExtensibilityService/IComponentDefinition';
import { UrlHelper } from '../../helpers/UrlHelper';

abstract class BaseTemplateService {

    private _ctx: WebPartContext;

    public CurrentLocale = "en";
    public TimeZoneBias = {
        WebBias: 0,
        UserBias: 0,
        WebDST: 0,
        UserDST: 0
    };
    private DayLightSavings = true;
    public UseOldSPIcons = false;

    constructor(ctx?: WebPartContext) {

        this._ctx = ctx;

        // Registers all helpers
        this.registerTemplateServices();

        this.DayLightSavings = this.isDST();
    }

    private isDST() {
        let today = new Date();
        var jan = new Date(today.getFullYear(), 0, 1);
        var jul = new Date(today.getFullYear(), 6, 1);
        let stdTimeZoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        return today.getTimezoneOffset() < stdTimeZoneOffset;
    }

    /**
     * Gets template parameters according to the specified layout
     * @param layout the selected layout
     * @param properties the Web Part properties
     * @param onUpdateAvailableProperties callback when the list of managed properties is fetched by the control (Optional)
     * @param availableProperties the list of available managed properties already fetched once (Optional)
     */
    public getTemplateParameters(layout: ResultsLayoutOption, properties: ISearchResultsWebPartProps, onUpdateAvailableProperties?: (properties: IComboBoxOption[]) => void, availableProperties?: IComboBoxOption[]): IPropertyPaneField<any>[] {
        return [];
    }

    /**
     * Gets the default Handlebars template content used for a specific layout
     * @returns the template HTML markup
     */
    public static getTemplateContent(layout: ResultsLayoutOption): string {

        switch (layout) {

            case ResultsLayoutOption.SimpleList:
                return require('../../templates/layouts/simple-list.html');

            case ResultsLayoutOption.DetailsList:
                return require('../../templates/layouts/details-list.html');

            case ResultsLayoutOption.Tiles:
                return require('../../templates/layouts/tiles.html');

            case ResultsLayoutOption.People:
                return require('../../templates/layouts/people.html');

            case ResultsLayoutOption.Slider:
                return require('../../templates/layouts/slider.html');

            case ResultsLayoutOption.Debug:
                return require('../../templates/layouts/debug.html');

            case ResultsLayoutOption.Custom:
                return require('../../templates/layouts/default.html');

            default:
                return null;
        }
    }

    /**
     * Gets the default Handlebars result type list item
     * @returns the template HTML markup
     */
    public static getDefaultResultTypeListItem(): string {
        return require('../../templates/resultTypes/default_list.html');
    }

    /**
     * Gets the default Handlebars result type tile item
     * @returns the template HTML markup
     */
    public static getDefaultResultTypeTileItem(): string {
        return require('../../templates/resultTypes/default_tile.html');
    }

    /**
     * Gets the default Handlebars result type custom item
     * @returns the template HTML markup
     */
    public static getDefaultResultTypeCustomItem(): string {
        return require('../../templates/resultTypes/default_custom.html');
    }

    /**
     * Gets the template HTML markup in the full template content
     * @param templateContent the full template content
     */
    public static getTemplateMarkup(templateContent: string): string {

        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(templateContent, 'text/html');

        let templates: any = htmlContent.getElementById('template');
        if (templates && templates.innerHTML) {
            // Need to unescape '&gt;' for handlebars partials
            return templates.innerHTML.replace(/\&gt;/g, '>');
        } else {
            return templateContent;
        }
    }

    /**
     * Gets the placeholder HTML markup in the full template content
     * @param templateContent the full template content
     */
    public static getPlaceholderMarkup(templateContent: string): string {
        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(templateContent, 'text/html');

        const placeHolders = htmlContent.getElementById('placeholder');
        if (placeHolders && placeHolders.innerHTML) {
            // Need to unescape '&gt;' for handlebars partials
            return placeHolders.innerHTML.replace(/\&gt;/g, '>');
        } else {
            return null;
        }
    }

    private addMinutes(date: Date, minutes: number, dst: number) {
        if (this.DayLightSavings) {
            minutes += dst;
        }
        return new Date(date.getTime() + minutes * 60000);
    }

    private momentHelper(str, pattern, lang) {
        // if no args are passed, return a formatted date
        let moment = (window as any).searchMoment;
        moment.locale(lang);
        return moment(new Date(str)).format(pattern);
    }

    private createOdspPreviewUrl(defaultEncodingURL: string): string {
        let previewUrl: string;
        if (defaultEncodingURL) {
            const matches = defaultEncodingURL.match(/^(http[s]?:\/\/[^\/]*)(.+)\/(.+)$/);
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

    /**
     * Registers useful helpers for search results templates
     */
    private registerTemplateServices() {
        
        // Return a new array based on the regex filter specified property for an object in the array
        // {{#each (filterArrayByProperty items "Topic" "^[Aa]|^[Bb]")}}</p>
        Handlebars.registerHelper("filterArrayByProperty", (array: any[], property: string, regex: string) => {
            if (!Array.isArray(array)) return 0;
            if (array.length === 0 || property.length === 0 || regex.length === 0) return 0;

            return array.filter( (arrayItem) => {
                return new RegExp(regex).test(arrayItem[property]);
            });
        });
        
        // Return the URL of the search result item
        // Usage: <a href="{{url item}}">
        Handlebars.registerHelper("getUrl", (item: ISearchResult, forceDirectLink: boolean = false) => {

            let url = '';
            if (!isEmpty(item)) {
                const officeExtensions = ["doc", "docm", "docx", "dotx", "odp", "ods", "odt", "pot", "potm", "potx", "pps", "ppsx", "ppt", "pptm", "pptx", "rtf", "xls", "xlsb", "xlsm", "xlsx", "eml", "msg", "pdf", "vsd", "vsdx"];
                const isOfficeDoc = !isEmpty(item.FileType) && officeExtensions.indexOf(item.FileType.toLocaleLowerCase()) !== -1;
                const isLibItem = !isEmpty(item.contentclass) && item.contentclass.indexOf("Library") !== -1;
                const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

                // Handle shortcut url's
                if (!isEmpty(item.FileType) && item.FileType.toLowerCase() === "url" && item.ShortcutUrl) {
                    url = item.ShortcutUrl;
                }
                // Create ODSP viewer link for all files except office files or if on mobile
                else if (!forceDirectLink && !isEmpty(item.DefaultEncodingURL) && !isMobile && isLibItem && !isOfficeDoc) {
                    url = this.createOdspPreviewUrl(item.DefaultEncodingURL);
                }
                // Open with ?web=1 for office files or all files if on mobile
                else if (!isEmpty(item.DefaultEncodingURL) && isLibItem && !forceDirectLink) {
                    url = item.DefaultEncodingURL + "?web=1";
                }
                else if (!isEmpty(item.ServerRedirectedURL) && !isMobile && !forceDirectLink) {
                    url = item.ServerRedirectedURL;
                }
                else if (!isEmpty(item.DefaultEncodingURL) && isLibItem) {
                    url = item.DefaultEncodingURL;
                }
                else if (!isEmpty(item.OriginalPath)) {
                    url = item.OriginalPath;
                }
                else url = item.Path;
            }

            return new Handlebars.SafeString(url.replace(/\+/g,"%2B"));
        });

        // Return SPFx page context variable
        // Usage:
        //   {{getPageContext "user.displayName"}}
        //   {{getPageContext "cultureInfo.currentUICultureName"}}
        Handlebars.registerHelper("getPageContext", (name: string) => {

            if (!name) return "";
            let value = get(this._ctx.pageContext, name);
            if (value) return value;
            return "";
        });

        // Get Attachments from LinkOfficeChild managed properties
        // Usage:
        //   {{#getAttachments LinkOfficeChild}}
        //      <a href="{{url}}">{{fileName}}</href>
        //   {{/getAttachments}}
        Handlebars.registerHelper("getAttachments", (value: string, options) => {
            let out: string = "";
            if (!isEmpty(value)) {
                let splitArr: string[] = value.split(/\n+/);

                if (splitArr && splitArr.length > 0) {
                    for (let i of splitArr) {
                        let pos: number = i.lastIndexOf("/");
                        if (pos !== -1) {
                            let fileName: string = i.substring(pos + 1);
                            let objLine = { url: i, fileName: fileName };
                            out += options.fn(objLine);
                        }
                    }
                }
            }
            return out;
        });

        // Return the search result count message
        // Usage: {{getCountMessage totalRows keywords}} or {{getCountMessage totalRows null}}
        Handlebars.registerHelper("getCountMessage", (totalRows: string, inputQuery?: string) => {

            const countResultMessage = inputQuery ? Text.format(strings.CountMessageLong, totalRows, inputQuery) : Text.format(strings.CountMessageShort, totalRows);
            return new Handlebars.SafeString(countResultMessage);
        });

        // Return the preview image URL for the search result item
        // Usage: <img src="{{previewSrc item}}""/>
        Handlebars.registerHelper("getPreviewSrc", (item: ISearchResult) => {
            let previewSrc = "";
            const validThumbExt = ["doc", "docm", "docx", "dotm", "dotx", "pot", "potm", "potx", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx", "xls", "xlsb", "xlsx", "3g2", "3gp", "3mf", "ai", "arw", "asf", "bas", "bmp", "cr2", "crw", "cur", "dcm", "dng", "dwg", "eml", "epub", "erf", "gif", "glb", "gltf", "hcp", "htm", "html", "ico", "icon", "jpg", "key", "log", "m", "m2ts", "m4v", "markdown", "md", "mef", "mov", "movie", "mp4", "mp4v", "mrw", "msg", "mts", "nef", "nrw", "odp", "ods", "odt", "orf", "pages", "pano", "pdf", "pef", "pict", "ply", "png", "psb", "psd", "rtf", "sketch", "stl", "svg", "tif", "tiff", "ts", "wmv", "xbm", "xcf", "xd", "xpm", "gitconfig", "abap", "ada", "adp", "ahk", "as", "as3", "asc", "ascx", "asm", "asp", "awk", "bash", "bash_login", "bash_logout", "bash_profile", "bashrc", "bat", "bib", "bsh", "build", "builder", "c", "capfile", "cbl", "cc", "cfc", "cfm", "cfml", "cl", "clj", "cls", "cmake", "cmd", "coffee", "cpp", "cpt", "cpy", "cs", "cshtml", "cson", "csproj", "css", "ctp", "cxx", "d", "ddl", "di.dif", "diff", "disco", "dml", "dtd", "dtml", "el", "emakefile", "erb", "erl", "f", "f90", "f95", "fs", "fsi", "fsscript", "fsx", "gemfile", "gemspec", "go", "groovy", "gvy", "h", "h++", "haml", "handlebars", "hh", "hpp", "hrl", "hs", "htc", "hxx", "idl", "iim", "inc", "inf", "ini", "inl", "ipp", "irbrc", "jade", "jav", "java", "js", "json", "jsp", "jsx", "l", "less", "lhs", "lisp", "lst", "ltx", "lua", "make", "markdn", "mdown", "mkdn", "ml", "mli", "mll", "mly", "mm", "mud", "nfo", "opml", "osascript", "out", "p", "pas", "patch", "php", "php2", "php3", "php4", "php5", "pl", "plist", "pm", "pod", "pp", "profile", "properties", "ps1", "pt", "py", "pyw", "r", "rake", "rb", "rbx", "rc", "re", "reg", "rest", "resw", "resx", "rhtml", "rjs", "rprofile", "rpy", "rss", "rst", "rxml", "s", "sass", "scala", "scm", "sconscript", "sconstruct", "script", "scss", "sgml", "sh", "shtml", "sml", "sql", "sty", "tcl", "tex", "text", "tld", "tli", "tmpl", "tpl", "txt", "vb", "vi", "vim", "wsdl", "xaml", "xhtml", "xoml", "xml", "xsd", "xsl", "xslt", "yaml", "yaws", "yml", "zs", "mp3", "fbx", "heic", "jpeg", "hbs", "textile", "c++"];

            if (item) {
                if (!isEmpty(item.SiteLogo)) previewSrc = item.SiteLogo;
                else if (!isEmpty(item.FileType) && validThumbExt.indexOf(item.FileType.toLocaleLowerCase()) !== -1 && !isEmpty(item.NormSiteID) && !isEmpty(item.NormWebID) && !isEmpty(item.NormListID) && !isEmpty(item.NormUniqueID)) previewSrc = `${this._ctx.pageContext.site.absoluteUrl}/_api/v2.0/sites/${item.NormSiteID},${item.NormWebID}/lists/${item.NormListID}/items/${item.NormUniqueID}/driveItem/thumbnails/0/large/content?preferNoRedirect=true`;
                else if (!isEmpty(item.PreviewUrl)) previewSrc = item.PreviewUrl;
                else if (!isEmpty(item.PictureThumbnailURL)) previewSrc = item.PictureThumbnailURL;
                else if (!isEmpty(item.ServerRedirectedPreviewURL)) previewSrc = item.ServerRedirectedPreviewURL;
            }

            return new Handlebars.SafeString(previewSrc);
        });

        // Return the highlighted summary of the search result item
        // <p>{{summary HitHighlightedSummary}}</p>
        Handlebars.registerHelper("getSummary", (hitHighlightedSummary: string) => {
            if (!isEmpty(hitHighlightedSummary)) {
                return new Handlebars.SafeString(hitHighlightedSummary.replace(/<c0\>/g, "<strong>").replace(/<\/c0\>/g, "</strong>").replace(/<ddd\/>/g, "&#8230;"));
            }
        });

        // Return the formatted date according to current locale using moment.js
        // <p>{{getDate Created "LL"}}</p>
        Handlebars.registerHelper("getDate", (date: string, format: string, timeHandling?: number, isZ?: boolean) => {
            try {
                if (isZ && !date.toUpperCase().endsWith("Z")) {
                    if (date.indexOf(' ') !== -1) {
                        date += " ";
                    }
                    date += "Z";
                }
                let itemDate = new Date(date);
                if (itemDate.toISOString() !== new Date(null).toISOString()) {
                    if (typeof timeHandling === "number") {
                        if (timeHandling === 1) { // show as Z in UI
                            date = trimEnd(date, "Z");
                        } else if (timeHandling === 2) { // strip time part
                            let idx = date.indexOf('T');
                            date = date.substr(0, idx) + "T00:00:00";
                        } else if (timeHandling === 3) { // show as web region
                            date = this.addMinutes(itemDate, -this.TimeZoneBias.WebBias, -this.TimeZoneBias.WebDST).toISOString();
                            date = trimEnd(date, "Z");
                        } else if (timeHandling === 4 && this.TimeZoneBias.UserBias) { // show as user region if any
                            date = this.addMinutes(itemDate, -this.TimeZoneBias.UserBias, -this.TimeZoneBias.UserDST).toISOString();
                            date = trimEnd(date, "Z");
                        }
                    }
                    return this.momentHelper(date, format, this.CurrentLocale);
                }
            } catch (error) {
                return date;
            }
        });

        // Return the URL or Title part of a URL automatic managed property
        // <p>{{getUrlField MyLinkOWSURLH "Title"}}</p>
        Handlebars.registerHelper("getUrlField", (urlField: string, value: "URL" | "Title") => {
            if (!isEmpty(urlField)) {
                let separatorPos = urlField.indexOf(",");
                if (separatorPos === -1) {
                    return urlField;
                }
                if (value === "URL") {
                    return urlField.substr(0, separatorPos);
                }
                return urlField.substr(separatorPos + 1).trim();
            }
            return new Handlebars.SafeString(urlField);
        });

        // Return the unique count based on an array or property of an object in the array
        // <p>{{getUniqueCount items "Title"}}</p>
        Handlebars.registerHelper("getUniqueCount", (array: any[], property: string) => {
            if (!Array.isArray(array)) return 0;
            if (array.length === 0) return 0;

            let result;
            if (property) {
                result = uniqBy(array, property);

            }
            else {
                result = uniq(array);
            }
            return result.length;
        });

        // Return the unique values as a new array based on an array or property of an object in the array
        // <p>{{getUnique items "NewsCategory"}}</p>
        Handlebars.registerHelper("getUnique", (array: any[], property: string) => {
            if (!Array.isArray(array)) return 0;
            if (array.length === 0) return 0;

            let result;
            if (property) {
                result = uniqBy(array, property);
            } else {
                result = uniq(array);
            }
            return result;
        });

        // Repeat the block N times
        // https://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js
        // <p>{{#times 10}}</p>
        Handlebars.registerHelper('times', (n, block) => {
            var accum = '';
            for (var i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        });

        Handlebars.registerPartial("resultTypes-default", "{{> @partial-block }}");

        const self = this;
        const hbs = Handlebars;
        Handlebars.registerHelper('resultTypeResolve', (instanceId: string) => {
            return hbs.partials[`resultTypes-${instanceId}`] || "resultTypes-default";
        });
        Handlebars.registerPartial('resultTypes', '{{> (resultTypeResolve @root.instanceId)}}');

        Handlebars.registerHelper("regex", (regx: string, str: string) => {
            let rx = new RegExp(regx);
            let i = rx.exec(str);
            if (!!!i || i.length === 0) return "-";
            let ret: string = i[0];
            return ret;
        });

        // Group by a specific property
        Handlebars.registerHelper(groupBy(Handlebars));
    }

    /**
     * Registers web components on the current page to be able to use them in the Handlebars template
     */
    public registerWebComponents(webComponents: IComponentDefinition<any>[]) {

        // Registers custom HTML elements
        webComponents.map(wc => {
            const component = customElements.get(wc.componentName);
            if (!component) {
                customElements.define(wc.componentName, wc.componentClass);
            }

            // Set the arbitrary property to all instances to get the WebPart context available in components (ex: PersonaCard)
            wc.componentClass.prototype._ctx = this._ctx;
        });

        // Register slider component as partial
        let sliderTemplate = Handlebars.compile(`<pnp-slider-component data-items="{{items}}" data-options="{{options}}" data-template="{{@partial-block}}"></pnp-slider-component>`);
        Handlebars.registerPartial('slider', sliderTemplate);

        // Register live persona wrapper as partial
        let livePersonaTemplate = Handlebars.compile(`<pnp-live-persona data-upn="{{upn}}" data-disable-hover="{{disableHover}}" data-template="{{@partial-block}}"></pnp-live-persona>`);
        Handlebars.registerPartial('livepersona', livePersonaTemplate);
    }

    public async optimizeLoadingForTemplate(templateContent: string): Promise<void> {
        // Process the Handlebars template
        const handlebarFunctionNames = [
            "getDate",
            "after",
            "arrayify",
            "before",
            "eachIndex",
            "filter",
            "first",
            "forEach",
            "inArray",
            "isArray",
            "itemAt",
            "join",
            "last",
            "lengthEqual",
            "map",
            "some",
            "sort",
            "sortBy",
            "withAfter",
            "withBefore",
            "withFirst",
            "withGroup",
            "withLast",
            "withSort",
            "embed",
            "gist",
            "jsfiddle",
            "isEmpty",
            "iterate",
            "length",
            "and",
            "compare",
            "contains",
            "gt",
            "gte",
            "has",
            "eq",
            "ifEven",
            "ifNth",
            "ifOdd",
            "is",
            "isnt",
            "lt",
            "lte",
            "neither",
            "or",
            "unlessEq",
            "unlessGt",
            "unlessLt",
            "unlessGteq",
            "unlessLteq",
            "moment",
            "fileSize",
            "read",
            "readdir",
            "css",
            "ellipsis",
            "js",
            "sanitize",
            "truncate",
            "ul",
            "ol",
            "thumbnailImage",
            "i18n",
            "inflect",
            "ordinalize",
            "info",
            "bold",
            "warn",
            "error",
            "debug",
            "_inspect",
            "markdown",
            "md",
            "mm",
            "match",
            "isMatch",
            "add",
            "subtract",
            "divide",
            "multiply",
            "floor",
            "ceil",
            "round",
            "sum",
            "avg",
            "default",
            "option",
            "noop",
            "withHash",
            "addCommas",
            "phoneNumber",
            "random",
            "toAbbr",
            "toExponential",
            "toFixed",
            "toFloat",
            "toInt",
            "toPrecision",
            "extend",
            "forIn",
            "forOwn",
            "toPath",
            "get",
            "getObject",
            "hasOwn",
            "isObject",
            "merge",
            "JSONparse",
            "parseJSON",
            "pick",
            "JSONstringify",
            "absolute",
            "dirname",
            "relative",
            "basename",
            "stem",
            "extname",
            "segments",
            "camelcase",
            "capitalize",
            "capitalizeAll",
            "center",
            "chop",
            "dashcase",
            "dotcase",
            "hyphenate",
            "isString",
            "lowercase",
            "occurrences",
            "pascalcase",
            "pathcase",
            "plusify",
            "reverse",
            "replace",
            "sentence",
            "snakecase",
            "split",
            "startsWith",
            "titleize",
            "trim",
            "uppercase",
            "encodeURI",
            "decodeURI",
            "urlResolve",
            "urlParse",
            "stripQuerystring",
            "stripProtocol",
            "group"
        ];

        for (let i = 0; i < handlebarFunctionNames.length; i++) {
            const element = handlebarFunctionNames[i];

            let regEx = new RegExp("{{#?.*?" + element + ".*?}}", "m");
            if (regEx.test(templateContent)) {
                await Loader.LoadHandlebarsHelpers();
                break;
            }
        }

        this.UseOldSPIcons = templateContent && templateContent.indexOf("{{IconSrc}}") !== -1;

        if (templateContent && (templateContent.indexOf("fabric-icon") !== -1 || templateContent.indexOf("details-list") !== -1 || templateContent.indexOf("document-card") !== -1)) {
            // load CDN for icons
            Loader.LoadUIFabricIcons();
        }

        if (templateContent && templateContent.indexOf("video-card") !== -1) {
            await Loader.LoadVideoLibrary();
        }
    }

    /**
     * Compile the specified Handlebars template with the associated context object¸
     * @returns the compiled HTML template string
     */
    public async processTemplate(templateContext: any, templateContent: string): Promise<string> {
        let template = Handlebars.compile(templateContent);
        let result = template(templateContext);
        if (result.indexOf("video-preview-item") !== -1) {
            await Loader.LoadVideoLibrary();
        }
        return result;
    }

    /**
     * Replaces item field values with field mapping values configuration
     * @param fieldsConfigurationAsString the fields configuration as stringified object
     * @param itemAsString the item context as stringified object
     * @param themeVariant the current theem variant
     */
    public static processFieldsConfiguration<T>(fieldsConfigurationAsString: string, itemAsString: string, themeVariant?: IReadonlyTheme): T {

        let processedProps = {};

        // Get item properties
        const item = JSON.parse(itemAsString);

        // Use configuration
        const fieldsConfiguration: IComponentFieldsConfiguration[] = JSON.parse(fieldsConfigurationAsString);
        fieldsConfiguration.map(configuration => {

            let processedValue = item[configuration.value];

            if (configuration.useHandlebarsExpr && configuration.value) {

                try {
                    // Create a temp context with the current so we can use global registered helpers on the current item
                    const tempTemplateContent = `{{#with item as |item|}}${configuration.value}{{/with}}`;
                    let template = Handlebars.compile(tempTemplateContent, { noEscape: true });

                    // Pass the current item as context
                    processedValue = template({ item: item }, { data: { themeVariant: themeVariant } });

                    processedValue = !isEmpty(processedValue) ? processedValue.trim() : null;

                } catch (error) {
                    processedValue = `###Error: ${error.message}###`;
                }
            }

            processedProps[configuration.field] = processedValue;
        });

        return processedProps as T;
    }

    private resultTypesTemplates: { [instanceId: string]: HandlebarsTemplateDelegate<any> } = {};

    /**
     * Builds and registers the result types as Handlebars partials
     * Based on https://github.com/helpers/handlebars-helpers/ operators
     * @param resultTypes the configured result types from the property pane
     * @param instanceId id of the the webpart
     */
    public async registerResultTypes(resultTypes: ISearchResultType[], instanceId: string): Promise<void> {
        if (resultTypes.length > 0) {
            let content = await this._buildCondition(resultTypes, resultTypes[0], 0);
            let template = Handlebars.compile(content);
            Handlebars.registerPartial(`resultTypes-${instanceId}`, template);
        }
    }


    /**
     * Builds the Handlebars nested conditions recursively to reflect the result types configuration
     * @param resultTypes the configured result types from the property pane
     * @param currentResultType the current processed result type
     * @param currentIdx current index
     */
    private async _buildCondition(resultTypes: ISearchResultType[], currentResultType: ISearchResultType, currentIdx: number): Promise<string> {

        let conditionBlockContent;
        let templateContent = currentResultType.inlineTemplateContent;

        if (currentResultType.externalTemplateUrl) {
            templateContent = await this.getFileContent(currentResultType.externalTemplateUrl);
        }

        if (currentResultType.value) {

            let handlebarsToken = currentResultType.value.match(/^\{\{(.*)\}\}$/);

            let operator = currentResultType.operator;
            let param1 = currentResultType.property;

            // Use a token or a string value
            let param2 = handlebarsToken ? handlebarsToken[1] : `"${currentResultType.value}"`;

            // Operator: "Starts With"
            if (currentResultType.operator === ResultTypeOperator.StartsWith) {
                param1 = `"${currentResultType.value}"`;
                param2 = `${currentResultType.property}`;
            }

            // Operator: "Not null"
            if (currentResultType.operator === ResultTypeOperator.NotNull) {
                param2 = null;
            }

            const baseCondition = `{{#${operator} ${param1} ${param2 || ""}}}
                                        ${templateContent}`;

            if (currentIdx === resultTypes.length - 1) {
                // Renders inner content set in the 'resultTypes' partial
                conditionBlockContent = "{{> @partial-block }}";
            } else {
                conditionBlockContent = await this._buildCondition(resultTypes, resultTypes[currentIdx + 1], currentIdx + 1);
            }

            return `${baseCondition}
                    {{else}}
                        ${conditionBlockContent}
                    {{/${operator}}}`;
        } else {
            return '';
        }
    }

    /**
     * Verifies if the template fiel path is correct
     * @param filePath the file path string
     */
    public static isValidTemplateFile(filePath: string): boolean {

        let path = filePath.toLowerCase().trim();
        let pathExtension = path.substring(path.lastIndexOf('.'));
        return (pathExtension == '.htm' || pathExtension == '.html');
    }

    /**
     * Initializes the previews on search results for documents and videos. Called when a template is updated/changed
     */
    public static initPreviewElements(): void {
        this._initVideoPreviews();
        this._initDocumentPreviews();
    }

    public abstract getFileContent(fileUrl: string): Promise<string>;

    public abstract ensureFileResolves(fileUrl: string): Promise<void>;

    private static _initDocumentPreviews() {
        const nodes = document.querySelectorAll('.document-preview-item');

        DomHelper.forEach(nodes, ((index, el) => {
            if (!el.attributes["data-listener"]) {
                el.attributes["data-listener"] = "1";
                el.addEventListener("click", (event) => {
                    const thumbnailElt = event.srcElement;

                    // Get infos about the document to preview
                    const url: string = event.srcElement.getAttribute("data-url");
                    const previewImgUrl: string = event.srcElement.getAttribute("data-src");

                    if (url) {
                        let renderElement = React.createElement(
                            PreviewContainer,
                            {
                                elementUrl: url,
                                targetElement: thumbnailElt,
                                previewImageUrl: previewImgUrl,
                                showPreview: true,
                                previewType: PreviewType.Document
                            } as IPreviewContainerProps
                        );

                        ReactDom.render(renderElement, el);
                    }
                });
            }
        }));
    }

    private static _initVideoPreviews() {
        const nodes = document.querySelectorAll('.video-preview-item');

        DomHelper.forEach(nodes, ((index, el) => {
            if (!el.attributes["data-listener"]) {
                el.attributes["data-listener"] = "1";
                el.addEventListener("click", (event) => {

                    const thumbnailElt = event.srcElement;

                    // Get infos about the video to render
                    const url = event.srcElement.getAttribute("data-url");
                    const fileExtension = event.srcElement.getAttribute("data-fileext");
                    const previewImgUrl: string = event.srcElement.getAttribute("data-src");

                    if (url && fileExtension) {
                        let renderElement = React.createElement(
                            PreviewContainer,
                            {
                                videoProps: {
                                    fileExtension: fileExtension
                                },
                                showPreview: true,
                                targetElement: thumbnailElt,
                                previewImageUrl: previewImgUrl,
                                elementUrl: url,
                                previewType: PreviewType.Video
                            } as IPreviewContainerProps
                        );

                        ReactDom.render(renderElement, el);
                    }
                });
            }
        }));
    }
}

export default BaseTemplateService;
