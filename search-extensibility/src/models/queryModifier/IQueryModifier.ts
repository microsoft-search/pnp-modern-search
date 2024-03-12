import { IPropertyPaneGroup } from "@microsoft/sp-property-pane";
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IQueryModifier {
  /**
   * The Web Part properties in the property bag. Corresponds to the isolated 'queryModifierProperties' property in the global property bag.
   */
  properties: any;

  /**
   * Context of the main Web Part
   */
  context: WebPartContext;

  /**
    * Flag to indicate that no further transformation ist necessary when the query was transformed
    * This is checked only on a transformed query and not when a Modifier didn't change the query
  */
  endWhenSuccessfull: boolean;

  /**
   * Method called during the Web Part initialization.
   */
  onInit(): void | Promise<void>;

  /**
   * Modify the querytext and retrieve it
   * @param queryText the querytext   
   */
  modifyQuery(queryText: string): Promise<string>;

  /**
   * Returns the data source property pane option fields if any.
   */
  getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[];

  /**
   * Method called when a property pane field in changed in the Web Part.
   * @param propertyPath the property path.
   * @param oldValue the old value.
   * @param newValue the new value.
   */
  onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void;
}