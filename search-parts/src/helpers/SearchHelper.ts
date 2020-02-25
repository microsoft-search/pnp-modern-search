import { IRefinementFilter, IRefinementValue, RefinementOperator } from "../models/ISearchResult";
import { UrlHelper } from "./UrlHelper";
import IRefinerConfiguration from "../models/IRefinerConfiguration";
import RefinerTemplateOption from "../models/RefinerTemplateOption";

export interface IUrlFilter {
    n: string;
    o: RefinementOperator;
    t: string | string[];
}

export class SearchHelper {

   /**
    * Build the refinement condition in FQL format
    * @param selectedFilters The selected filter array
    * @param encodeTokens If true, encodes the taxonomy refinement tokens in UTF-8 to work with GET requests. Javascript encodes natively in UTF-16 by default.
    */
   public static buildRefinementQueryString(selectedFilters: IRefinementFilter[], encodeTokens?: boolean): string[] {

       let refinementQueryConditions: string[] = [];

       selectedFilters.map(filter => {
           if (filter.Values.length > 1) {

               // A refiner can have multiple values selected in a multi or mon multi selection scenario
               // The correct operator is determined by the refiner display template according to its behavior
               const conditions = filter.Values.map(value => {

                   return /ǂǂ/.test(value.RefinementToken) && encodeTokens ? encodeURIComponent(value.RefinementToken) : value.RefinementToken;
               });
               refinementQueryConditions.push(`${filter.FilterName}:${filter.Operator}(${conditions.join(',')})`);
           } else {
               if (filter.Values.length === 1) {

                   // See https://sharepoint.stackexchange.com/questions/258081/how-to-hex-encode-refiners/258161
                   let refinementToken = /ǂǂ/.test(filter.Values[0].RefinementToken) && encodeTokens ? encodeURIComponent(filter.Values[0].RefinementToken) : filter.Values[0].RefinementToken;
                   refinementQueryConditions.push(`${filter.FilterName}:${refinementToken}`);
               }
           }
       });

       return refinementQueryConditions;
   }

    /**
     * Get the default pre-selected filters based on the url parameters
     */
    public static getRefinementFiltersFromUrl(): IRefinementFilter[] {
        const refinementFilters: IRefinementFilter[] = [];

        // Get and parse filters param for url
        const urlParamValue = UrlHelper.getQueryStringParam("filters", window.location.href);
        const urlFilters: IUrlFilter[] = JSON.parse(decodeURIComponent(urlParamValue));

        // Return if url param is not found
        if (!urlFilters) return refinementFilters;

        urlFilters.map((filter: IUrlFilter) => {

            // Map to refinementFilters if:
            //  -filterName is provided
            //  -filterValues are provided
            //  -filter configuration is found
            if (
                filter.n &&
                filter.t
            ) {
                // Get configuration
                const refinerConfiguration: IRefinerConfiguration = refinersConfiguration.filter(
                    (refiner: IRefinerConfiguration) => refiner.refinerName === filter.n
                )[0];

                // Map filter values
                let filterValues: IRefinementValue[] = [];
                switch (refinerConfiguration.template) {
                    case RefinerTemplateOption.CheckBox:
                    case RefinerTemplateOption.CheckBoxMulti:
                        filterValues = this._getStringFilterValues(filter.t);
                        break;
                    case RefinerTemplateOption.DateRange:
                        filterValues = this._getDateRangeFilterValues(filter.n, filter.t);
                        break;
                    case RefinerTemplateOption.FixedDateRange:
                        filterValues = this._getDateIntervalFilterValues(filter.n, filter.t);
                        break;
                    default:
                        break;
                }

                // Get operator
                //  -if provided in Url, use that one
                //  -otherwise, get based on configured template
                const filterOperator: RefinementOperator = filter.o
                    ? filter.o
                    : this._getFilterOperatorFromConfig(refinerConfiguration);

                refinementFilters.push({
                    FilterName: filter.n,
                    Operator: filterOperator,
                    Values: filterValues
                });
            }
        });

        return refinementFilters;
    }

