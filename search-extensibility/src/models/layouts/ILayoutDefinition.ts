import { ServiceKey } from '@microsoft/sp-core-library';
import { ILayout } from './ILayout';

export interface ILayoutDefinition {

    /**
     * The layout friendly name
     */
    name: string;

    /**
     * The layout unique key
     */
    key: string;

    /**
     * The layout type (Results, Filter)
     */
    type: LayoutType;

    /**
     * The Office UI Fabric icon name
     * See https://developer.microsoft.com/en-us/fabric#/styles/web/icons
     */
    iconName: string;

    /**
     * The template HTML content. You can use the require('<relative_path_to_your_html_file') here
     */
    templateContent: string;

    /**
     * The layout service key
     */
    serviceKey: ServiceKey<ILayout>;
}

export enum LayoutType {
    Results = 'ResultsLayout',
    Filter = 'FiltersLayout'
}
