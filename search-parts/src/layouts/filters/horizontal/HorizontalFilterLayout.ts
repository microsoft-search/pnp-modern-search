
import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneSlider } from "@microsoft/sp-property-pane";
import * as strings from 'CommonStrings';

export interface IHorizontalLayoutProperties {

    /**
     * The prefered number of cards per row
     */
    preferedFilterNumberPerRow: number;

    /**
     * The card size in %
     */
    columnSizePercentage: number;
}

export class HorizontalFilterLayout extends BaseLayout<IHorizontalLayoutProperties> {

    public async onInit(): Promise<void> {

        // Setup default values
        this.properties.preferedFilterNumberPerRow = this.properties.preferedFilterNumberPerRow ? this.properties.preferedFilterNumberPerRow : 3;
        this.properties.columnSizePercentage = this.properties.columnSizePercentage ? this.properties.columnSizePercentage : 33; 
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        return [
            PropertyPaneSlider('layoutProperties.preferedFilterNumberPerRow', {
                label: strings.Layouts.Horizontal.PreferedFilterNumberPerRow,
                min: 1,
                max: 6,
                step: 1,
                showValue: true,
                value: this.properties.preferedFilterNumberPerRow,                
            })              
        ];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any) {
        
        if (propertyPath.localeCompare('layoutProperties.preferedFilterNumberPerRow') === 0) {
            // Calculate the correct % for card flex-basis
            this.properties.columnSizePercentage = Math.floor(100 /newValue)-1;
        }
    }
}