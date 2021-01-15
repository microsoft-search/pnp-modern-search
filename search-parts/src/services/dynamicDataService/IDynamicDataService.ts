import IDataSourceProperty from "../../models/dynamicData/IDynamicDataSourceProperty";
import { DynamicDataProvider } from "@microsoft/sp-component-base";

export default interface IDynamicDataService {
    dynamicDataProvider: DynamicDataProvider;
    getAvailableDataSourcesByType(propertyId: string): Promise<IDataSourceProperty[]>;
}