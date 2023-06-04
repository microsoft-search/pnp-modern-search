/* eslint-disable no-lone-blocks */
import { FileFormat, ITemplateService } from "./ITemplateService";
import { Log, ServiceKey, ServiceScope, Text } from "@microsoft/sp-core-library";
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import * as Handlebars from 'handlebars';
import { uniqBy, uniq, isEmpty, trimEnd, get } from "@microsoft/sp-lodash-subset";
import * as strings from 'CommonStrings';
import { DateHelper } from "../../helpers/DateHelper";
import { PageContext } from "@microsoft/sp-page-context";
import { IComponentDefinition, IExtensibilityLibrary, IResultTemplates, LayoutRenderType } from "@pnp/modern-search-extensibility";
import groupBy from 'handlebars-group-by';
import { IComponentFieldsConfiguration } from "../../models/common/IComponentFieldsConfiguration";
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';
import { GlobalSettings } from 'office-ui-fabric-react';
import { IDataResultType, ResultTypeOperator } from "../../models/common/IDataResultType";
import { ISearchResultsTemplateContext, ISearchFiltersTemplateContext } from "../../models/common/ITemplateContext";
import { UrlHelper } from "../../helpers/UrlHelper";
import { ObjectHelper } from "../../helpers/ObjectHelper";
import { Constants } from "../../common/Constants";
import * as handlebarsHelpers from 'handlebars-helpers';
import { ServiceScopeHelper } from "../../helpers/ServiceScopeHelper";
import { DomPurifyHelper } from "../../helpers/DomPurifyHelper";
import * as DOMPurify from 'dompurify';
import { IAdaptiveCardAction } from '@pnp/modern-search-extensibility';

