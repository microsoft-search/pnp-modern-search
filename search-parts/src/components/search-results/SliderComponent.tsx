import * as React from 'react';
import Flickity from 'flickity';
import 'flickity-imagesloaded';
import 'flickity/dist/flickity.min.css';
import * as ReactDOM from 'react-dom';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { BaseWebComponent, IExtensionContext } from 'search-extensibility';
import ITemplateService from '../../services/TemplateService/ITemplateService';

export interface ISliderProps {
    options?: any;
    context: IExtensionContext;
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
    items?: string;

    /**
     * Slider options
     */
    options?: string;

    context?: IExtensionContext;
}

export interface ISliderComponentState {
}

export class SliderComponent extends React.Component<ISliderComponentProps, ISliderComponentState> {
    
    public render() {

        try {
        
            // Get item properties
            const items = this.props.items ? JSON.parse(this.props.items) : [];
            const sliderOptions = this.props.options ? JSON.parse(this.props.options) as ISliderOptions : {};
            const ts = this.props.context.template as ITemplateService;

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
                        context={this.props.context}
                        >
                        {items.map((item, index) => {
                            
                            // Create a temp context with the current so we can use global registered helpers on the current item
                            const tempTemplateContent = `{{#with item as |item|}}${this.props.template.trim()}{{/with}}`;
                            let template = ts.Handlebars.compile(tempTemplateContent);

                            const templateContentValue = template({
                                item: item
                            });
                            
                            return  <div style={{ position: 'relative' }} key={index}>
                                        <div dangerouslySetInnerHTML={ { __html : templateContentValue}}></div>    
                                    </div>;               
                        }
                        )}
                    </Slider>
            </div>;
        } catch (error) {
            return <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>;
        }
    }

    public componentDidUpdate(prevState: ISliderComponentState, prevProps: ISliderComponentProps) {
        const ts = this.props.context.template as ITemplateService;
        ts.initPreviewElements();
    }
}

export class SliderWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public connectedCallback() {
 
       let props = this.resolveAttributes();
       props.context = this.context;
       const sliderComponent = <SliderComponent {...props}/>;
       ReactDOM.render(sliderComponent, this);
    }    
}