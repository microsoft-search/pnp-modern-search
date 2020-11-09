import { IComponentDefinition } from '@pnp/modern-search-extensibility';
import { DebugViewWebComponent } from './DebugViewComponent';
import { DetailsListWebComponent } from './DetailsListComponent';
import { FileIconWebComponent } from './FileIconComponent';
import { IconWebComponent } from './IconComponent';
import { DocumentCardWebComponent } from './DocumentCardComponent';
import { DocumentCardShimmersWebComponent } from './DocumentCardShimmersComponent'; 
import { SliderWebComponent } from './SliderComponent';
import { FilePreviewWebComponent } from './FilePreviewComponent';
import { PaginationWebComponent } from './PaginationComponent';
import { FilterCheckBoxWebComponent } from './filters/FilterCheckBoxComponent';
import { PanelWebComponent } from './PanelComponent';
import { FilterMultiWebComponent } from './filters/FilterMultiComponent';
import { SelectedFiltersWebComponent } from './filters/SelectedFiltersComponent';
import { CollapsibleContentWebComponent } from './CollapsibleContentComponent';
import { FilterDateRangeWebComponent } from './filters/FilterDateRangeComponent';
import { FilterComboBoxWebComponent } from './filters/FilterComboBoxComponent';
import { FilterDateIntervalWebComponent } from './filters/FilterDateIntervalComponent';
import { PersonaWebComponent } from './PersonaComponent';
import { PersonaShimmersWebComponent } from './PersonaShimmersComponent';

export class AvailableComponents {

    /**
     * Returns the list of builtin web components available for Handlebars templates
     */
    public static BuiltinComponents: IComponentDefinition<any>[] = [
        {
            componentName: 'pnp-debugview',
            componentClass: DebugViewWebComponent
        },
        {
            componentName: 'pnp-detailslist',
            componentClass: DetailsListWebComponent
        },
        {
            componentName: 'pnp-iconfile',
            componentClass: FileIconWebComponent
        },
        {
            componentName: 'pnp-documentcard',
            componentClass: DocumentCardWebComponent
        },
        {
            componentName: 'pnp-documentcardshimmers',
            componentClass: DocumentCardShimmersWebComponent
        },
        {
            componentName: 'pnp-slider',
            componentClass: SliderWebComponent
        },
        {
            componentName: 'pnp-filepreview',
            componentClass: FilePreviewWebComponent
        },
        {
            componentName: 'pnp-icon',
            componentClass: IconWebComponent
        },
        {
            componentName: 'pnp-pagination',
            componentClass: PaginationWebComponent
        },
        {
            componentName: 'pnp-filtercheckbox',
            componentClass: FilterCheckBoxWebComponent
        },
        {
            componentName: 'pnp-panel',
            componentClass: PanelWebComponent
        },
        {
            componentName: 'pnp-filtermultiselect',
            componentClass: FilterMultiWebComponent
        },
        {
            componentName: 'pnp-selectedfilters',
            componentClass: SelectedFiltersWebComponent
        },
        {
            componentName: 'pnp-collapsible',
            componentClass: CollapsibleContentWebComponent
        },
        {
            componentName: 'pnp-filterdaterange',
            componentClass: FilterDateRangeWebComponent
        },
        {
            componentName: 'pnp-filterdateinterval',
            componentClass: FilterDateIntervalWebComponent
        },
        {
            componentName: 'pnp-filtercombobox',
            componentClass: FilterComboBoxWebComponent
        },
        {
            componentName: 'pnp-persona',
            componentClass: PersonaWebComponent
        },
        {
            componentName: 'pnp-personashimmers',
            componentClass: PersonaShimmersWebComponent
        }
    ];
}