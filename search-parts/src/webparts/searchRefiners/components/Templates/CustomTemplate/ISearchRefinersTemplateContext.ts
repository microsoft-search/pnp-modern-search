import { IRefinerConfiguration, IRefinementResult, IRefinementValue, RefinerTemplateOption } from 'search-extensibility';
import { IReadonlyTheme } from "@microsoft/sp-component-base";

/**
 * Handlebars template context for search results
 */
interface ISearchRefinersTemplateContext {
    key: number;
    configuration: IRefinerConfiguration;
    refiners: IRefinementResult;
    selectedRefiners: IRefinementValue[];
    valueToRemove: IRefinementValue;
    templateType: RefinerTemplateOption;
    strings: ISearchRefinersWebPartStrings;
    siteUrl?: string;
    webUrl?: string;
    instanceId:string;
    themeVariant:IReadonlyTheme;
    shouldResetFilters: boolean;
    language:string;
}

export default ISearchRefinersTemplateContext;