"use client";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Handlebars from 'handlebars';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { IconButton } from '@fluentui/react/lib/Button';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { isEmpty } from "@microsoft/sp-lodash-subset";
import { ITemplateService } from '../services/templateService/ITemplateService';
import { TemplateService } from '../services/templateService/TemplateService';
import { DomPurifyHelper } from '../helpers/DomPurifyHelper';
import { ServiceScope, ServiceKey } from "@microsoft/sp-core-library";
import styles from './SliderComponent.module.scss';

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

    /**
     * The index of the currently displayed page (group of slides).
     */
    currentIndex: number;
}

export class SliderComponent extends React.Component<ISliderComponentProps, ISliderComponentState> {

    /**
     * The auto play timer handle.
     */
    private _autoPlayTimer: number | undefined = undefined;

    /**
     * Indicates if the pointer is currently hovering the carousel (used to pause auto play).
     */
    private _isHovering: boolean = false;

    /**
     * The number of pages currently rendered. Kept in sync on every render so the auto play
     * callback and bounds checks always operate on the latest value.
     */
    private _pageCount: number = 0;

    public constructor(props: ISliderComponentProps) {
        super(props);

        this.state = {
            currentIndex: 0
        };

        this._goToNext = this._goToNext.bind(this);
        this._goToPrevious = this._goToPrevious.bind(this);
        this._onMouseEnter = this._onMouseEnter.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
    }

    public componentDidMount(): void {
        this._resetAutoPlay();
    }

    public componentDidUpdate(): void {
        // Clamp the current index if the number of pages shrank (e.g. fewer results).
        if (this.state.currentIndex > this._pageCount - 1) {
            this.setState({ currentIndex: Math.max(0, this._pageCount - 1) });
        }
    }

    public componentWillUnmount(): void {
        this._clearAutoPlay();
    }

    /**
     * Returns the auto play interval in milliseconds, or null when auto play is disabled.
     */
    private _getAutoPlayInterval(): number | null {
        const sliderOptions = this.props.options ? this.props.options as ISliderOptions : {};
        if (sliderOptions.autoPlay && sliderOptions.autoPlayDuration) {
            return sliderOptions.autoPlayDuration * 1000;
        }
        return null;
    }

    private _clearAutoPlay(): void {
        if (this._autoPlayTimer !== undefined) {
            window.clearInterval(this._autoPlayTimer);
            this._autoPlayTimer = undefined;
        }
    }

    /**
     * (Re)starts the auto play timer based on the current options. Does nothing when auto play is
     * disabled or when there is a single page.
     */
    private _resetAutoPlay(): void {
        this._clearAutoPlay();

        const interval = this._getAutoPlayInterval();
        if (interval === null || this._pageCount <= 1) {
            return;
        }

        this._autoPlayTimer = window.setInterval(() => {
            if (!this._isHovering) {
                this._goToNext();
            }
        }, interval);
    }

    private _onMouseEnter(): void {
        const sliderOptions = this.props.options ? this.props.options as ISliderOptions : {};
        if (sliderOptions.pauseAutoPlayOnHover) {
            this._isHovering = true;
        }
    }

    private _onMouseLeave(): void {
        this._isHovering = false;
    }

    /**
     * Moves to a specific page, clamping to the valid range.
     */
    private _goToIndex(index: number): void {
        if (this._pageCount === 0) {
            return;
        }
        const clamped = Math.max(0, Math.min(index, this._pageCount - 1));
        if (clamped !== this.state.currentIndex) {
            this.setState({ currentIndex: clamped });
        }
    }

    private _goToNext(): void {
        const wrapAround = this.props.options ? (this.props.options as ISliderOptions).wrapAround : false;
        const { currentIndex } = this.state;

        if (currentIndex < this._pageCount - 1) {
            this.setState({ currentIndex: currentIndex + 1 });
        } else if (wrapAround) {
            this.setState({ currentIndex: 0 });
        }
    }

    private _goToPrevious(): void {
        const wrapAround = this.props.options ? (this.props.options as ISliderOptions).wrapAround : false;
        const { currentIndex } = this.state;

        if (currentIndex > 0) {
            this.setState({ currentIndex: currentIndex - 1 });
        } else if (wrapAround) {
            this.setState({ currentIndex: this._pageCount - 1 });
        }
    }

