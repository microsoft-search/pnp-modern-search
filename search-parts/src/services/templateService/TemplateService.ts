import { ITemplateService } from "./ITemplateService";
import { ServiceKey, ServiceScope, Text } from "@microsoft/sp-core-library";
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import * as Handlebars from 'handlebars';
import { uniqBy, uniq, isEmpty, trimEnd, get } from "@microsoft/sp-lodash-subset";
import * as strings from 'CommonStrings';
import { DateHelper } from "../../helpers/DateHelper";
import { PageContext } from "@microsoft/sp-page-context";
import { IComponentDefinition } from "@pnp/modern-search-extensibility";
import groupBy from 'handlebars-group-by';
import { IComponentFieldsConfiguration } from "../../models/common/IComponentFieldsConfiguration";
import { initializeFileTypeIcons } from '@uifabric/file-type-icons';
import { IDataResultType, ResultTypeOperator } from "../../models/common/IDataResultType";
import { IDataResultsTemplateContext } from "../../models/common/ITemplateContext";
import { UrlHelper } from "../../helpers/UrlHelper";
import { ObjectHelper } from "../../helpers/ObjectHelper";
import { Constants } from "../../common/Constants";
import * as handlebarsHelpers from 'handlebars-helpers';

const TemplateService_ServiceKey = 'PnPModernSearchTemplateService';

/**
 * The CSS identifer to load the template markup from a layout html file
 */
const Template_Content_Id = 'data-content';

/**
 * The CSS identifer to load the placeholder markup from a layout html file
 */
const Template_PlaceHolder_Id = 'placeholder-content';

export class TemplateService implements ITemplateService {

    private spHttpClient: SPHttpClient;
    private pageContext: PageContext;
    private dateHelper: DateHelper;
    private serviceScope: ServiceScope;

    /**
     * The moment.js library reference
     */
    private moment: any;

    private timeZoneBias = {
        WebBias: 0,
        UserBias: 0,
        WebDST: 0,
        UserDST: 0
    };

    private dayLightSavings = true;

    /**
     * A no conflict instance of Handlebars
     */
    private _handlebars: typeof Handlebars;

    get Handlebars(): typeof Handlebars {
        return this._handlebars;
    }

    public static ServiceKey: ServiceKey<ITemplateService> = ServiceKey.create(TemplateService_ServiceKey, TemplateService);

    public constructor(serviceScope: ServiceScope) {

        this.serviceScope = serviceScope;

        serviceScope.whenFinished(async () => {

            // Consume from the root scope
            this.pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
            this.spHttpClient = serviceScope.consume<SPHttpClient>(SPHttpClient.serviceKey);

            this.dateHelper = serviceScope.consume<DateHelper>(DateHelper.ServiceKey); // Resolved in the same scope
            this.dayLightSavings = this.dateHelper.isDST();

            this.timeZoneBias = {
                WebBias: this.pageContext.legacyPageContext.webTimeZoneData.Bias,
                WebDST: this.pageContext.legacyPageContext.webTimeZoneData.DaylightBias,
                UserBias: null,
                UserDST: null
            };

            if (this.pageContext.legacyPageContext.userTimeZoneData) {
                this.timeZoneBias.UserBias = this.pageContext.legacyPageContext.userTimeZoneData.Bias;
                this.timeZoneBias.UserDST = this.pageContext.legacyPageContext.userTimeZoneData.DaylightBias;
            }

            // Get a global moment instance
            if (!this.moment) {
                this.dateHelper.moment().then(moment => {
                    this.moment = moment;
                });
            }
        });

        // Create a distinct version of the Handlebars namespace to avoid conflcit with multiple versions
        this._handlebars = Handlebars.create();

        const helpers = handlebarsHelpers();

        // Registers all helpers in the global Handlebars context
        Object.keys(helpers).forEach(helperName => {
            this._handlebars.registerHelper(helperName, helpers[helperName]);
        });

        // Register helpers
        this.registerCustomHelpers();

        // Register icons and pull the fonts from the default SharePoint cdn.
        initializeFileTypeIcons();
    }

