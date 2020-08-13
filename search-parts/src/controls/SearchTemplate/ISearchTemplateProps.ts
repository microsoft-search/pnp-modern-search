import { TemplateService } from               '../../services/TemplateService/TemplateService';

interface ISearchTemplateProps<Context extends object> {

    /**
     * The template helper instance
     */
    templateService: TemplateService;
    
    /**
     * The template context
     */
    templateContext: Context;

    /**
     * The Handlebars raw template content for a single item
     */
    templateContent: string;

    /**
     * The Web Part instance ID
     */
    instanceId: string;

}

export default ISearchTemplateProps;