    public render() {
        try {

            // Get item properties
            const items = this.props.items ? this.props.items : [];
            const sliderOptions = this.props.options ? this.props.options as ISliderOptions : {};
            const templateContext = !isEmpty(this.props.context) ? this.props.context : null;

            // Get number of slides to show at once (default to 1 if not specified)
            const numberOfSlides = sliderOptions.numberOfSlides || 1;

            // Group items into chunks based on numberOfSlides
            const groupedItems: any[][] = [];
            for (let i = 0; i < (items as any[]).length; i += numberOfSlides) {
                groupedItems.push((items as any[]).slice(i, i + numberOfSlides));
            }

            // Map grouped items to JSX elements (one element per page)
            const carouselElements = groupedItems.map((itemGroup, groupIndex) => {
                // Create slides for each item in the group
                const slideElements = itemGroup.map((item, itemIndex) => {
                    const absoluteIndex = groupIndex * numberOfSlides + itemIndex;

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
                                index: absoluteIndex
                            }
                        }
                    );

                    return <div key={absoluteIndex} className={styles.carouselSlide}>
                        <div dangerouslySetInnerHTML={{ __html: DomPurifyHelper.instance.sanitize(templateContentValue) }}></div>
                    </div>;
                });

                // Return a group container for multiple slides (one page)
                return <div key={groupIndex} className={styles.carouselSlideGroup}>
                    {slideElements}
                </div>;
            });

            // Keep the page count in sync for auto play / bounds logic.
            const previousPageCount = this._pageCount;
            this._pageCount = carouselElements.length;
            if (previousPageCount !== this._pageCount) {
                // Restart auto play once the rendered DOM reflects the new page count.
                window.requestAnimationFrame(() => this._resetAutoPlay());
            }

            const currentIndex = Math.max(0, Math.min(this.state.currentIndex, this._pageCount - 1));
            const wrapAround = sliderOptions.wrapAround === true;
            const showControls = this._pageCount > 1;
            const showDots = showControls && sliderOptions.showPageDots === true;

            const prevDisabled = !wrapAround && currentIndex === 0;
            const nextDisabled = !wrapAround && currentIndex === this._pageCount - 1;

            // Extract slideHeight and slideWidth from context (layout properties)
            const slideHeight = templateContext?.properties?.layoutProperties?.slideHeight || 360;
            const slideWidth = templateContext?.properties?.layoutProperties?.slideWidth || 318;

            return <div
                className={styles.carouselContainer}
                onMouseEnter={this._onMouseEnter}
                onMouseLeave={this._onMouseLeave}
                ref={(el) => {
                    if (el) {
                        el.style.setProperty('--slide-width', `${slideWidth}px`);
                        el.style.setProperty('--slide-height', `${slideHeight}px`);
                        el.style.setProperty('--slides-per-page', `${numberOfSlides}`);
                        el.style.setProperty('--slide-gap', '10px');
                    }
                }}
            >
                {showControls &&
                    <IconButton
                        className={`${styles.carouselButton} ${styles.carouselButtonPrev}`}
                        iconProps={{ iconName: 'ChevronLeft' }}
                        ariaLabel="Previous"
                        disabled={prevDisabled}
                        onClick={this._goToPrevious}
                    />
                }
                <div className={styles.carouselViewport}>
                    <div
                        className={styles.carouselTrack}
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {carouselElements.map((element, index) => (
                            <div
                                key={index}
                                className={styles.carouselPage}
                                aria-hidden={index !== currentIndex}
                            >
                                {element}
                            </div>
                        ))}
                    </div>
                </div>
                {showControls &&
                    <IconButton
                        className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
                        iconProps={{ iconName: 'ChevronRight' }}
                        ariaLabel="Next"
                        disabled={nextDisabled}
                        onClick={this._goToNext}
                    />
                }
                {showDots &&
                    <ol className={styles.carouselIndicators}>
                        {carouselElements.map((element, index) => (
                            <li
                                key={index}
                                className={index === currentIndex ? styles.carouselIndicatorActive : undefined}
                                role="button"
                                tabIndex={0}
                                aria-label={`Go to page ${index + 1}`}
                                aria-current={index === currentIndex}
                                onClick={() => this._goToIndex(index)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                                        e.preventDefault();
                                        this._goToIndex(index);
                                    }
                                }}
                            />
                        ))}
                    </ol>
                }
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