    /**
     * Converst the filter value from the url to a date range refinement value
     * @param filterName the filter name provided in the url
     * @param filterValue the filter value provided in the url (has a set of possible values)
     */
    private static _getDateIntervalFilterValues(filterName: string, filterValue: string | string[]): IRefinementValue[] {
        const filterValues: IRefinementValue[] = [];
        // The following values are accepted
        //  -yesterday
        //  -weekAgo
        //  -monthAgo
        //  -threeMonthsAgo
        //  -yearAgo
        //  -olderThanYear
        if (typeof filterValue === "string") {
            const value: IRefinementValue = {
                RefinementCount: 0,
                RefinementName: filterName,
                RefinementToken: "",
                RefinementValue: filterValue
            };

            switch (filterValue) {
                case "yesterday":
                    value.RefinementToken = `range(${this._getISOPastDate(1)},max)`;
                    break;
                case "weekAgo":
                    value.RefinementToken = `range(${this._getISOPastDate(7)},max)`;
                    break;
                case "monthAgo":
                    value.RefinementToken = `range(${this._getISOPastDate(30)},max)`;
                    break;
                case "threeMonthsAgo":
                    value.RefinementToken = `range(${this._getISOPastDate(90)},max)`;
                    break;
                case "yearAgo":
                    value.RefinementToken = `range(${this._getISOPastDate(365)},max)`;
                    break;
                case "olderThanYear":
                    value.RefinementToken = `range(min,${this._getISOPastDate(365)})`;
                    break;
                default:
                    return filterValues;
            }

            filterValues.push(value);
        }

        return filterValues;
    }

    /**
     * Converst the filter value from the url to a date range refinement value
     * @param filterName the filter name provided in the url
     * @param filterValue the filter value provided in the url
     */
    private static _getDateRangeFilterValues(filterName: string, filterValue: string | string[]): IRefinementValue[] {
        const filterValues: IRefinementValue[] = [];

        // For dates we expect a 'range(date 1,date 2)' format
        //  -Date 1: Should be an ISO formatted UTC date OR min
        //  -Date 2: Should be an ISO formatted UTC date OR max
        if (typeof filterValue === "string") {
            const matches = filterValue.match(/(?<=range\().+?(?=\))/g);
            if (matches) {
                matches.forEach((match: string) => {
                    console.log(match);
                    filterValues.push({
                        RefinementCount: 0,
                        RefinementName: filterName,
                        RefinementToken: filterValue,
                        RefinementValue: filterValue
                    });
                });
            }
        }

        return filterValues;
    }

    /**
     * Converts the string or array of strings to a valide refinement value
     * @param filterValue as string of array of strings of the refiner value provided in the url
     */
    private static _getStringFilterValues(filterValue: string | string[]): IRefinementValue[] {
        const filterValues: IRefinementValue[] = [];
        if (typeof filterValue === "string") {
            filterValues.push({
                RefinementCount: 0,
                RefinementName: filterValue,
                RefinementToken: `"ǂǂ${this._getRefinerTokenValue(filterValue)}"`,
                RefinementValue: filterValue
            });
        } else {
            filterValue.forEach((value: string) => {
                filterValues.push({
                    RefinementCount: 0,
                    RefinementName: value,
                    RefinementToken: `"ǂǂ${this._getRefinerTokenValue(value)}"`,
                    RefinementValue: value
                });
            });
        }

        return filterValues;
    }
    private static _getRefinerTokenValue(value: string): string {
        let tokenValue = "";
        for (let i = 0; i < value.length; i++) {
            const charCode = value.charCodeAt(i);
            tokenValue += charCode.toString(16);
        }
        return tokenValue;
    }
    private static _getFilterOperatorFromConfig(refinerConfiguration: IRefinerConfiguration): RefinementOperator {
        switch (refinerConfiguration.template) {
            case RefinerTemplateOption.CheckBox:
            case RefinerTemplateOption.FixedDateRange:
                return RefinementOperator.AND;
            case RefinerTemplateOption.CheckBoxMulti:
            case RefinerTemplateOption.DateRange:
                return RefinementOperator.OR;
            default:
                return RefinementOperator.AND;
        }
    }
    private static _getISOPastDate(daysToSubstract: number): string {
        return new Date((new Date() as any) - 1000 * 60 * 60 * 24 * daysToSubstract).toISOString();
    }
}