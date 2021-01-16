import { IComponentDefinition } from "@pnp/modern-search-extensibility";
import { IDataResultType } from "../../models/common/IDataResultType";
import { IComponentFieldsConfiguration } from "../../models/common/IComponentFieldsConfiguration";
import { IDataResultsTemplateContext } from "../../models/common/ITemplateContext";

export interface ITemplateService {
    Handlebars: typeof Handlebars;
    getTemplateMarkup(templateContent: string): string;
    getPlaceholderMarkup(templateContent: string): string;
    getFileContent(fileUrl: string): Promise<string>;
    ensureFileResolves(fileUrl: string): Promise<void>;
    isValidTemplateFile(filePath: string): boolean;
    processTemplate(templateContext: any, templateContent: string): Promise<string>;
    registerWebComponents(webComponents: IComponentDefinition<any>[]): Promise<void>;
    processFieldsConfiguration<T>(fieldsConfiguration: IComponentFieldsConfiguration[], item: {[key:string]: any}, context?: IDataResultsTemplateContext | any): T;
    registerResultTypes(resultTypes: IDataResultType[]): Promise<void>;
}