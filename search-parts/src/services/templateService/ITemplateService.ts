import { IComponentDefinition, IExtensibilityLibrary, LayoutRenderType } from "@pnp/modern-search-extensibility";
import { IDataResultType } from "../../models/common/IDataResultType";
import { IComponentFieldsConfiguration } from "../../models/common/IComponentFieldsConfiguration";
import { ISearchResultsTemplateContext } from "../../models/common/ITemplateContext";

export enum FileFormat {
    Text,
    Json
}

export interface ITemplateService {
    Handlebars: typeof Handlebars;
    AdaptiveCardsExtensibilityLibraries: IExtensibilityLibrary[];
    getTemplateMarkup(templateContent: string): string;
    getPlaceholderMarkup(templateContent: string): string;
    getFileContent(fileUrl: string, fileFormat: FileFormat): Promise<string>;
    ensureFileResolves(fileUrl: string): Promise<void>;
    isValidTemplateFile(filePath: string, validExtensions: string[]): boolean;
    processTemplate(templateContext: any, templateContent: string, renderType: LayoutRenderType): Promise<string | HTMLElement>;
    registerWebComponents(webComponents: IComponentDefinition<any>[], instanceId: string): Promise<void>;
    processFieldsConfiguration<T>(fieldsConfiguration: IComponentFieldsConfiguration[], item: {[key:string]: any}, context?: ISearchResultsTemplateContext | any): T;
    registerResultTypes(resultTypes: IDataResultType[]): Promise<void>;
}