    /**
     * Gets the template HTML markup in the full template content
     * @param templateContent the full template content
     */
    public getTemplateMarkup(templateContent: string): string {

        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(templateContent, 'text/html');

        let templates: any = htmlContent.getElementById(Template_Content_Id);
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
    public getPlaceholderMarkup(templateContent: string): string {
        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(templateContent, 'text/html');

        const placeHolders = htmlContent.getElementById(Template_PlaceHolder_Id);
        if (placeHolders && placeHolders.innerHTML) {
            // Need to unescape '&gt;' for handlebars partials 
            return placeHolders.innerHTML.replace(/\&gt;/g, '>');
        } else {
            return null;
        }
    }

    /**
 * Gets the external file content from the specified URL
 * @param fileUrl the file URL
 */
    public async getFileContent(fileUrl: string): Promise<string> {

        const response: SPHttpClientResponse = await this.spHttpClient.get(fileUrl, SPHttpClient.configurations.v1, {
            headers: {
                'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
            }
        });
        if (response.ok) {
            return await response.text();
        }
        else {
            throw response.statusText;
        }
    }

    /**
     * Ensures the file is accessible trough the specified URL
     * @param filePath the file URL
     */
    public async ensureFileResolves(fileUrl: string): Promise<void> {

        const response: SPHttpClientResponse = await this.spHttpClient.get(fileUrl, SPHttpClient.configurations.v1, {
            headers: {
                'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
            }
        });
        if (response.ok) {

            if (response.url.indexOf('AccessDenied.aspx') > -1) {
                throw 'Access Denied';
            }

            return;
        }
        else {
            throw response.statusText;
        }
    }

    /**
     * Verifies if the template fiel path is correct
     * @param filePath the file path string
     */
    public isValidTemplateFile(filePath: string): boolean {

        let path = filePath.toLowerCase().trim();
        let pathExtension = path.substring(path.lastIndexOf('.'));
        return (pathExtension == '.htm' || pathExtension == '.html');
    }

    /**
     * Compile the specified Handlebars template with the associated context object¸
     * @returns the compiled HTML template string 
     */
    public async processTemplate(templateContext: any, templateContent: string): Promise<string> {

        let template = this.Handlebars.compile(templateContent);
        let result = template(templateContext);

        return result;
    }

    /**
     * Registers web components on the current page to be able to use them in the Handlebars template
     */
    public async registerWebComponents(webComponents: IComponentDefinition<any>[]): Promise<void> {

        return new Promise<void>((resolve) => {

            this.serviceScope.whenFinished(() => {

                // Registers custom HTML elements
                webComponents.forEach(wc => {

                    const component = window.customElements.get(wc.componentName);

                    if (!component) {

                        // Set the arbitrary property to all instances to get the WebPart context available in components (ex: PersonaCard)
                        wc.componentClass.prototype._serviceScope = this.serviceScope;
                        wc.componentClass.prototype.moment = this.moment;
                        window.customElements.define(wc.componentName, wc.componentClass);
                    }
                });

                resolve();
            });
        });
    }

    /**
     * Replaces item field values with field mapping values configuration
     * @param fieldsConfigurationAsString the fields configuration as stringified object
     * @param itemAsString the item context as stringified object
     * @param themeVariant the current theme variant
     */
    public processFieldsConfiguration<T>(fieldsConfiguration: IComponentFieldsConfiguration[], item: { [key: string]: any }, context?: IDataResultsTemplateContext | any): T {

        let processedProps = {};

        // Use configuration
        fieldsConfiguration.forEach(configuration => {

            let processedValue = ObjectHelper.byPath(item, configuration.value);

            if (configuration.useHandlebarsExpr && configuration.value) {

                try {

                    let templateContext: IDataResultsTemplateContext | any = context ? context : {};
                    // Create a temp context with the current so we can use global registered helpers on the current item
                    const tempTemplateContent = `{{#with item as |item|}}${configuration.value}{{/with}}`;
                    let template = this.Handlebars.compile(tempTemplateContent, {
                        noEscape: true
                    });

                    // Pass the current item as context
                    processedValue = template({ item: item }, {
                        data: {
                            root: {
                                slots: templateContext.slots,
                                theme: templateContext.theme,
                                context: templateContext.context,
                                instanceId: templateContext.instanceId
                            }
                        }
                    });


                    processedValue = processedValue ? processedValue.trim() : null;

                } catch (error) {
                    processedValue = `###Error: ${error.message}###`;
                }
            }

            processedProps[configuration.field] = processedValue;
        });

        return processedProps as T;
    }

    /**
     * Builds and registers the result types as this.Handlebars partials 
     * Based on https://github.com/helpers/handlebars-helpers/ operators
     * @param resultTypes the configured result types from the property pane
     */
    public async registerResultTypes(resultTypes: IDataResultType[]): Promise<void> {

        this.Handlebars.unregisterPartial("resultTypes");

        if (resultTypes.length > 0) {
            let content = await this._buildCondition(resultTypes, resultTypes[0], 0);
            let template = this.Handlebars.compile(content);

            this.Handlebars.registerPartial('resultTypes', template);
        } else {
            this.Handlebars.registerPartial('resultTypes', '{{> @partial-block }}');
        }

        return;
    }

    /**
     * Builds the Handlebars nested conditions recursively to reflect the result types configuration
     * @param resultTypes the configured result types from the property pane 
     * @param currentResultType the current processed result type
     * @param currentIdx current index
     */
    private async _buildCondition(resultTypes: IDataResultType[], currentResultType: IDataResultType, currentIdx: number): Promise<string> {

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
     * Registers custom Handlebars helpers in the global context
     */
    private registerCustomHelpers() {
        // Return the search result count message
        // Usage: {{getCountMessage totalRows keywords}} or {{getCountMessage totalRows null}}
        this.Handlebars.registerHelper("getCountMessage", (totalRows: string, inputQuery?: string) => {

            const countResultMessage = inputQuery ? Text.format(strings.HandlebarsHelpers.CountMessageLong, totalRows, inputQuery) : Text.format(strings.HandlebarsHelpers.CountMessageShort, totalRows);
            return new this.Handlebars.SafeString(countResultMessage);
        });

        // Return the highlighted summary of the search result item
        // <p>{{getSummary HitHighlightedSummary}}</p>
        this.Handlebars.registerHelper("getSummary", (hitHighlightedSummary: string) => {
            if (!isEmpty(hitHighlightedSummary)) {
                return new this.Handlebars.SafeString(hitHighlightedSummary.replace(/<c0\>/g, "<strong>").replace(/<\/c0\>/g, "</strong>").replace(/<ddd\/>/g, "&#8230;"));
            }
        });

        // Return the formatted date according to current locale using moment.js
        // <p>{{getDate Created "LL"}}</p>
        this.Handlebars.registerHelper("getDate", ((date: string, format: string, timeHandling?: number, isZ?: boolean) => {
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
                            date = this.dateHelper.addMinutes(this.dayLightSavings, itemDate, -this.timeZoneBias.WebBias, -this.timeZoneBias.WebDST).toISOString();
                            date = trimEnd(date, "Z");
                        } else if (timeHandling === 4 && this.timeZoneBias.UserBias) { // show as user region if any
                            date = this.dateHelper.addMinutes(this.dayLightSavings, itemDate, -this.timeZoneBias.UserBias, -this.timeZoneBias.UserDST).toISOString();
                            date = trimEnd(date, "Z");
                        }
                    }
                    return this.moment(new Date(date)).format(format);
                }
            } catch (error) {
                return date;
            }
        }).bind(this));

        // Return the URL or Title part of a URL automatic managed property
        // <p>{{getUrlField MyLinkOWSURLH "Title"}}</p>
        this.Handlebars.registerHelper("getUrlField", (urlField: string, value: "URL" | "Title") => {
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
            return new this.Handlebars.SafeString(urlField);
        });

        // Return the unique count based on an array or property of an object in the array
        // <p>{{getUniqueCount items "Title"}}</p>
        this.Handlebars.registerHelper("getUniqueCount", (array: any[], property: string) => {
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
        this.Handlebars.registerHelper("getUnique", (array: any[], property: string) => {
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
        this.Handlebars.registerHelper('times', (n, block) => {
            var accum = '';
            for (var i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        });

        //
        this.Handlebars.registerHelper("regex", (regx: string, str: string) => {
            let rx = new RegExp(regx);
            let i = rx.exec(str);
            if (!!!i || i.length === 0) return "-";
            let ret: string = i[0];
            return ret;
        });

        // Group by a specific property
        this.Handlebars.registerHelper(groupBy(Handlebars));

        // Return the value for a specific slot
        this.Handlebars.registerHelper("slot", (item: any, propertyPath: string) => {
            if (!isEmpty(propertyPath)) {
                const value = ObjectHelper.byPath(item, propertyPath);
                return value;
            }
        });

        // Match and return an email in the specified expression
        this.Handlebars.registerHelper("getUserEmail", (expr: string) => {

            if (!isEmpty(expr)) {

                const matches = expr.match(/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/gi);
                if (matches) {
                    return matches[0]; // Return the full match
                } else {
                    return expr;
                }

            }

        });

        // Return SPFx page context variable
        // Usage:
        //   {{getPageContext "user.displayName"}}
        //   {{getPageContext "cultureInfo.currentUICultureName"}}
        this.Handlebars.registerHelper("getPageContext", (name: string) => {
            if (!name) return "";
            let value = get(this.pageContext, name);
            if (value) return value;
            return "";
        });

        // Get Attachments from LinkOfficeChild managed properties
        // Usage:
        //   {{#getAttachments LinkOfficeChild}}
        //      <a href="{{url}}">{{fileName}}</href>
        //   {{/getAttachments}}
        this.Handlebars.registerHelper("getAttachments", (value: string, options) => {
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

    }
}