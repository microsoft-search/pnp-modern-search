import { template } from "lodash";
import { IHandlebarsColumnConfiguration } from "../models/common/IHandlebarsColumnConfiguration";
import { IDataResultsTemplateContext } from "../models/common/ITemplateContext";
import { ObjectHelper } from "./ObjectHelper";

export class HandlebarsHelper {

  /**
   * The isolated Handlebars namespace 
   */
  handlebars: typeof Handlebars;

  public static getColumnValue(column: IHandlebarsColumnConfiguration, item: any, templateContext: IDataResultsTemplateContext, handlebars: typeof Handlebars, valueFallbackOnError?: (error: any) => string, options?: CompileOptions): { value: any, hasError: boolean } {

    return this.getColumnValueWithHandler(column, item, () => 
        this.getHandleBarsTemplateContentValue(column.value, item, templateContext, handlebars, options), 
        valueFallbackOnError);
  }

  
  public static getColumnValueWithHandler(column: IHandlebarsColumnConfiguration, item: any, 
    handlebarsHandler: () =>  string, valueFallbackOnError?: (error: any) => string): { value: any, hasError: boolean } {

    let hasError = false;
    let value: any;
    // Check if the value in an Handlebars expression
    if (column.useHandlebarsExpr && column.value) {
      try {
        value = handlebarsHandler();
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

    let template = this.getHandleBarsTemplate(columnValue, handlebars, options);

    return this.getHandleBarsContentValue(item, templateContext, template);
  }

  public static getHandleBarsContentValue(item: any, templateContext: IDataResultsTemplateContext, template: HandlebarsTemplateDelegate<any>): string {

    let exprValue: string = null;

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

  public static getHandleBarsTemplate(columnValue: string, handlebars: typeof Handlebars, options?: CompileOptions) : HandlebarsTemplateDelegate<any>
  {
      // Create a temp context with the current so we can use global registered helper on the current item
      const tempTemplateContent = `{{#with item as |item|}}${columnValue}{{/with}}`;
      return handlebars.compile(tempTemplateContent, options);
  }
}
