import { ITokenService, IProfileProperties } from "@pnp/modern-search-extensibility";
import { ServiceKey, ServiceScope, Log, UrlQueryParameterCollection } from "@microsoft/sp-core-library";
import { PageContext } from '@microsoft/sp-page-context';
import { SPHttpClient } from '@microsoft/sp-http';
import { DateHelper } from "../../helpers/DateHelper";
import { Constants } from "../../common/Constants";
import { ObjectHelper } from "../../helpers/ObjectHelper";

const TokenService_ServiceKey = 'ModernSearchTokenService';

export enum BuiltinTokenNames {

    /**
     * The input query text configured in the search results Web Part
     */
    inputQueryText = 'inputQueryText',

    /**
     * The current selected filters if any
     */
    filters = 'filters'
}

export class TokenService implements ITokenService {

    /**
     * This regex only matches expressions enclosed with single, not escaped, curly braces '{}'
     */    
    private genericTokenRegexp: RegExp = /(?<!\\){[^\{]*?}(?!\\)/gi;

    /**
     * The list of user properties. Used to avoid refetching it every time.
     */
    private userProperties: IProfileProperties = null;

    /**
     * The current page item. Used to avoid refetching it every time.
     */
    private currentPageItem: any = null;

    /**
     * The current service scope
     */
    private serviceScope: ServiceScope;

    /**
     * The current page context
     */
    private pageContext: PageContext;

    /**
     * The SPHttpClient instance
     */
    private spHttpClient: SPHttpClient;

    /**
     * The list of static tokens values set by the Web Part as context
     */
    private tokenValuesList: { [key: string]: any } = {
        [BuiltinTokenNames.inputQueryText]: undefined,
        [BuiltinTokenNames.filters]: {}
    };

    /**
     * A date helper instance
     */
    private dateHelper: DateHelper;

    /**
     * The moment.js library reference
     */
    private moment: any;

    public static ServiceKey: ServiceKey<ITokenService> = ServiceKey.create(TokenService_ServiceKey, TokenService);

    public constructor(serviceScope: ServiceScope) {

        this.serviceScope = serviceScope;

        serviceScope.whenFinished(() => {

            this.dateHelper = serviceScope.consume<DateHelper>(DateHelper.ServiceKey);
            this.pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
            this.spHttpClient = serviceScope.consume<SPHttpClient>(SPHttpClient.serviceKey);
        });
    }

    public setTokenValue(token: string, value: any) {

        // Check if the token is in the whitelist
        if (Object.keys(this.tokenValuesList).indexOf(token) !== -1) {
            this.tokenValuesList[token] = value;
        } else {
            Log.warn(TokenService_ServiceKey, `The token '${token}' not allowed.`);
        }
    }

    public async resolveTokens(inputString: string): Promise<string> {

        if (inputString) {

            this.moment = await this.dateHelper.moment();

            // Resolves dynamic tokens (i.e. tokens resolved asynchronously versus static ones set by the Web Part context)
            inputString = await this.replacePageTokens(inputString);
            inputString = await this.replaceUserTokens(inputString);
            inputString = this.replaceDateTokens(inputString);
            inputString = this.replaceQueryStringTokens(inputString);
            inputString = this.replaceWebTokens(inputString);
            inputString = this.replacePageContextTokens(inputString);
            inputString = this.replaceSiteTokens(inputString);
            inputString = this.replaceListTokens(inputString);
            inputString = this.replaceGroupTokens(inputString);
            inputString = this.replaceLegacyPageContextTokens(inputString);
            inputString = this.replaceOrOperator(inputString);
            inputString = await this.replaceHubTokens(inputString);

            inputString = inputString.replace(/\{TenantUrl\}/gi, `https://` + window.location.host);

            // Look for static tokens in the specified string
            const tokens = inputString.match(this.genericTokenRegexp);

            if (tokens !== null && tokens.length > 0) {

                tokens.forEach(token => {

                    // Take the expression inside curly brackets
                    const tokenName = token.substr(1).slice(0, -1);

                    // Check if the property exists in the object
                    // 'undefined' => token hasn't been initialized in the TokenService instance. We left the token expression untouched (ex: {token}).
                    // 'null' => token has been initialized and set with a null value. We replace by an empty string as we don't want the string 'null' litterally.
                    // '' (empty string) => replaced in the original string with an empty string as well.
                    if (ObjectHelper.byPath(this.tokenValuesList, tokenName) !== undefined) {

                        if (ObjectHelper.byPath(this.tokenValuesList, tokenName) !== null) {
                            inputString = inputString.replace(new RegExp(token, 'gi'), ObjectHelper.byPath(this.tokenValuesList, tokenName));
                        } else {
                            // If the property value is 'null', we replace by an empty string. 'null' means it has been already set but resolved as empty.
                            inputString = inputString.replace(new RegExp(token, 'gi'), '');
                        }
                    }
                });
            }

            // Replace manually escaped characters
            inputString = inputString.replace(/\\(.)/gi, '$1');
        }

        return inputString;
    }

    /**
     * Retrieves available current page item properties
     */
    public async getPageProperties(): Promise<any> {

        let item = null;

        // Do this check to ensure we are not in the workbench
        if (this.pageContext.listItem) {

            const url = this.pageContext.web.absoluteUrl + `/_api/web/GetList(@v1)/RenderExtendedListFormData(itemId=${this.pageContext.listItem.id},formId='viewform',mode='2',options=7)?@v1='${this.pageContext.list.serverRelativeUrl}'`;

            try {
                const response = await this.spHttpClient.post(url, SPHttpClient.configurations.v1, {
                    headers: {
                        'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                        'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
                    }
                });

                if (response.ok) {
                    let result = await response.json();
                    let itemRow = JSON.parse(result.value);
                    // Lower case all properties
                    // https://codereview.stackexchange.com/questions/162416/object-keys-to-lowercase
                    item = Object.keys(itemRow.Data.Row[0]).reduce((c, k) => (c[k] = itemRow.Data.Row[0][k], c), {});
                }
                else {
                    throw response.statusText;
                }

            } catch (error) {
                const errorMessage = error ? error.message : `Failed to resolve page tokens`;
                Log.error(TokenService_ServiceKey, new Error(`Error: '${error}'`), this.serviceScope);
                throw new Error(errorMessage);
            }
        }

        return item;
    }

    /**
     * Retrieve all current user profile properties
     */
    public async getUserProfileProperties(): Promise<IProfileProperties> {

        let responseJson = null;
        let userProperties: IProfileProperties = {};
        const endpoint = `${this.pageContext.web.absoluteUrl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`;
        const response = await this.spHttpClient.get(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
            }
        });

