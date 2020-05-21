import { IExtension } from 'search-extensibility';
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
    public static BuiltinComponents: IExtension<any>[] = [
        {
            name: 'pnp-document-card',
            extensionClass: DocumentCardWebComponent,
            displayName: "Document Card",
            description: "Document card used in search results.",
            icon:""
        },
        {
            name: 'pnp-document-card-shimmers',
            extensionClass: DocumentCardShimmersWebComponent,
            displayName: "Document Card Shimmer",
            description: "The document card shimmer component",
            icon: ""

        },
        {
            name: 'pnp-details-list',
            extensionClass: DetailsListWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-video-card',
            extensionClass: VideoCardWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-debug-view',
            extensionClass: DebugViewWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-slider-component',
            extensionClass: SliderWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-persona-card',
            extensionClass: PersonaCardWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-persona-card-shimmers',
            extensionClass: PersonaCardShimmersWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-live-persona',
            extensionClass: LivePersonaWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-fabric-icon',
            extensionClass: IconWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-pagination',
            extensionClass: PaginationWebComponent,
            displayName: "", description: "", icon: ""
        }
    ];
}