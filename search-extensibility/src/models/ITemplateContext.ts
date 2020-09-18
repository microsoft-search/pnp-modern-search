export interface ITemplateContext {
    Handlebars:any;
    Moment:any;
    processTemplate(templateContext:any, templateContent:string) : Promise<string>;
    isValidTemplateFile(filePath:string): Promise<string>;
}