const TemplateService_ServiceKey = 'PnPModernSearchTemplateService';
const TemplateService_LogSource = "PnPModernSearch:TemplateService";

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

    private _adaptiveCardsNS;
    private _markdownIt;
    private _adaptiveCardsTemplating;
    private _serializationContext;

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

    /**
     * Collection of event handlers for adaptive cards, if any
     */
    private _adaptiveCardsExtensibilityLibraries: IExtensibilityLibrary[] = [];

    get AdaptiveCardsExtensibilityLibraries(): IExtensibilityLibrary[] {
        return this._adaptiveCardsExtensibilityLibraries;
    }

    set AdaptiveCardsExtensibilityLibraries(value: IExtensibilityLibrary[]) {
        this._adaptiveCardsExtensibilityLibraries = value;
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
                WebBias: this.pageContext.legacyPageContext.webTimeZoneData.Bias ? this.pageContext.legacyPageContext.webTimeZoneData.Bias : 0,
                WebDST: this.pageContext.legacyPageContext.webTimeZoneData.DaylightBias ? this.pageContext.legacyPageContext.webTimeZoneData.DaylightBias : 0,
                UserBias: null,
                UserDST: null
            };

            if (this.pageContext.legacyPageContext.userTimeZoneData) {
                this.timeZoneBias.UserBias = this.pageContext.legacyPageContext.userTimeZoneData.Bias ? this.pageContext.legacyPageContext.userTimeZoneData.Bias : 0;
                this.timeZoneBias.UserDST = this.pageContext.legacyPageContext.userTimeZoneData.DaylightBias ? this.pageContext.legacyPageContext.userTimeZoneData.DaylightBias : 0;
            }

            // Get a global moment instance
            if (!this.moment) {
                this.dateHelper.moment().then(moment => {
                    this.moment = moment;
                });
            }

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
            // Do not load icons twice as it may generate warnings
            if (!GlobalSettings.getValue('fileTypeIconsInitialized')) {
                initializeFileTypeIcons();
                GlobalSettings.setValue('fileTypeIconsInitialized', true);
            }
        });
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
     * @param fileFormat the file format to retrieve
     */
    public async getFileContent(fileUrl: string, fileFormat: FileFormat): Promise<string> {

        let headers: HeadersInit = {
            'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
            'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
        };

        if (fileFormat === FileFormat.Json) {
            headers['Content-Type'] = 'application/json';
            headers['Accept'] = 'application/json';
        }

        const response: SPHttpClientResponse = await this.spHttpClient.get(fileUrl, SPHttpClient.configurations.v1, {
            headers
        });

        if (response.ok) {

            let content;

            switch (fileFormat) {

                // Get file content as JSON
                case FileFormat.Json:
                    content = await response.json();
                    content = JSON.stringify(content);
                    break;

                // Get file content as raw text
                case FileFormat.Text:
                    content = await response.text();
                    break;

                default:
                    break;
            }

            return content;

        } else {
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
                // eslint-disable-next-line no-throw-literal
                throw 'Access Denied';
            }

            return;
        }
        else {
            throw response.statusText;
        }
    }

    /**
     * Verifies if the template file path is correct
     * @param filePath the file path string
     * @param validExtensions the file extensions considered as valid
     */
    public isValidTemplateFile(filePath: string, validExtensions: string[]): boolean {

        let path = filePath.toLowerCase().trim();
        let pathExtension = path.substring(path.lastIndexOf('.'));
        return (validExtensions.indexOf(pathExtension) !== -1);
    }

    /**
     * Compile the specified Handlebars template with the associated context object¸
     * @returns the compiled HTML template string
     */
    public async processTemplate(templateContext: ISearchResultsTemplateContext | ISearchFiltersTemplateContext, templateContent: string, renderType: LayoutRenderType): Promise<string | HTMLElement> {
        let processedTemplate: string | HTMLElement = templateContent;

        switch (renderType) {
            case LayoutRenderType.Handlebars:
                processedTemplate = this._renderHandlebarsTemplate(templateContext, templateContent);

                break;

            case LayoutRenderType.AdaptiveCards:
                processedTemplate = await this._renderAdaptiveCardsTemplate(templateContext, templateContent);
                break;

            default:
                break;
        }

        return processedTemplate;
    }

    /**
     * Registers web components on the current page to be able to use them in the Handlebars template
     */
    public async registerWebComponents(webComponents: IComponentDefinition<any>[], instanceId: string): Promise<void> {

        return new Promise<void>((resolve) => {

            // List of serice keys we want to expose to web components
            // Because multiple Web Part types can call the template service in separate bundles, using TemplateService.ServiceKey in a web component would result of a race condition and incoherent results as multiple keys will be created and last created would be used
            // See https://github.com/SharePoint/sp-dev-docs/issues/1419#issuecomment-371584038
            const availableServiceKeys: { [key: string]: ServiceKey<any> } = {
                TemplateService: TemplateService.ServiceKey
            };

            this.serviceScope.whenFinished(() => {

                // Registers custom HTML elements
                webComponents.forEach(wc => {

                    const component = window.customElements.get(wc.componentName);

                    if (!component) {

                        // Set arbitrary properties to all component instances via prototype

                        // To be able to get the right service scope and service keys for a particular web component corresponding to its parent Web Part (i.e. the Web Part currently rendering it), we need to an array of Web Part instance Ids references.
                        // This implies this instance ID has to be passed in the web component HTML attribute to retrieve the correct context for the current Web Part (ex: data-instance-id="{{@root.instanceId}}")
                        wc.componentClass.prototype._webPartServiceScopes = new Map<string, ServiceScope>();
                        wc.componentClass.prototype._webPartServiceScopes.set(instanceId, this.serviceScope);

                        wc.componentClass.prototype._webPartServiceKeys = new Map<string, { [key: string]: ServiceKey<any> }>();
                        wc.componentClass.prototype._webPartServiceKeys.set(instanceId, availableServiceKeys);

                        // Set the root service scope for common services (SPHttpClient, HttpClient, etc.)
                        wc.componentClass.prototype._serviceScope = ServiceScopeHelper.getRootServiceScope(this.serviceScope);

                        wc.componentClass.prototype.moment = this.moment;
                        window.customElements.define(wc.componentName, wc.componentClass);

                    } else {

                        // Update the instances array for all calling Web Parts
                        if (component.prototype._webPartServiceScopes && !component.prototype._webPartServiceScopes.get(instanceId)) {
                            component.prototype._webPartServiceScopes.set(instanceId, this.serviceScope);
                        }

                        if (component.prototype._webPartServiceScopes && !component.prototype._webPartServiceKeys.get(instanceId)) {
                            component.prototype._webPartServiceKeys.set(instanceId, availableServiceKeys);
                        }
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
    public processFieldsConfiguration<T>(fieldsConfiguration: IComponentFieldsConfiguration[], item: { [key: string]: any }, context?: ISearchResultsTemplateContext | any): T {

        let processedProps = {};

        // Use configuration
        fieldsConfiguration.forEach(configuration => {

            let processedValue = ObjectHelper.byPath(item, configuration.value);

            if (configuration.useHandlebarsExpr && configuration.value) {

                try {

                    let templateContext: ISearchResultsTemplateContext | any = context ? context : {};
                    // Create a temp context with the current so we can use global registered helpers on the current item
                    const tempTemplateContent = `{{#with item as |item|}}${configuration.value}{{/with}}`;
                    let template = this.Handlebars.compile(tempTemplateContent, {
                        noEscape: true // Need to disable escaping to allow markup - which is later sanitized. XSS not possible
                    });

                    // Pass the current item as context
                    processedValue = template({ item: item }, {
                        data: {
                            root: {
                                slots: templateContext.slots,
                                theme: templateContext.theme,
                                context: templateContext.context,
                                instanceId: templateContext.instanceId,
                                properties: templateContext.properties,
                                utils: templateContext.utils
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

    private _renderHandlebarsTemplate(templateContext: ISearchResultsTemplateContext | ISearchFiltersTemplateContext, templateContent: string): string {
        const template = this.Handlebars.compile(templateContent);
        return template(templateContext);
    }

    private async _renderAdaptiveCardsTemplate(templateContext: ISearchResultsTemplateContext | ISearchFiltersTemplateContext, templateContent: string): Promise<HTMLElement> {

        let renderTemplateContent: HTMLElement = null;

        // Load dynamic resources
        await this._initAdaptiveCardsResources();

        let hostConfiguration: { [key: string]: any } = {
            fontFamily: "Segoe UI, Helvetica Neue, sans-serif"
        };

        if ((templateContext as ISearchResultsTemplateContext).utils.adaptiveCardsHostConfig) {
            hostConfiguration = (templateContext as ISearchResultsTemplateContext).utils.adaptiveCardsHostConfig;
        }

        hostConfiguration = new this._adaptiveCardsNS.HostConfig(hostConfiguration);

        // If result templates are present, process each individual item and return the HTML output
        if ((templateContext as ISearchResultsTemplateContext).data?.resultTemplates) {
            renderTemplateContent = this._buildAdaptiveCardsResultTypes(
                templateContent,
                templateContext as ISearchResultsTemplateContext,
                (templateContext as ISearchResultsTemplateContext).data?.resultTemplates,
                hostConfiguration);
        } else {

            const template = new this._adaptiveCardsTemplating.Template(JSON.parse(templateContent));

            // The root context will be available in the the card implicitly
            const context = {
                $root: templateContext
            };

            const card = template.expand(context);
            let adaptiveCard = new this._adaptiveCardsNS.AdaptiveCard();
            adaptiveCard.hostConfig = hostConfiguration;

            adaptiveCard = this.registerActionHandler(adaptiveCard);

            adaptiveCard.parse(card, this._serializationContext);
            renderTemplateContent = adaptiveCard.render();
        }

        return renderTemplateContent;
    }

    private registerActionHandler(adaptiveCard) {

        // Register the dynamic list of event handlers for Adaptive Cards actions, if any
        if (this.AdaptiveCardsExtensibilityLibraries != null && this.AdaptiveCardsExtensibilityLibraries.length > 0) {
            adaptiveCard.onExecuteAction = (action: any) => {

                let actionResult: IAdaptiveCardAction;
                const type = action.getJsonTypeName();
                switch (type) {
                    case this._adaptiveCardsNS.OpenUrlAction.JsonTypeName: {
                        actionResult = {
                            type: type,
                            title: action.title,
                            url: action.url
                        };
                    }
                        break;

                    case this._adaptiveCardsNS.SubmitAction.JsonTypeName: {
                        actionResult = {
                            type: type,
                            title: action.title,
                            data: action.data
                        };
                    }
                        break;
                    case this._adaptiveCardsNS.ExecuteAction.JsonTypeName: {
                        actionResult = {
                            type: type,
                            title: action.title,
                            data: action.data,
                            verb: action.verb
                        };
                    }
                        break;
                }

                this.AdaptiveCardsExtensibilityLibraries.forEach(l => l.invokeCardAction(actionResult));
            };
        } else {
            adaptiveCard.onExecuteAction = (action: any) => {
                Log.info(TemplateService_LogSource, `Triggered an event from an Adaptive Card, with action: '${action.title}'. Please, register a custom Extension Library in order to handle it.`, this.serviceScope);
            };
        }

        return adaptiveCard;
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
            templateContent = await this.getFileContent(currentResultType.externalTemplateUrl, FileFormat.Text);
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

            const baseCondition = `{{#${operator} (slot item '${param1}') ${param2 || ""}}}
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

        // Return the URL of the search result item
        // Usage: <a href="{{getGraphPreviewUrl url}}">
        this.Handlebars.registerHelper("getGraphPreviewUrl", (url: any, context?: any) => {
            return new this.Handlebars.SafeString(UrlHelper.getGraphPreviewUrl(url));
        });

        // Return the search result count message
        // Usage: {{getCountMessage totalRows keywords}} or {{getCountMessage totalRows null}}
        this.Handlebars.registerHelper("getCountMessage", (totalRows: string, inputQuery?: string) => {
            let countResultMessage;
            if (inputQuery) {
                const safeQuery = this.Handlebars.escapeExpression(inputQuery);
                countResultMessage = Text.format(strings.HandlebarsHelpers.CountMessageLong, totalRows, safeQuery);
            } else {
                countResultMessage = Text.format(strings.HandlebarsHelpers.CountMessageShort, totalRows);
            }

            return new this.Handlebars.SafeString(countResultMessage);
        });

        // Return the highlighted summary of the search result item
        // <p>{{getSummary HitHighlightedSummary}}</p>
        this.Handlebars.registerHelper("getSummary", (hitHighlightedSummary: string) => {
            if (!isEmpty(hitHighlightedSummary)) {
                return new this.Handlebars.SafeString(hitHighlightedSummary.replace(/<c0\>/g, "<strong>").replace(/<\/c0\>/g, "</strong>").replace(/<ddd\/>/g, "&#8230;").replace(/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/g, ""));
            }
        });

        // Return tag name from a tag string
        this.Handlebars.registerHelper("getTagName", (tag: string) => {
            if (!isEmpty(tag)) {
                return new Handlebars.SafeString(tag.split("|").pop());
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
        this.Handlebars.unregisterHelper('times'); // unregister times alias for multiply from helpers
        this.Handlebars.registerHelper('times', (n, block) => {
            let accumulator = '';
            for (let i = 0; i < n; ++i)
                accumulator += block.fn(i);
            return accumulator;
        });

        // Get url parameter from current URL or a provided URL
        // <p>{{getUrlParameter "q"}}</p>
        this.Handlebars.registerHelper('getUrlParameter', (name: string, url?: string,): string => {
            if (url && typeof url === "object") {
                url = window.location.href;
            }
            const search = new URL(url).search;
            const queryParameters = new URLSearchParams(search);
            return this.Handlebars.escapeExpression(queryParameters.get(name));
        });

        // Support urlParse with an empty string to use current URL
        const origParse = this.Handlebars.helpers["urlParse"];
        this.Handlebars.unregisterHelper('urlParse');
        this.Handlebars.registerHelper('urlParse', (url: string) => {
            if (url && typeof url === "object") {
                url = window.location.href;
            }
            return origParse(url);
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
        this.Handlebars.registerHelper(groupBy(this.Handlebars));

        // Return the value for a specific slot
        this.Handlebars.registerHelper("slot", (item: any, propertyPath: string) => {
            if (propertyPath && !isEmpty(propertyPath)) {
                const value = ObjectHelper.byPath(item, propertyPath);
                return value;
            }
        });

        // Match and return an email in the specified expression
        this.Handlebars.registerHelper("getUserEmail", (expr: string) => {

            if (!isEmpty(expr)) {

                const matches = expr.match(/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,63})/gi);
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
                    let index: number = 0;
                    for (let i of splitArr) {
                        let pos: number = i.lastIndexOf("/");
                        if (pos !== -1) {
                            let fileName: string = i.substring(pos + 1);
                            let objLine = { url: i, fileName: fileName, index: index };
                            out += options.fn(objLine);
                            index++;
                        }
                    }
                }
            }
            return out;
        });

        // Parse a JSON object
        // <p>{{JSONparse jsonObject}}</p>
        this.Handlebars.registerHelper("JSONparse", (str: string, options: any) => {
            return JSON.parse(str);
        });

        this.Handlebars.registerHelper("isItemSelected", (selectedKeys: any[], itemIndex: any, options: any) => {
            if (Array.isArray(selectedKeys) && selectedKeys.length > 0) {
                return selectedKeys.indexOf(`${options.data.root.paging.currentPageNumber}${itemIndex}`) !== -1;
            }
        });

        this.Handlebars.registerHelper('dayDiff', (date1: string, date2: string) => {
            let dayCount = this.moment(date1).diff(this.moment(date2), 'days');
            return Math.abs(dayCount);
        });
    }

    private async _initAdaptiveCardsResources(): Promise<void> {

        // Initialize the serialization context for the Adaptive Cards, if needed
        if (!this._serializationContext) {
            const { Action, CardElement, CardObjectRegistry, GlobalRegistry, SerializationContext } = await import(
                /* webpackChunkName: 'pnp-modern-search-adaptive-cards-bundle' */
                'adaptivecards'
            );


            const { useLocalFluentUI } = await import(
                /* webpackChunkName: 'pnp-modern-search-adaptive-cards-bundle' */
                '../../controls/TemplateRenderer/fluentUI'
            );

            this._serializationContext = new SerializationContext();

            let actionType: InstanceType<typeof Action>
            let cardElementType: InstanceType<typeof CardElement>;

            let elementRegistry = new CardObjectRegistry<typeof cardElementType>();
            let actionRegistry = new CardObjectRegistry<typeof actionType>();

            GlobalRegistry.populateWithDefaultElements(elementRegistry);
            GlobalRegistry.populateWithDefaultActions(actionRegistry);

            useLocalFluentUI(elementRegistry, actionRegistry);
            this._serializationContext.setElementRegistry(elementRegistry);
            this._serializationContext.setActionRegistry(actionRegistry);
        }

        if (!this._adaptiveCardsNS) {

            const domPurify = DOMPurify.default;

            domPurify.setConfig({
                WHOLE_DOCUMENT: false
            });

            domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
            domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);

            // Load dynamic resources
            this._adaptiveCardsNS = await import(
                /* webpackChunkName: 'pnp-modern-search-adaptive-cards-bundle' */
                'adaptivecards'
            );

             // Initialize the serialization context for the Adaptive Cards, if needed
            if (!this._serializationContext) {

                const { CardObjectRegistry, GlobalRegistry, SerializationContext } = await import(
                    /* webpackChunkName: 'pnp-modern-search-adaptive-cards-bundle' */
                    'adaptivecards'
                );

                const { useLocalFluentUI } = await import(
                    /* webpackChunkName: 'pnp-modern-search-fluentui-bundle' */
                    '../../controls/TemplateRenderer/fluentUI'
                );

                this._serializationContext = new SerializationContext();

                const CardElementType =  this._adaptiveCardsNS.CardElement;
                const ActionElementType =  this._adaptiveCardsNS.Action;

                let elementRegistry = new CardObjectRegistry<InstanceType<typeof CardElementType>>();
                let actionRegistry = new CardObjectRegistry<InstanceType<typeof ActionElementType>>();
            
                GlobalRegistry.populateWithDefaultElements(elementRegistry);
                GlobalRegistry.populateWithDefaultActions(actionRegistry);
            
                useLocalFluentUI(elementRegistry, actionRegistry);
                this._serializationContext.setElementRegistry(elementRegistry);
                this._serializationContext.setActionRegistry(actionRegistry);
            }
  
            this._adaptiveCardsNS.AdaptiveCard.onProcessMarkdown = (text: string, result) => {

                // Special case with HitHighlightedSummary field
                text = text.replace(/<c0\>/g, "<strong>").replace(/<\/c0\>/g, "</strong>").replace(/<ddd\/>/g, "&#8230;");

                // We use Markdown here to render HTML and use web components
                const rawHtml = this._markdownIt.render(text).replace(/\&lt;/g, '<').replace(/\&gt;/g, '>');
                result.outputHtml = domPurify.sanitize(rawHtml);
                result.didProcess = true;
            };

            await import(
                /* webpackChunkName: 'pnp-modern-search-adaptive-cards-bundle' */
                'adaptive-expressions'
            );

            this._adaptiveCardsTemplating = await import(
                /* webpackChunkName: 'pnp-modern-search-adaptive-cards-bundle' */
                'adaptivecards-templating'
            );

            const MarkdownIt = await import(
                /* webpackChunkName: 'pnp-modern-search-adaptive-cards-bundle' */
                'markdown-it'
            );

            this._markdownIt = new MarkdownIt.default();
        }
    }

    private _buildAdaptiveCardsResultTypes(templateContent: string, templateContext: ISearchResultsTemplateContext, resultTemplates: IResultTemplates, hostConfiguration): HTMLElement {

        // Parse and render the main card template
        const mainCard = new this._adaptiveCardsNS.AdaptiveCard();
        mainCard.hostConfig = hostConfiguration;
        const template = new this._adaptiveCardsTemplating.Template(JSON.parse(templateContent));

        const context = {
            $root: templateContext
        };

        const card = template.expand(context);
        mainCard.parse(card, this._serializationContext);

        const mainHtml = mainCard.render();

        // Build dictionary of available result template
        const templateDictionary = new Map(Object.entries(resultTemplates));

        for (let item of templateContext.data.items) {

            const templateId = item.resultTemplateId;
            const templatePayload = templateDictionary.get(templateId).body;

            // Check if item should use a result template
            if (templatePayload && templateId !== 'connectordefault') {

                const itemTemplate = new this._adaptiveCardsTemplating.Template(templatePayload);

                const itemContext = {
                    $root: item.resource.properties
                };

                const itemCardPayload = itemTemplate.expand(itemContext);

                let itemAdaptiveCard = new this._adaptiveCardsNS.AdaptiveCard();
                itemAdaptiveCard.hostConfig = hostConfiguration;

                itemAdaptiveCard.parse(itemCardPayload, this._serializationContext);
                itemAdaptiveCard = this.registerActionHandler(itemAdaptiveCard);

                // Partial match as we can't use the complete ID due to special characters "/" and "==""
                const defaultItem: HTMLElement = mainHtml.querySelector(`[id^="${item.hitId.substring(0, 15)}"]`);

                // Replace the HTML element corresponding to the item by its result type
                if (defaultItem) {
                    const itemHtml: HTMLElement = itemAdaptiveCard.render()
                    defaultItem.replaceWith(itemHtml);
                }
            }
        }

        return mainHtml;
    }
}
