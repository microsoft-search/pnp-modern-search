import { ILayoutDefinition, LayoutType } from "@pnp/modern-search-extensibility";
import * as strings from 'CommonStrings';

export enum BuiltinLayoutsKeys {
    ResultsDebug = 'ResultsDebug',
    FiltersDebug = 'FiltersDebug',
    ResultsCustom = 'ResultsCustom',
    FiltersCustom = 'FiltersCustom',
    DetailsList = 'DetailsList',
    Cards = 'Cards',
    Slider = 'Slider',
    SimpleList = 'SimpleList',
    People = 'People',
    Vertical = 'Vertical',
    Horizontal = 'Horizontal',
    Panel = 'Panel'
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
            templateContent: require('./filters/vertical/vertical.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Horizontal.Name,
            key: BuiltinLayoutsKeys.Horizontal.toString(),
            iconName: 'GripperBarHorizontal',
            type: LayoutType.Filter,
            templateContent: require('./filters/horizontal/horizontal.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Panel.Name,
            key: BuiltinLayoutsKeys.Panel.toString(),
            iconName: 'ClosePane',
            type: LayoutType.Filter,
            templateContent: require('./filters/panel/panel.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Debug.Name,
            iconName: 'Code',
            key: BuiltinLayoutsKeys.FiltersDebug.toString(),
            type: LayoutType.Filter,
            templateContent: require('./filters/debug/filters-debug.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Custom.Name,
            key: BuiltinLayoutsKeys.FiltersCustom.toString(),
            iconName: 'CodeEdit',
            type: LayoutType.Filter,
            templateContent: require('./filters/custom/filters-custom.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.DetailsList.Name,
            iconName: 'Table',
            key: BuiltinLayoutsKeys.DetailsList,
            type: LayoutType.Results,
            templateContent: require('./results/detailsList/details-list.html'),
            serviceKey: null// ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Cards.Name,
            key: BuiltinLayoutsKeys.Cards.toString(),
            iconName: 'Tiles',
            type: LayoutType.Results,
            templateContent: require('./results/cards/cards.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Slider.Name,
            key: BuiltinLayoutsKeys.Slider.toString(),
            iconName: 'Slideshow',
            type: LayoutType.Results,
            templateContent: require('./results/slider/slider.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.SimpleList.Name,
            key: BuiltinLayoutsKeys.SimpleList.toString(),
            iconName: 'List',
            type: LayoutType.Results,
            templateContent: require('./results/simpleList/simple-list.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Debug.Name,
            iconName: 'Code',
            key: BuiltinLayoutsKeys.ResultsDebug.toString(),
            type: LayoutType.Results,
            templateContent: require('./results/debug/results-debug.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.Custom.Name,
            key: BuiltinLayoutsKeys.ResultsCustom.toString(),
            iconName: 'CodeEdit',
            type: LayoutType.Results,
            templateContent: require('./results/custom/results-custom.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        },
        {
            name: strings.Layouts.People.Name,
            key: BuiltinLayoutsKeys.People.toString(),
            iconName: 'People',
            type: LayoutType.Results,
            templateContent: require('./results/people/people.html'),
            serviceKey: null // ServiceKey will be created dynamically for builtin layout
        }
    ];
}