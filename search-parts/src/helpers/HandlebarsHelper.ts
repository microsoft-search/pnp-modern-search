import { IHandlebarsColumnConfiguration } from "../models/common/IHandlebarsColumnConfiguration";
import { IDataResultsTemplateContext } from "../models/common/ITemplateContext";
import { ObjectHelper } from "./ObjectHelper";

export class HandlebarsHelper {

  /**
   * The isolated Handlebars namespace 
   */
  handlebars: typeof Handlebars;

  public static getColumnValue(column: IHandlebarsColumnConfiguration, item: any, templateContext: IDataResultsTemplateContext, handlebars: typeof Handlebars, valueFallbackOnError?: (error: any) => string, options?: CompileOptions): { value: any, hasError: boolean } {

    let hasError = false;
    let value: any;
    // Check if the value in an Handlebars expression
    if (column.useHandlebarsExpr && column.value) {
      try {
        value = this.getHandleBarsTemplateContentValue(column.value, item, templateContext, handlebars, options);
      } catch (error) {
        hasError = true;
        if (valueFallbackOnError)
          value = valueFallbackOnError(error);
      }
    } else {

      // A field has been selected
      value = ObjectHelper.byPath(item, column.value);
    }
    return { value, hasError };
  }

  public static getHandleBarsTemplateContentValue(columnValue: string, item: any, templateContext: IDataResultsTemplateContext, handlebars: typeof Handlebars, options?: CompileOptions): string {

    let exprValue: string = null;

    // Create a temp context with the current so we can use global registered helper on the current item
    const tempTemplateContent = `{{#with item as |item|}}${columnValue}{{/with}}`;
    let template = handlebars.compile(tempTemplateContent, options);

    // Pass the current item as context
    exprValue = template(
      {
        item: item
      },
      {
        data: {
          root: {
            ...templateContext
          }
        }
      }
    );
    exprValue = exprValue ? exprValue.trim() : null;

    return exprValue;
  }
}
