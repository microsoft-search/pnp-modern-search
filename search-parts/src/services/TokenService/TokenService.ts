import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { Text, Log } from "@microsoft/sp-core-library";
import { ITokenService } from ".";
import { UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import { PageContext } from "@microsoft/sp-page-context";
import { isEmpty } from '@microsoft/sp-lodash-subset';

const LOG_SOURCE: string = '[SearchResultsWebPart_{0}]';

export class TokenService implements ITokenService {
    private _pageContext: PageContext;
    private _spHttpClient: SPHttpClient;

    constructor(pageContext: PageContext, spHttpClient: SPHttpClient) {
        this._pageContext = pageContext;
        this._spHttpClient = spHttpClient;
    }

    public async replaceQueryVariables(queryTemplate: string): Promise<string> {
        queryTemplate = await this.replacePageTokens(queryTemplate);
        queryTemplate = this.replaceDateTokens(queryTemplate);
        queryTemplate = this.replaceQueryStringTokens(queryTemplate);
        queryTemplate = this.replaceHubSiteTokens(queryTemplate);
        queryTemplate = this.replaceOrOperator(queryTemplate);
        queryTemplate = this.replaceUrlTokens(queryTemplate);

        queryTemplate = queryTemplate.replace("{TenantUrl}", `https://` + window.location.host);

        return queryTemplate;
    }

    private async replacePageTokens(queryTemplate: string) {
        const pagePropsVariables = /\{(?:Page)\.(.*?)\}/gi;
        let reQueryTemplate = queryTemplate;
        let match = pagePropsVariables.exec(reQueryTemplate);
        let item = null;
        if (match != null) {
            let url = this._pageContext.web.absoluteUrl + `/_api/web/GetList(@v1)/RenderExtendedListFormData(itemId=${this._pageContext.listItem.id},formId='viewform',mode='2',options=7)?@v1='${this._pageContext.list.serverRelativeUrl}'`;
            var client = this._spHttpClient;
            try {
                const response: SPHttpClientResponse = await client.post(url, SPHttpClient.configurations.v1, {});
                if (response.ok) {
                    let result = await response.json();
                    let itemRow = JSON.parse(result.value);
                    item = Object.keys(itemRow.Data.Row[0]).reduce((c, k) => (c[k.toLowerCase()] = itemRow.Data.Row[0][k], c), {});
                }
                else {
                    throw response.statusText;
                }
            }
            catch (error) {
                Log.error(Text.format(LOG_SOURCE, "RenderExtendedListFormData"), error);
            }
            while (match !== null && item != null) {
                // matched variable
                let pageProp = match[1];
                let itemProp: string = "";
                if (pageProp.indexOf(".Label") !== -1 || pageProp.indexOf(".TermID") !== -1) {
                    let term = pageProp.split(".");
                    let columnName = term[0].toLowerCase();
                    // Handle multi or single values
                    if (Array.isArray(item[columnName]) && item[columnName].length > 0) {
                        itemProp = item[columnName].map(e => { 

                            // #0 is to be able to search for this ID in taxonomy typed managed properties ('i.e ows_taxId_<xxx>')
                            return term[1] === "TermID" ? `#0${e[term[1]]}` : e[term[1]]; 
                        
                        }).join(',');
                    }
                    else if (!Array.isArray(item[columnName]) && item[columnName] !== undefined && item[columnName] !== "") {
                        itemProp = item[columnName][term[1]];
                    }
                }
                else if (item[pageProp.toLowerCase()] !== undefined) {
                    itemProp = item[pageProp.toLowerCase()];
                }
                if (itemProp && itemProp.indexOf(' ') !== -1) {
                    // add quotes to multi term values
                    itemProp = `"${itemProp}"`;
                }
                queryTemplate = queryTemplate.replace(match[0], itemProp);
                match = pagePropsVariables.exec(reQueryTemplate);
            }
        }
        return queryTemplate;
    }

    private replaceDateTokens(queryTemplate: string) {
        const currentDate = /\{CurrentDate\}/gi;
        const currentMonth = /\{CurrentMonth\}/gi;
        const currentYear = /\{CurrentYear\}/gi;
        const d = new Date();
        queryTemplate = queryTemplate.replace(currentDate, d.getDate().toString());
        queryTemplate = queryTemplate.replace(currentMonth, (d.getMonth() + 1).toString());
        queryTemplate = queryTemplate.replace(currentYear, d.getFullYear().toString());
        return queryTemplate;
    }

    private replaceUrlTokens(queryTemplate: string) {
        const url = new URL(window.location.href);
        const urlParts = url.pathname.split('/').reverse();

        const queryStringVariables = /\{(?:URLToken)\.(\d+)\}/gi;
        let reQueryTemplate = queryTemplate;
        let match = queryStringVariables.exec(reQueryTemplate);

        if (match != null) {
            while (match !== null) {
                let urlTokenPos = parseInt(match[1]);
                let tokenValue = '';
                let index = (urlTokenPos-1) < 0 ? 0 : (urlTokenPos-1);
                if (!isEmpty(urlParts[index])) {
                    tokenValue = urlParts[index];
                    queryTemplate = queryTemplate.replace(match[0], tokenValue);
                }
                match = queryStringVariables.exec(queryTemplate);
            }
        }

        return queryTemplate;
    }

    private replaceQueryStringTokens(queryTemplate: string) {
        const queryStringVariables = /\{(?:QueryString)\.(.*?)\}/gi;
        let reQueryTemplate = queryTemplate;
        let match = queryStringVariables.exec(reQueryTemplate);
        if (match != null) {
            var queryParameters = new UrlQueryParameterCollection(window.location.href);
            while (match !== null) {
                let qsProp = match[1];
                let itemProp = decodeURIComponent(queryParameters.getValue(qsProp) || "");
                queryTemplate = queryTemplate.replace(match[0], itemProp);
                match = queryStringVariables.exec(reQueryTemplate);
            }
        }
        return queryTemplate;
    }

    private replaceHubSiteTokens(queryTemplate: string) {
        const queryStringVariables = /\{(?:PageContext)\.(.*?)\}/gi;
        let reQueryTemplate = queryTemplate;
        let match = queryStringVariables.exec(reQueryTemplate);
        if (match != null) {
            while (match !== null) {
                let pageContextProp = match[1];
                queryTemplate = queryTemplate.replace(match[0], this._pageContext.legacyPageContext[pageContextProp] || '');
                match = queryStringVariables.exec(reQueryTemplate);
            }
        }
        return queryTemplate;
    }

    private replaceOrOperator(queryTemplate: string) {

        // Example match: {|owstaxidmetadataalltagsinfo:{Page.<TaxnomyProperty>.TermID}}
        const orConditionTokens = /\{(?:\|(.+?)(>=|=|<=|:|<>|<|>))(\{?.*?\}?\s*)\}/gi;
        let reQueryTemplate = queryTemplate;
        let match = orConditionTokens.exec(queryTemplate);        

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
                        allValues.map(value => {
                            conditions.push(`(${property}${operator}${/\s/g.test(value) ? `"${value}"` : value})`);
                        });
                    } else {
                        conditions.push(`${property}${operator}${/\s/g.test(tokenValue) ? `"${tokenValue}"` : tokenValue})`);
                    }

                    queryTemplate = queryTemplate.replace(match[0], `(${conditions.join(' OR ')})`);
                }

                match = orConditionTokens.exec(reQueryTemplate);
            }
        }

        return queryTemplate;
    }
}