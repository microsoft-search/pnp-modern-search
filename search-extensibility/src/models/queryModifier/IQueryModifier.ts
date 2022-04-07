import { IPropertyPaneGroup } from "@microsoft/sp-property-pane";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IDataContext } from "../dataSources/IDataContext";
import { IQueryModification } from "./IQueryModification";
import { IQueryModifierInput } from "./IQueryModifierInput";

export interface IQueryModifier {
    /**
     * TODO TODO TODO
     * The Web Part properties in the property bag. Corresponds to the isolated 'suggestionsProperties' property in the global property bag.
     */
     properties: any;

     /**
      * Context of the main Web Part
      */
     context: WebPartContext;
 
     /**
      * Method called during the Web Part initialization.
      */
     onInit(): void | Promise<void>;
 
     /**
      * Modify the query and retrieve it
      * @param searchQuery the query % the query template
      */               
     modifyQuery(searchQuery: IQueryModifierInput, dataContext:IDataContext): Promise<IQueryModification>;

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