"use client";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Handlebars from 'handlebars';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { isEmpty } from "@microsoft/sp-lodash-subset";
import { Carousel, CarouselButtonsLocation, CarouselButtonsDisplay } from "@pnp/spfx-controls-react/lib/Carousel";
import * as DOMPurify from "isomorphic-dompurify";
import { ITemplateService } from '../services/templateService/ITemplateService';
import { TemplateService } from '../services/templateService/TemplateService';
import { DomPurifyHelper } from '../helpers/DomPurifyHelper';
import { ServiceScope, ServiceKey } from "@microsoft/sp-core-library";
import { Constants } from '../common/Constants';
import './SliderComponent.module.scss';

export interface ISliderOptions {

    /**
     * The number of slides to display
     */
    numberOfSlides?: number;

    /**
     * Indicates if the slider should auto play
     */
    autoPlay?: boolean;

    /**
     * The auto play duration
     */
    autoPlayDuration?: number;

    /**
     * If pause on hover
     */
    pauseAutoPlayOnHover?: boolean;

    /**
     * Indicates if the slider should page dots
     */
    showPageDots?: boolean;

    /**
     * At the end of cells, wrap-around to the other end for infinite scrolling.
     */
    wrapAround?: boolean;
}

export interface ISliderComponentProps {

    /**
     * The slide content to display
     */
    template?: string;

    /**
     * Stringified items to render
     */
    items?: { [key: string]: any };

    /**
     * Slider options
     */
    options?: ISliderOptions;

    /**
     * The Handlebars context to inject in slide content (ex: @root)
     */
    context?: any;

    /**
     * The isolated Handlebars namespace 
     */
    handlebars: typeof Handlebars;
}

export interface ISliderComponentState {
}

export class SliderComponent extends React.Component<ISliderComponentProps, ISliderComponentState> {

    private _domPurify: any;

    public constructor(props: ISliderComponentProps) {
        super(props);

        this._domPurify = DOMPurify;

        this._domPurify.setConfig({
            WHOLE_DOCUMENT: true,
            ALLOWED_URI_REGEXP: Constants.ALLOWED_URI_REGEXP,
        });

        this._domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        this._domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);
    }

    public render() {
        try {

            // Get item properties
            const items = this.props.items ? this.props.items : [];
            const sliderOptions = this.props.options ? this.props.options as ISliderOptions : {};
            const templateContext = !isEmpty(this.props.context) ? this.props.context : null;

            let autoPlayInterval: number | null = null;

            if (sliderOptions.autoPlay) {
                // Check if a duration has been set
                if (sliderOptions.autoPlayDuration) {
                    autoPlayInterval = sliderOptions.autoPlayDuration * 1000;
                }
            }

            // Map items to JSX elements for the Carousel
            const carouselElements = items.map((item, index) => {
                // Create a temp context with the current so we can use global registered helpers on the current item
                const tempTemplateContent = `{{#with item as |item|}}${this.props.template.trim()}{{/with}}`;

                let template = this.props.handlebars.compile(tempTemplateContent);

                const templateContentValue = template(
                    {
                        item: item,
                    },
                    {
                        data: {
                            root: {
                                ...templateContext
                            },
                            index: index
                        }
                    }
                );

                return <div key={index} className="carouselSlide">
                    <div dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(templateContentValue) }}></div>
                </div>;
            });

            // Extract slideHeight and slideWidth from context (layout properties)
            const slideHeight = templateContext?.properties?.layoutProperties?.slideHeight || 360;
            const slideWidth = templateContext?.properties?.layoutProperties?.slideWidth || 318;

            return <div 
                className="carouselContainer"
                ref={(el) => {
                    if (el) {
                        el.style.setProperty('--slide-width', `${slideWidth}px`);
                        el.style.setProperty('--slide-height', `${slideHeight}px`);
                    }
                }}
            >
                <Carousel
                    element={carouselElements}
                    isInfinite={sliderOptions.wrapAround}
                    interval={autoPlayInterval}
                    pauseOnHover={sliderOptions.pauseAutoPlayOnHover}
                    indicators={sliderOptions.showPageDots}
                    buttonsLocation={CarouselButtonsLocation.center}
                    buttonsDisplay={CarouselButtonsDisplay.block}
                    contentHeight={slideHeight}
                    indicatorStyle={{ bottom: '5px' }}
                />
            </div>;
        } catch (error) {
            return <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>;
        }
    }
}

export class SliderWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();
        let serviceScope: ServiceScope = this._serviceScope; // Default is the root shared service scope regardless the current Web Part 
        let templateServiceKey: ServiceKey<any> = TemplateService.ServiceKey; // Defaut service key for TemplateService

        if (props.instanceId) {

            // Get the service scope and keys associated to the current Web Part displaying the component
            serviceScope = this._webPartServiceScopes.get(props.instanceId) ? this._webPartServiceScopes.get(props.instanceId) : serviceScope;
            templateServiceKey = this._webPartServiceKeys.get(props.instanceId) ? this._webPartServiceKeys.get(props.instanceId).TemplateService : templateServiceKey;
        }

        const templateService = serviceScope.consume<ITemplateService>(templateServiceKey);

        const sliderComponent = <SliderComponent {...props} template={this.innerHTML} handlebars={templateService.Handlebars} />;
        ReactDOM.render(sliderComponent, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}