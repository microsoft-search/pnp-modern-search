export interface IDataResultType {

    /**
     * The property name (i.e data source field)
     */
    property: string;

    /**
     * Operator to use
     */
    operator: ResultTypeOperator;

    /**
     * The value of the field
     */
    value: string;

    /**
     * The templat to display if the condition is matched
     */
    inlineTemplateContent: string;

    /**
     * An external template URL
     */
    externalTemplateUrl: string;
}

/**
 * Corresponds to Handlebars operators
 */
export enum ResultTypeOperator {
    Equal = 'eq',
    NotEqual = 'isnt',
    LessThan = 'lt',
    GreaterThan = 'gt',
    LessOrEqual = 'lte',
    GreaterOrEqual = 'gte',
    Contains = 'contains',
    StartsWith = 'startsWith',
    NotNull = 'if',
}