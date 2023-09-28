import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Flickity = require('react-flickity-component');
import 'flickity/dist/flickity.min.css';
import * as ReactDOM from 'react-dom';
import * as Handlebars from 'handlebars';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { isEmpty } from "@microsoft/sp-lodash-subset";
import * as DOMPurify from 'dompurify';
import { ITemplateService } from '../services/templateService/ITemplateService';
import { TemplateService } from '../services/templateService/TemplateService';
import { DomPurifyHelper } from '../helpers/DomPurifyHelper';
import { ServiceScope, ServiceKey } from "@microsoft/sp-core-library";

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

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            WHOLE_DOCUMENT: true
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

            let autoPlayValue: any = sliderOptions.autoPlay;

            if (sliderOptions.autoPlay) {
                // Check if a duration has been set
                if (sliderOptions.autoPlayDuration) {
                    autoPlayValue = sliderOptions.autoPlayDuration * 1000;
                }
            }

            return <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} />
                <Flickity
                    options={{
                        autoPlay: autoPlayValue,
                        pauseAutoPlayOnHover: sliderOptions.pauseAutoPlayOnHover,
                        wrapAround: sliderOptions.wrapAround,
                        lazyLoad: true,
                        groupCells: sliderOptions.numberOfSlides,
                        adaptiveHeight: true,
                        pageDots: sliderOptions.showPageDots,
                        imagesLoaded: true
                    }}
                >
                    {items.map((item, index) => {

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

                        return <div style={{ position: 'relative' }} key={index}>
                            <div dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(templateContentValue) }}></div>
                        </div>;
                    })
                    }
                </Flickity>
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