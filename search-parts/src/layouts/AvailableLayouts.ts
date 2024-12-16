/* eslint-disable @typescript-eslint/no-var-requires */
import { ILayoutDefinition, LayoutRenderType, LayoutType } from "@pnp/modern-search-extensibility";
import * as strings from 'CommonStrings';
import DetailsListContent from './results/detailsList/details-list.html';
import CardsContent from './results/cards/cards.html';
import SliderContent from './results/slider/slider.html';
import SimpleListContent from './results/simpleList/simple-list.html';
import PeopleContent from './results/people/people.html';
import VerticalContent from './filters/vertical/vertical.html';
import HorizontalContent from './filters/horizontal/horizontal.html';
import PanelContent from './filters/panel/panel.html';
import FiltersDebugContent from './filters/debug/filters-debug.html';
import FiltersCustomContent from './filters/custom/filters-custom.html';
import ResultsDebugContent from './results/debug/results-debug.html';
import ResultsCustomContent from './results/custom/results-custom.html';

export enum BuiltinLayoutsKeys {
    ResultsDebug = 'ResultsDebug',
    FiltersDebug = 'FiltersDebug',
    ResultsCustomHandlebars = 'ResultsCustom',
    ResultsCustomAdaptiveCards = 'ResultsCustomAdaptiveCards',
    FiltersCustom = 'FiltersCustom',
    DetailsList = 'DetailsList',
    Cards = 'Cards',
    Slider = 'Slider',
    SimpleList = 'SimpleList',
    People = 'People',
    Vertical = 'Vertical',
    Horizontal = 'Horizontal',
    Panel = 'Panel',
    ListAdaptiveCards = 'ListAdaptiveCards'
}

export class AvailableLayouts {

    /**
     * Returns the list of builtin data sources for the Search Results
     */
    public static BuiltinLayouts: ILayoutDefinition[] = [
        {
            name: strings.Layouts.Vertical.Name,
            key: BuiltinLayoutsKeys.Vertical.toString(),
            iconName: 'GripperBarVertical',
            type: LayoutType.Filter,
            templateContent: VerticalContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Horizontal.Name,
            key: BuiltinLayoutsKeys.Horizontal.toString(),
            iconName: 'GripperBarHorizontal',
            type: LayoutType.Filter,
            templateContent: HorizontalContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Panel.Name,
            key: BuiltinLayoutsKeys.Panel.toString(),
            iconName: 'ClosePane',
            type: LayoutType.Filter,
            templateContent: PanelContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Debug.Name,
            iconName: 'Code',
            key: BuiltinLayoutsKeys.FiltersDebug.toString(),
            type: LayoutType.Filter,
            templateContent: FiltersDebugContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.CustomHandlebars.Name,
            key: BuiltinLayoutsKeys.FiltersCustom.toString(),
            iconName: 'CodeEdit',
            type: LayoutType.Filter,
            templateContent: FiltersCustomContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.DetailsList.Name,
            iconName: 'Table',
            key: BuiltinLayoutsKeys.DetailsList,
            type: LayoutType.Results,
            templateContent: DetailsListContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null// ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Cards.Name,
            key: BuiltinLayoutsKeys.Cards.toString(),
            iconName: 'Tiles',
            type: LayoutType.Results,
            templateContent: CardsContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Slider.Name,
            key: BuiltinLayoutsKeys.Slider.toString(),
            iconName: 'Slideshow',
            type: LayoutType.Results,
            templateContent: SliderContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.SimpleList.Name,
            key: BuiltinLayoutsKeys.SimpleList.toString(),
            iconName: 'List',
            type: LayoutType.Results,
            templateContent: SimpleListContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Debug.Name,
            iconName: 'Code',
            key: BuiltinLayoutsKeys.ResultsDebug.toString(),
            type: LayoutType.Results,
            templateContent: ResultsDebugContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.CustomHandlebars.Name,
            key: BuiltinLayoutsKeys.ResultsCustomHandlebars.toString(),
            iconName: 'CodeEdit',
            type: LayoutType.Results,
            templateContent: ResultsCustomContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
                {
            name: strings.Layouts.SimpleList.Name,
            key: BuiltinLayoutsKeys.ListAdaptiveCards.toString(),
            iconName: 'List',
            type: LayoutType.Results,
            templateContent: JSON.stringify(require('./results/simpleList/simple-list.json'), null, "\t"),
            renderType: LayoutRenderType.AdaptiveCards,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.CustomAdaptiveCards.Name,
            key: BuiltinLayoutsKeys.ResultsCustomAdaptiveCards.toString(),
            iconName: 'CodeEdit',
            type: LayoutType.Results,
            templateContent: JSON.stringify(require('./results/custom/results-custom.json'), null, "\t"),
            renderType: LayoutRenderType.AdaptiveCards,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.People.Name,
            key: BuiltinLayoutsKeys.People.toString(),
            iconName: 'People',
            type: LayoutType.Results,
            templateContent: PeopleContent,
            renderType: LayoutRenderType.Handlebars,
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        }
    ];
}