import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneToggle, PropertyPaneSlider } from "@microsoft/sp-property-pane";
import * as strings from 'CommonStrings';
import { ISliderOptions } from "../../../components/SliderComponent";

export interface ISliderLayoutProperties {

    /**
     * The slider options
     */
    sliderOptions: ISliderOptions;

    /**
     * The slide height in px
     */
    slideHeight: number;

    /**
     * The slide width in px
     */
    slideWidth: number;
}

export class SliderLayout extends BaseLayout<ISliderLayoutProperties> {

    public async onInit(): Promise<void> {

        // Setup default values
        this.properties.sliderOptions = this.properties.sliderOptions ? this.properties.sliderOptions : {
            autoPlay: true,
            autoPlayDuration: 3,
            pauseAutoPlayOnHover: true,
            numberOfSlides: 3,
            showPageDots: true,
            wrapAround: false,
        };

        this.properties.slideHeight = this.properties.slideHeight ? this.properties.slideHeight : 360;
        this.properties.slideWidth = this.properties.slideWidth ? this.properties.slideWidth : 318;
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        let groupFields: IPropertyPaneField<any>[] = [
            PropertyPaneToggle('layoutProperties.sliderOptions.autoPlay', {
                label: strings.Layouts.Slider.SliderAutoPlay,                
                checked: this.properties.sliderOptions.autoPlay
            })
        ];

        if (this.properties.sliderOptions.autoPlay) {

            const autoPlayFields = [
                PropertyPaneSlider('layoutProperties.sliderOptions.autoPlayDuration', {
                    label: strings.Layouts.Slider.SliderAutoPlayDuration, 
                    min: 1,
                    max: 60,
                    showValue: true,
                    step: 1            
                }),
                PropertyPaneToggle('layoutProperties.sliderOptions.pauseAutoPlayOnHover', {
                    label: strings.Layouts.Slider.SliderPauseAutoPlayOnHover,              
                    checked: this.properties.sliderOptions.pauseAutoPlayOnHover
                })
            ];

            groupFields = groupFields.concat(autoPlayFields);
        }

        groupFields = groupFields.concat([
            PropertyPaneSlider('layoutProperties.sliderOptions.numberOfSlides', {
                label: strings.Layouts.Slider.SliderGroupCells,  
                min: 1,
                max: 5,
                showValue: true,
                step: 1            
            }),
            PropertyPaneToggle('layoutProperties.sliderOptions.showPageDots', {
                label: strings.Layouts.Slider.SliderShowPageDots,               
                checked: this.properties.sliderOptions.showPageDots
            }),
            PropertyPaneToggle('layoutProperties.sliderOptions.wrapAround', {
                label: strings.Layouts.Slider.SliderWrapAround,               
                checked: this.properties.sliderOptions.wrapAround
            }),
            PropertyPaneSlider('layoutProperties.slideHeight', {
                label: strings.Layouts.Slider.SlideHeight,               
                max: 600,
                min: 120,
                step: 1,
                showValue: true
            }),
            PropertyPaneSlider('layoutProperties.slideWidth', {
                label: strings.Layouts.Slider.SlideWidth,               
                max: 600,
                min: 120,
                step: 1,
                showValue: true
            })
        ]);

        return groupFields;
    }
}