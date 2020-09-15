import ResultsLayoutOption from '../../models/ResultsLayoutOption';
import { DynamicProperty } from '@microsoft/sp-component-base';
import { ISortFieldConfiguration } from '../../models/ISortFieldConfiguration';
import ISortableFieldConfiguration from '../../models/ISortableFieldConfiguration';
import { ISearchResultType } from '../../models/ISearchResultType';
import { ICustomTemplateFieldValue } from '../../services/ResultService/ResultService';
import { ISynonymFieldConfiguration} from '../../models/ISynonymFieldConfiguration';
import IQueryModifierConfiguration from '../../models/IQueryModifierConfiguration';
import { IExtension } from 'search-extensibility';
import { IPagingSettings } from '../../models/IPagingSettings';

export interface ISearchResultsWebPartProps {
    // specific to all search datasources
    queryKeywords: DynamicProperty<string>;
    queryTemplate: string;
    defaultSearchQuery: string;
    useDefaultSearchQuery: boolean;
    searchQueryLanguage: number;
    enableLocalization: boolean;
    
    // new properties to help with dynamic data source
    searchDataSource:string;
    searchDataSourceParameters: { [key:string]:any };

    /*
    * Eliminate these in version 6, here for backwards compatability to support upgrade
    *   These properties support SharePoint search and will be moved into 
    *   the search datasource parameters property
    */
    resultSourceId: string;
    enableQueryRules: boolean;
    includeOneDriveResults: boolean;
    
    // template and UI properties
    showResultsCount: boolean;
    showBlank: boolean;
    selectedLayout: ResultsLayoutOption;
    externalTemplateUrl: string;
    inlineTemplateText: string;
    webPartTitle: string;
    resultTypes: ISearchResultType[];
    rendererId: string;
    customTemplateFieldValues: ICustomTemplateFieldValue[];
    templateParameters: { [key:string]: any };

    // generic settings
    selectedProperties: string;
    sortList: ISortFieldConfiguration[];
    sortableFields: ISortableFieldConfiguration[];
    useRefiners: boolean;
    useSearchVerticals: boolean;
    refinerDataSourceReference: string;
    searchVerticalDataSourceReference: string;
    paginationDataSourceReference: string;
    synonymList: ISynonymFieldConfiguration[];
    queryModifiers: IQueryModifierConfiguration[];
    selectedQueryModifierDisplayName: string;
    refinementFilters: string;
    extensibilityLibraries: string[];

    /**
     * The Web Part paging settings
     */
    paging: IPagingSettings;

}
