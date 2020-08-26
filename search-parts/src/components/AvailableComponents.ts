import { IExtension } from 'search-extensibility';
import { DebugViewWebComponent } from './search-results/DebugViewComponent';
import { DetailsListWebComponent } from './search-results/DetailsListComponent';
import { DocumentCardWebComponent, VideoCardWebComponent } from './search-results/DocumentCardComponent';
import { DocumentCardShimmersWebComponent } from './search-results/DocumentCardShimmersComponent'; 
import { SliderWebComponent } from './search-results/SliderComponent';
import { PersonaCardWebComponent } from './search-results/PersonaCardComponent';
import { LivePersonaWebComponent } from './search-results/LivePersonaComponent';
import { PersonaCardShimmersWebComponent } from './search-results/PersonaCardShimmersComponent';
import { IconWebComponent } from './search-results/IconComponent';
import { PaginationWebComponent } from './search-results/PaginationComponent';
import { AccordionWebComponent } from './search-results/AccordionComponent';
import { PopupWebComponent } from './search-results/PopupComponent';
import { LookupListExpanderWebComponent } from './search-results/LookupListExpanderComponent';
import { FilterCheckboxWebComponent } from './search-refiners/FilterCheckbox';

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
        },
        {
            name: 'pnp-accordion',
            extensionClass: AccordionWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-popup',
            extensionClass: PopupWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-lookup-list-expander',
            extensionClass: LookupListExpanderWebComponent,
            displayName: "", description: "", icon: ""
        },
        {
            name: 'pnp-filter-checkbox',
            extensionClass: FilterCheckboxWebComponent,
            displayName: "", description: "", icon: ""
        }
    ];
}