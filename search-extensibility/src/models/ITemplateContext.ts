export interface ITemplateContext {
    processTemplate(templateContext:any, templateContent:string) : Promise<string>;
}