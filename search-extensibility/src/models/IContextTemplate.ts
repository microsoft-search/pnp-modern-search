export interface IContextTemplate {
    processTemplate(templateContext:any, templateContent:string) : Promise<string>;
}