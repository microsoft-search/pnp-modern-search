import { LayoutRenderType } from "@pnp/modern-search-extensibility";
import { ITemplateService } from "../../services/templateService/ITemplateService";

interface ITemplateRendererProps {

    instanceId: string;

    /**
     * The template context
     */
    templateContext: any;

    /**
     * The Handlebars raw template content for a single item
     */
    templateContent: string;

    /**
     * A template service instance
     */
    templateService: ITemplateService;

    /**
     * The layout render type (Handlebars, Adaptive Cards, etc.)
     */
    renderType: LayoutRenderType;
}

export default ITemplateRendererProps;