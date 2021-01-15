export interface IComponentFieldsConfiguration {

    /**
     * The name of the field
     */
    name: string;

    /**
     * The field name for the inner component props
     */
    field: string;

    /**
     * The value of the field
     */
    value: string;

    /**
     * Indicates if the calue is an Handlebars expression
     */
    useHandlebarsExpr: boolean;

    /**
     * Indicates if the field supports HTML markup injection
     */
    supportHtml: boolean;
}