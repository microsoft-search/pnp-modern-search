import ISearchResultsTemplateContext from './ISearchResultsTemplateContext';
import { TemplateService } from               '../../../../services/TemplateService/TemplateService';

interface ISearchResultsTemplateProps {

    /**
     * The template helper instance
     */
    templateService: TemplateService;
    
    /**
     * The template context
     */
    templateContext: ISearchResultsTemplateContext;

    /**
     * The Handlebars raw template content for a single item
     */
    templateContent: string;

    /**
     * The Web Part instance ID
     */
    instanceId: string;
}

export default ISearchResultsTemplateProps;