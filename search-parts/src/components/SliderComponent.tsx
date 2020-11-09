import * as React from 'react';
import Flickity from 'flickity';
import 'flickity-imagesloaded';
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

export interface ISliderProps {
    options?: any;
}

export interface ISliderState {
    flickityReady: boolean;
}

// https://medium.com/yemeksepeti-teknoloji/using-flickity-with-react-a906649b11de
export default class Slider extends React.Component<ISliderProps, ISliderState> {

    private flickityNode: HTMLElement;
    private flickityInstance: any;

    constructor(props) {
        super(props);

        this.state = {
            flickityReady: false,
        };

        this.refreshFlickity = this.refreshFlickity.bind(this);
    }

    public async componentDidMount() {
        
        this.flickityInstance = new Flickity(this.flickityNode, this.props.options || {});        

        this.setState({
            flickityReady: true,
        });
    }

    private refreshFlickity() {
        this.flickityInstance.deactivate();
        this.flickityInstance.reloadCells();
        this.flickityInstance.resize();
        this.flickityInstance.updateDraggable();
        this.flickityInstance.activate();
    }

    public componentDidUpdate(prevProps: any, prevState) {
        const flickityDidBecomeActive = !prevState.flickityReady && this.state.flickityReady;
        const childrenDidChange = prevProps.children.length !== (this.props.children as any).length;

        if (flickityDidBecomeActive || childrenDidChange) {
            this.refreshFlickity();
        }
    }

    public renderPortal() {

        if (!this.flickityNode) {
            return null;
        }

        const mountNode = this.flickityNode.querySelector('.flickity-slider');

        if (mountNode) {
            return ReactDOM.createPortal(this.props.children, mountNode);
        }
    }

    public render() {
        return [
            <div className="carousel" key="flickityBase" ref={node => (this.flickityNode = node)} />,
            this.renderPortal(),
          ].filter(Boolean);
    }
}

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
    items?: { [key:string]: any};

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
                    <Slider
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

                            const templateContentValue =    template(
                                                                { 
                                                                    item: item 
                                                                }, 
                                                                { 
                                                                    data: {
                                                                        root: {
                                                                            ...templateContext
                                                                        }
                                                                    }
                                                                }
                                                            ); 
                            
                            return  <div style={{ position: 'relative' }} key={index}>
                                        <div dangerouslySetInnerHTML={ { __html : this._domPurify.sanitize(templateContentValue)}}></div>    
                                    </div>;               
                            })
                        }
                    </Slider>
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

       const templateService = this._serviceScope.consume<ITemplateService>(TemplateService.ServiceKey);
       
       const sliderComponent = <SliderComponent {...props} template={this.innerHTML} handlebars={templateService.Handlebars}/>;
       ReactDOM.render(sliderComponent, this);
    }    
 }