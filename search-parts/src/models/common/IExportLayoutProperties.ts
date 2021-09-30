import { IExportColumnConfiguration } from "./IExportColumnConfiguration";

export interface IExportLayoutProperties {

    /**
     * If we should enable export of results set
     */
     enableExport: boolean;

    /**
     * The export columns configuration
     */
    exportColumns: IExportColumnConfiguration[];
}