export interface IHandlebarsColumnConfiguration {

  /**
   * The name of the column
   */
  name: string;

  /**
   * The value of the column
   */
  value: string;

  /**
   * Indicates if the value is an Handlebars expression
   */
  useHandlebarsExpr: boolean;
}
