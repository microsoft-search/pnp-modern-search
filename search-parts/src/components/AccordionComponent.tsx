import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from './BaseWebComponent';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
    Icon,
    MessageBar,
    MessageBarType
} from 'office-ui-fabric-react';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { Log } from '@microsoft/sp-core-library';
import styles from './AccordionComponent.module.scss';
import * as DOMPurify from 'dompurify';

export interface IAccordionComponentProps {
    /**
     * Text displayed inside of header
     */
    accordionHeaderText?: string;
    /**
     * Accordion Theme: Acceptible values - Default, Neutral
     */
    theme?: string;
    /**
     * Number of size of header
     */
    size?: number;
    /**
     * If accordion body should start open onLoad
     */
    startOpen?: boolean;
    /**
     * If accordion borders should be rounded
     */
    roundedCorners?: boolean;
    /**
     * Content shown in the accordion body
     */
    template?: string;
    /**
     * The Web Part context
     */
    ctx: WebPartContext;
}

export interface IAccordionComponentState {

    /**
     * Collapsible React component
     */
    Collapsible: any;
}


export class AccordionComponent extends React.Component<IAccordionComponentProps, IAccordionComponentState> {


    constructor(props: IAccordionComponentProps) {
        super(props);

        this.state = {
            Collapsible: null,
        };
    }

    public render() {

        if (!this.state.Collapsible) {
            return <div>Loading ...</div>;
        }
        else {
            let _errors: string[] = [];

            //Error handle properties
            if(isEmpty(this.props.template.trim())) _errors.push("Please include template within <pnp-accordion> component tags. This could be static HTML or search template.");

            let _themeStyles;
            switch (this.props.theme.toLowerCase()) {
                case "neutral":
                    _themeStyles = { closed: styles.accordionContainer__moreInfoBoxNeutral, open: styles.accordionContainer__moreInfoBoxNeutralOpen, rcClosed: this.props.roundedCorners ? ".5em" : "0", rcOpenHeader: this.props.roundedCorners ? ".5em .5em 0 0" : "0", rcOpenBody: this.props.roundedCorners ? "0 0 .5em .5em" : "0" };
                    break;
                default:
                    _themeStyles = { closed: styles.accordionContainer__moreInfoBoxDefault, open: styles.accordionContainer__moreInfoBoxDefaultOpen, rcClosed: this.props.roundedCorners ? ".5em" : "0", rcOpenHeader: this.props.roundedCorners ? ".5em .5em 0 0" : "0", rcOpenBody: this.props.roundedCorners ? "0 0 .5em .5em" : "0" };
                    break;
            }
            const ErrorMsgBar = (inMessage: string[]) => (
                inMessage.length > 0 ?
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        isMultiline={true}
                        dismissButtonAriaLabel="Close"
                    >
                        {inMessage.map((errMessage) => {
                            let msg = !isEmpty(errMessage) ? <span>{errMessage}<br /></span> : "";
                            return msg;
                        })}
                    </MessageBar> : null
            );

            let dynamicStyles = { "--fontSize": this.props.size + "px", "--rcClosed": _themeStyles.rcClosed, "--rcOpenHeader": _themeStyles.rcOpenHeader, "--rcOpenBody": _themeStyles.rcOpenBody } as React.CSSProperties;

            let moreHeader = <div><span>{this.props.accordionHeaderText}</span><span><Icon iconName="ChevronRightSmall" /></span></div>;

            let renderCollapible = React.createElement(this.state.Collapsible.default, {
                open: this.props.startOpen,
                triggerWhenOpen: this.checkOpen(moreHeader, this.props.accordionHeaderText),
                trigger: moreHeader,
                className:_themeStyles.closed,
                openedClassName:_themeStyles.open
            }, <div>{ErrorMsgBar(_errors)}<div dangerouslySetInnerHTML={{ __html: DOMPurify.default.sanitize(this.props.template) }}></div></div>);

            return  <div style={dynamicStyles}>
                        {renderCollapible}
                    </div>;
        }
    }

    public async componentDidMount() {
        await this._loadReactCollapsible();
    }

    private async _loadReactCollapsible() {

        if (!this.state.Collapsible) {

            try {

                const Collapsible = await import(
                    'react-collapsible'
                );

                this.setState({
                    Collapsible: Collapsible
                });

            } catch (error) {
                Log.error(`[Accordion_Component]`, error, this.props.ctx.serviceScope);
            }
        }
    }

    private checkOpen(header, text) {
        return header = <div><span>{text}</span><span><Icon iconName="ChevronDownSmall" /></span></div>;
    }
}

export class AccordionWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        let props = this.resolveAttributes();

        //Make sure to default non-required params
        props.theme = (props.theme && !isEmpty(props.theme)) ? props.theme : "default";
        props.size = (props.size && !isEmpty(props.size)) ? props.size : "12";
        props.startOpen = !props.startOpen ? false : props.startOpen;
        props.roundedCorners = !props.roundedCorners ? false : props.roundedCorners;

        //Move template from innerHTML to template property if template is empty
        props.template = (props.template && !isEmpty(props.template)) ? props.template : this.innerHTML.trim();

        const accordionItem = <AccordionComponent {...props} ctx={this._ctx} />;
        ReactDOM.render(accordionItem, this);
    }
}