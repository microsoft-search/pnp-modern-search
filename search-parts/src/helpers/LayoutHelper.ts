import { ILayoutDefinition, ILayout, BaseLayout } from '@pnp/modern-search-extensibility';
import { BuiltinLayoutsKeys } from '../layouts/AvailableLayouts';
import { ServiceKey, ServiceScope, Text } from '@microsoft/sp-core-library';
import { ServiceScopeHelper } from './ServiceScopeHelper';
import { IPropertyPaneChoiceGroupOption } from '@microsoft/sp-property-pane';
import ISearchFiltersWebPartProps from '../webparts/searchFilters/ISearchFiltersWebPartProps';
import ISearchResultsWebPartProps from '../webparts/searchResults/ISearchResultsWebPartProps';
import * as commonStrings from 'CommonStrings';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export class LayoutHelper {

    /**
     * Gets the layout instance according to the current selected one
     * @param rootScope the root service scope
     * @param context the Web Part context
     * @param properties the web part properties (only supported Web Parts)
     * @param layoutKey the selected layout key
     * @param layoutDefinitions the available layout definitions
     * @returns the data source provider instance
     */
    public static async getLayoutInstance(rootScope: ServiceScope, context: WebPartContext, properties: ISearchFiltersWebPartProps | ISearchResultsWebPartProps, layoutKey: string, layoutDefinitions: ILayoutDefinition[]): Promise<ILayout> {

        let layout: ILayout = undefined;
        let serviceKey: ServiceKey<ILayout> = undefined;

        if (layoutKey) {

            // If it is a builtin layout, we load the corresponding known class file asynchronously for performance purpose
            // We also create the service key at the same time to be able to get an instance
            switch (layoutKey) {

                // Details List
                case BuiltinLayoutsKeys.DetailsList:

                    const { DetailsListLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-detailslist-layout' */
                        '../layouts/results/detailsList/DetailListLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchDetailsListLayout', DetailsListLayout);
                    break;

                // Results Debug
                case BuiltinLayoutsKeys.ResultsDebug:

                    const { ResultsDebugLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-debug-layout' */
                        '../layouts/results/debug/ResultsDebugLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchResultsDebugLayout', ResultsDebugLayout);
                    break;
                
                // Filters Debug
                case BuiltinLayoutsKeys.FiltersDebug:

                    const { DebugFilterLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-filters-debug-layout' */
                        '../layouts/filters/debug/DebugFilterLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchFiltersDebugLayout', DebugFilterLayout);
                    break;

                // Results Custom (Handlebars)
                case BuiltinLayoutsKeys.ResultsCustomHandlebars :

                    const { ResultsCustomLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-custom-layout' */
                        '../layouts/results/custom/ResultsCustomLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchResultsCustomLayout', ResultsCustomLayout);
                    break;

                // Results Custom (Adaptive Cards)
                case BuiltinLayoutsKeys.ResultsCustomAdaptiveCards: {

                    /* tslint:disable:no-shadowed-variable */
                    const { ResultsCustomLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-custom-layout' */
                        '../layouts/results/custom/ResultsCustomLayout'
                    );
                    /* tslint:enable:no-shadowed-variable */

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchResultsCustomLayout', ResultsCustomLayout);
                    break;
                }

                // Filters Custom
                case BuiltinLayoutsKeys.FiltersCustom:

                    const { FiltersCustomLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-filters-custom-layout' */
                        '../layouts/filters/custom/FiltersCustomLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchFiltersCustomLayout', FiltersCustomLayout);
                    break;

                // Cards
                case BuiltinLayoutsKeys.Cards:

                    const { CardsLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-cards-layout' */
                        '../layouts/results/cards/CardsLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchCardsLayout', CardsLayout);
                    break;

                // Slider
                case BuiltinLayoutsKeys.Slider:

                    const { SliderLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-slider-layout' */
                        '../layouts/results/slider/SliderLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchSliderLayout', SliderLayout);
                    break;

                // Simple List (Handlebars)
                case BuiltinLayoutsKeys.SimpleList:

                    const { SimpleListLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-simple-list-layout' */
                        '../layouts/results/simpleList/SimpleListLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchSimpleListLayout', SimpleListLayout);
                    break;

                // Simple List (Adaptive cards)
                case BuiltinLayoutsKeys.ListAdaptiveCards: {

                    /* tslint:disable:no-shadowed-variable */
                    const { SimpleListLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-simple-list-layout' */
                        '../layouts/results/simpleList/SimpleListLayout'
                    );
                    /* tslint:enable:no-shadowed-variable */

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchSimpleListLayout', SimpleListLayout);
                    break;
                }
                
                // People
                case BuiltinLayoutsKeys.People:

                    const { PeopleLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-results-people-layout' */
                        '../layouts/results/people/PeopleLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchPeopleLayout', PeopleLayout);
                    break;

                // Vertical
                case BuiltinLayoutsKeys.Vertical:

                    const { VerticalFilterLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-filters-vertical-layout' */
                        '../layouts/filters/vertical/VerticalFilterLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchVerticalLayout', VerticalFilterLayout);
                    break;

                // Horizontal
                case BuiltinLayoutsKeys.Horizontal:

                    const { HorizontalFilterLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-filters-horizontal-layout' */
                        '../layouts/filters/horizontal/HorizontalFilterLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchHorizontalFilterLayout', HorizontalFilterLayout);
                    break;
                
                // Panel
                case BuiltinLayoutsKeys.Panel:

                    const { PanelFilterLayout } = await import(
                        /* webpackChunkName: 'pnp-modern-search-filters-panel-layout' */
                        '../layouts/filters/panel/PanelFilterLayout'
                    );

                    serviceKey = ServiceKey.create<ILayout>('PnPModernSearchPanelLayout', PanelFilterLayout);
                    break;

                // Custom layout scenario
                default:
                    // Gets the registered service key according to the selected layou definition 
                    const matchingDefinitions = layoutDefinitions.filter((layoutDefinition) => { return layoutDefinition.key === layoutKey; });
                                
                    // Can only have one layout instance per key
                    if (matchingDefinitions.length > 0) {
                        serviceKey = matchingDefinitions[0].serviceKey;
                    } else {
                        // Case when the extensibility library is removed from the catalog or the configuration
                        throw new Error(Text.format(commonStrings.General.Extensibility.LayoutDefinitionNotFound, layoutKey));
                    }

                    break;
            }

            return new Promise<ILayout>((resolve, reject) => {

                // Register the layout service in the Web Part scope only (child scope of the current scope)
                const childServiceScope = ServiceScopeHelper.registerChildServices(rootScope, [serviceKey]);

                childServiceScope.whenFinished(async () => {

                    layout = childServiceScope.consume<ILayout>(serviceKey);

                    // Verifiy if the layout implements correctly the ILayout interface and BaseLayout methods
                    const isValidLayout = (layoutInstance: ILayout): layoutInstance is BaseLayout<any> => {
                        return (
                            (layoutInstance as BaseLayout<any>).getPropertyPaneFieldsConfiguration !== undefined &&
                            (layoutInstance as BaseLayout<any>).onInit !== undefined &&
                            (layoutInstance as BaseLayout<any>).onPropertyUpdate !== undefined
                        );
                    };

                    if (!isValidLayout(layout)) {
                        reject(new Error(Text.format(commonStrings.General.Extensibility.InvalidLayoutInstance, layoutKey)));
                    }

                    // Initialize the layout with current Web Part properties
                    if (layout) {

                        layout.properties = properties.layoutProperties; // Web Parts using layouts must define this sub property
                        layout.context = context;
                        await layout.onInit();
                        resolve(layout);
                    }
                });
            });
        }
    }

    /**
     * Builds the layout options list from available layouts
     */
    public static getLayoutOptions(availableLayoutDefinitions: ILayoutDefinition[]): IPropertyPaneChoiceGroupOption[] {

        let layoutOptions: IPropertyPaneChoiceGroupOption[] = [];
        
        availableLayoutDefinitions.forEach((layout) => {
            layoutOptions.push({
                iconProps: {
                    officeFabricIconFontName: layout.iconName
                },
                imageSize: {
                    width: 200,
                    height: 100
                },
                key: layout.key,
                text: layout.name,
            });
        });

        return layoutOptions;
    }
}