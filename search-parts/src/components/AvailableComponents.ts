import { IComponentDefinition } from "../services/ExtensibilityService/IComponentDefinition";
import { DebugViewWebComponent } from './DebugViewComponent';
import { DetailsListWebComponent } from './DetailsListComponent';
import { DocumentCardWebComponent, VideoCardWebComponent } from './DocumentCardComponent';
import { DocumentCardShimmersWebComponent } from './DocumentCardShimmersComponent'; 
import { SliderWebComponent } from './SliderComponent';
import { PersonaCardWebComponent } from './PersonaCardComponent';
import { LivePersonaWebComponent } from './LivePersonaComponent';
import { PersonaCardShimmersWebComponent } from './PersonaCardShimmersComponent';
import { IconWebComponent } from './IconComponent';
import { PaginationWebComponent } from './PaginationComponent';

export class AvailableComponents {

    /**
     * Returns the list of builtin web components available for Handlebars templates
     */
    public static BuiltinComponents: IComponentDefinition<any>[] = [
        {
            componentName: 'pnp-document-card',
            componentClass: DocumentCardWebComponent
        },
        {
            componentName: 'pnp-document-card-shimmers',
            componentClass: DocumentCardShimmersWebComponent
        },
        {
            componentName: 'pnp-details-list',
            componentClass: DetailsListWebComponent
        },
        {
            componentName: 'pnp-video-card',
            componentClass: VideoCardWebComponent
        },
        {
            componentName: 'pnp-debug-view',
            componentClass: DebugViewWebComponent
        },
        {
            componentName: 'pnp-slider-component',
            componentClass: SliderWebComponent
        },
        {
            componentName: 'pnp-persona-card',
            componentClass: PersonaCardWebComponent
        },
        {
            componentName: 'pnp-persona-card-shimmers',
            componentClass: PersonaCardShimmersWebComponent
        },
        {
            componentName: 'pnp-live-persona',
            componentClass: LivePersonaWebComponent
        },
        {
            componentName: 'pnp-fabric-icon',
            componentClass: IconWebComponent
        },
        {
            componentName: 'pnp-pagination',
            componentClass: PaginationWebComponent
        }
    ];
}