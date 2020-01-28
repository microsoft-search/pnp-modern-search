import { DynamicProperty } from "@microsoft/sp-component-base";
import IDataSourceProperty from "../../models/IDataSourceProperty";

export default interface IDynamicDataService {
    getAvailableDataSourcesByType(propertyId: string): IDataSourceProperty[];
}