        if (response.ok) {
            responseJson = await response.json();

            if (responseJson.UserProfileProperties) {

                responseJson.UserProfileProperties.forEach(property => {
                    userProperties[property.Key.toLowerCase()] = property.Value;
                });
            }

            return userProperties;

        } else {

            const errorMessage = `${TokenService_ServiceKey}: Error retrieving user profiel properties. Details: ${(response as any).statusMessage ? (response as any).statusMessage : response.status}`;
            const error = new Error(errorMessage);

            Log.error(TokenService_ServiceKey, error, this.serviceScope);
            throw error;
        }
    }

    /**
     * Resolve current page values from tokens
     * @param inputString the input string containing tokens
     */
    private async replacePageTokens(inputString: string): Promise<string> {

        const pageTokenRegExp: RegExp = /\{(?:Page)\.(.*?)\}/gi;
        let matches = pageTokenRegExp.exec(inputString);
        let item = {};

        // Make a check to the listItem property in the case we are in the hosted workbench
        if (matches != null && this.pageContext.listItem) {

            let pageItem = this.currentPageItem;

            if (!pageItem) {
                // Get page properties dymamically
                pageItem = await this.getPageProperties();
            }

            let properties = Object.keys(pageItem);
            properties.forEach(property => {
                item[property] = pageItem[property];
            });

            item = this.recursivelyLowercaseJSONKeys(item);

            while (matches !== null && item != null) {

                const pageProperty = matches[1];
                let itemProp: string = ''; // Return an empty string when not found instead of undefined since this value will be translated as text

                if (/\.Label|\.TermID/gi.test(pageProperty)) {

                    let term = pageProperty.split(".");
                    let columnName = term[0].toLowerCase();
                    let labelOrTermId = term[1].toLowerCase();

                    // Handle multi or single taxonomy values
                    if (Array.isArray(item[columnName]) && item[columnName].length > 0) {

                        // By convention, multi values should be separated by a comma, which is the default array delimiter for the array toString() method
                        // This value could be processed in the replaceOrOperator() method so we need to keep the same delimiter convention
                        itemProp = item[columnName].map(taxonomyValue => {
                            return taxonomyValue[labelOrTermId]; // Use the 'TermId' or 'Label' properties
                        }).join(',');
                    }
                    else if (!Array.isArray(item[columnName]) && item[columnName] !== undefined && item[columnName] !== "") {
                        itemProp = item[columnName][labelOrTermId];
                    }

                } else {

                    // Return the property as is
                    itemProp = ObjectHelper.byPath(item, pageProperty.toLowerCase());
                }

                inputString = inputString.replace(matches[0], itemProp);
                matches = pageTokenRegExp.exec(inputString);
            }
        }

        return inputString;
    }

    /**
     * Resolve current page context related tokens
     * @param inputString the input string containing tokens
     */
    private replacePageContextTokens(inputString: string): string {

        const siteRegExp = /\{(?:PageContext)\.(.*?)\}/gi;
        let matches = siteRegExp.exec(inputString);

        if (matches != null) {

            while (matches !== null) {
                const prop = matches[1];
                inputString = inputString.replace(new RegExp(matches[0], "gi"), this.pageContext ? ObjectHelper.byPath(this.pageContext, prop) : '');
                matches = siteRegExp.exec(inputString);
            }
        }

        return inputString;
    }

    /**
     * Resolve current user property values from tokens
     * @param inputString the input string containing tokens
     */
    private async replaceUserTokens(inputString: string): Promise<string> {

        const userTokenRegExp: RegExp = /\{(?:User)\.(.*?)\}/gi;
        let matches = userTokenRegExp.exec(inputString.toLowerCase());

        // Browse matched tokens
        while (matches !== null) {

            let userProperty = matches[1].toLowerCase();
            let propertyValue = null;

            // Check if other user profile properties have to be retrieved
            if (!/^(name|email)$/gi.test(userProperty)) {

                // Check if the user profile api was already called
                if (!this.userProperties) {
                    this.userProperties = await this.getUserProfileProperties();
                }

                propertyValue = this.userProperties[userProperty] ? this.userProperties[userProperty] : '';

            } else {

                switch (userProperty) {

                    case "email":
                        propertyValue = this.pageContext.user.email;
                        break;

                    case "name":
                        propertyValue = this.pageContext.user.displayName;
                        break;
                    default:
                        propertyValue = this.pageContext.user.displayName;
                        break;
                }
            }

            const tokenExprToReplace = new RegExp(matches[0], 'gi');

            // Replace the match with the property value
            inputString = inputString.replace(tokenExprToReplace, propertyValue);

            // Look for other tokens
            matches = userTokenRegExp.exec(inputString);
        }

        inputString = inputString.replace(new RegExp("\{Me\}", 'gi'), this.pageContext.user.displayName);

        return inputString;
    }

    /**
     * Resolve date related tokens
     * @param inputString the input string containing tokens
     */
    private replaceDateTokens(inputString: string): string {

        const currentDate = /\{CurrentDate\}/gi;
        const currentMonth = /\{CurrentMonth\}/gi;
        const currentYear = /\{CurrentYear\}/gi;

        // Replaces any "{Today} +/- [digit]" expression
        let results = /\{Today\}\s*[\+-]\s*\[{0,1}\d{1,}\]{0,1}/gi.exec(inputString);

        if (results != null) {
            for (let result of results) {

                const operator = result.indexOf('+') !== -1 ? '+' : '-';
                const addOrRemove = operator == '+' ? 1 : -1;
                const operatorSplit = result.split(operator);
                const digit = parseInt(operatorSplit[operatorSplit.length - 1].replace("{", "").replace("}", "").trim()) * addOrRemove;
                let dt = new Date();
                dt.setDate(dt.getDate() + digit);
                const formatDate = this.moment(dt).format("YYYY-MM-DDTHH:mm:ss\\Z");
                inputString = inputString.replace(result, formatDate);
            }
        }

        // Replaces any "{Today}" expression by it's actual value
        let formattedDate = this.moment(new Date()).format("YYYY-MM-DDTHH:mm:ss\\Z");
        inputString = inputString.replace(new RegExp("{Today}", 'gi'), formattedDate);

        const d = new Date();
        inputString = inputString.replace(currentDate, d.getDate().toString());
        inputString = inputString.replace(currentMonth, (d.getMonth() + 1).toString());
        inputString = inputString.replace(currentYear, d.getFullYear().toString());

        return inputString;
    }

    /**
     * Resolve query string related tokens
     * @param inputString the input string containing tokens
     */
    private replaceQueryStringTokens(inputString: string) {

        const webRegExp = /\{(?:QueryString)\.(.*?)\}/gi;
        let modifiedString = inputString;
        let matches = webRegExp.exec(inputString);

        if (matches != null) {
            const queryParameters = new UrlQueryParameterCollection(window.location.href);

            while (matches !== null) {
                const qsProp = matches[1];
                const itemProp = decodeURIComponent(queryParameters.getValue(qsProp) || "");
                modifiedString = modifiedString.replace(new RegExp(matches[0], "gi"), itemProp);
                matches = webRegExp.exec(inputString);
            }
        }
        return modifiedString;
    }

    /**
     * Resolve current web related tokens
     * @param inputString the input string containing tokens
     */
    private replaceWebTokens(inputString: string): string {

        const queryStringVariables = /\{(?:Web)\.(.*?)\}/gi;
        let matches = queryStringVariables.exec(inputString);

        if (matches != null) {

            while (matches !== null) {
                const webProp = matches[1];
                inputString = inputString.replace(new RegExp(matches[0], "gi"), this.pageContext.web ? this.pageContext.web[webProp] : '');
                matches = queryStringVariables.exec(inputString);
            }
        }

        return inputString;
    }

    /**
     * Resolve current site related tokens
     * @param inputString the input string containing tokens
     */
    private replaceSiteTokens(inputString: string): string {

        const siteRegExp = /\{(?:Site)\.(.*?)\}/gi;
        let matches = siteRegExp.exec(inputString);

        if (matches != null) {

            while (matches !== null) {
                const siteProp = matches[1];
                inputString = inputString.replace(new RegExp(matches[0], "gi"), this.pageContext.site ? ObjectHelper.byPath(this.pageContext.site, siteProp) : '');
                matches = siteRegExp.exec(inputString);
            }
        }

        return inputString;
    }

    /**
     * Resolve current hub site related tokens
     * @param inputString the input string containing tokens
     */
    private async replaceHubTokens(inputString: string): Promise<string> {

        const hubRegExp = /\{(?:Hub)\.(.*?)\}/gi;
        let matches = hubRegExp.exec(inputString);

        // Get hub info
        const hubInfos = await this.getHubInfo();

        if (matches != null && hubInfos) {

            while (matches !== null) {
                const hubProp = matches[1];
                inputString = inputString.replace(new RegExp(matches[0], "gi"), hubInfos[hubProp]);
                matches = hubRegExp.exec(inputString);
            }
        }

        return inputString;
    }

    /**
     * Resolve current Office 365 group related tokens
     * @param inputString the input string containing tokens
     */
    private replaceGroupTokens(inputString: string): string {

        const groupRegExp = /\{(?:Group)\.(.*?)\}/gi;
        let matches = groupRegExp.exec(inputString);

        if (matches != null) {

            while (matches !== null) {
                const groupProp = matches[1];
                inputString = inputString.replace(new RegExp(matches[0], "gi"), this.pageContext.site.group ? ObjectHelper.byPath(this.pageContext.site.group, groupProp) : '');
                matches = groupRegExp.exec(inputString);
            }
        }

        return inputString;
    }

    /**
     * Resolve current list related tokens
     * @param inputString the input string containing tokens
     */
    private replaceListTokens(inputString: string): string {
        const listRegExp = /\{(?:List)\.(.*?)\}/gi;
        let matches = listRegExp.exec(inputString);

        if (matches != null) {

            while (matches !== null) {
                const listProp = matches[1];
                inputString = inputString.replace(new RegExp(matches[0], "gi"), this.pageContext.list ? ObjectHelper.byPath(this.pageContext.list, listProp) : '');
                matches = listRegExp.exec(inputString);
            }
        }

        return inputString;
    }

    /**
     * Resolve legacy page tokens
     * @param inputString the input string containing tokens
     */
    private replaceLegacyPageContextTokens(inputString: string): string {

        const legacyPageContextRegExp = /\{(?:LegacyPageContext)\.(.*?)\}/gi;
        let matches = legacyPageContextRegExp.exec(inputString);

        if (matches != null) {

            while (matches !== null) {
                const legacyProp = matches[1];
                inputString = inputString.replace(new RegExp(matches[0], "gi"), this.pageContext.legacyPageContext ? ObjectHelper.byPath(this.pageContext.legacyPageContext, legacyProp) : '');
                matches = legacyPageContextRegExp.exec(inputString);
            }
        }

        return inputString;
    }

    private replaceOrOperator(inputString: string) {

        // Example match: {|owstaxidmetadataalltagsinfo:{Page.<TaxnomyProperty>.TermID}}
        const orConditionTokens = /\{(?:\|(.+?)(>=|=|<=|:|<>|<|>))(\{?.*?\}?\s*)\}/gi;
        let reQueryTemplate = inputString;
        let match = orConditionTokens.exec(inputString);

        if (match != null) {
            while (match !== null) {

                let conditions = [];
                const property = match[1];
                const operator = match[2];
                const tokenValue = match[3];

                // {User} tokens are resolved server-side by SharePoint so we exclude them
                if (!/\{(?:User)\.(.*?)\}/gi.test(tokenValue)) {
                    const allValues = tokenValue.split(','); // Works with taxonomy multi values (TermID, Label) + multi choices fields
                    if (allValues.length > 0) {
                        allValues.forEach(value => {
                            conditions.push(`(${property}${operator}${/\s/g.test(value) ? `"${value}"` : value})`);
                        });
                    } else {
                        conditions.push(`${property}${operator}${/\s/g.test(tokenValue) ? `"${tokenValue}"` : tokenValue})`);
                    }

                    inputString = inputString.replace(match[0], `(${conditions.join(' OR ')})`);
                }

                match = orConditionTokens.exec(reQueryTemplate);
            }
        }

        return inputString;
    }

    /**
     * Get hub site data
     */
    public async getHubInfo(): Promise<any> {

        try {

            const restUrl = `${this.pageContext.site.absoluteUrl}/_api/site?$select=IsHubSite,HubSiteId,Id`;
            const data = await this.spHttpClient.get(restUrl, SPHttpClient.configurations.v1, {
                headers: {
                    'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                    'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
                }
            });

            if (data && data.ok) {
                const jsonData = await data.json();
                if (jsonData) {
                    return jsonData;
                }
            }

            return null;
        } catch (error) {

            Log.error(TokenService_ServiceKey, new Error(`Error while fetching Hub site data. Details: ${error}`), this.serviceScope);
            return null;
        }
    }

    /**
     * Recursively lower case object keys
     * https://github.com/Vin65/recursive-lowercase-json/blob/master/src/index.js
     * @param obj the JSON object
     */
    private recursivelyLowercaseJSONKeys(obj) {

        const copyOfObj = obj;
        if (typeof copyOfObj !== 'object' || copyOfObj === null) {
            return copyOfObj;
        }

        if (Array.isArray(copyOfObj)) {
            return copyOfObj.map(o => this.recursivelyLowercaseJSONKeys(o));
        }

        return Object.keys(copyOfObj).reduce((prev, curr) => {
            prev[curr.toLowerCase()] = this.recursivelyLowercaseJSONKeys(copyOfObj[curr]);
            return prev;
        }, {});
    }
}