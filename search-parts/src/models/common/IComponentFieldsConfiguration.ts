import { IHandlebarsColumnConfiguration } from "./IHandlebarsColumnConfiguration";

export interface IComponentFieldsConfiguration extends IHandlebarsColumnConfiguration {

    /**
     * The field name for the inner component props
     */
    field: string;

    /**
     * Indicates if the field supports HTML markup injection
     */
    supportHtml: boolean;
}