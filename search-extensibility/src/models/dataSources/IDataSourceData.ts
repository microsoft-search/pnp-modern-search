import { IDataFilterResult } from '../filters/IDataFilter';
import { IResultTemplates } from './IResultTemplates';

export interface IDataSourceData {

    /**
     * Items returned by the data source.
     */
    items: any[];

    /**
     * Any other property returned by the data source to be used in the Handlebars template context.
     */
    [key: string]: any;

    /**
     * The available filters provided by the data source according to the filters configuration provided from the data context (if applicable).
     */
    filters?: IDataFilterResult[];

    /**
     * Result templates available for items provided by the data source
     */
    resultTemplates?: IResultTemplates;
}