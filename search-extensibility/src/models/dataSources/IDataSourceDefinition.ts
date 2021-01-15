import { IDataSource } from "./IDataSource";
import { ServiceKey } from '@microsoft/sp-core-library';

export interface IDataSourceDefinition {
    
    /**
     * The data source friendly name that will be displayed in the property pane options
     */
    name: string;

    /**
     * The data source unique key
     */
    key: string;

    /**
     * The Office UI Fabric icon name
     * See https://developer.microsoft.com/en-us/fabric#/styles/web/icons
     */
    iconName: string;

    /**
     * The data source service key
     */
    serviceKey: ServiceKey<IDataSource>;
}