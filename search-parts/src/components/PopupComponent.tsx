import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from './BaseWebComponent';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
    ContextualMenu,
    MessageBar,
    MessageBarType,
    Modal,
    IDragOptions,
    PrimaryButton
} from 'office-ui-fabric-react';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import styles from './PopupComponent.module.scss';

export interface IPopupComponentProps {
    /**
     * Content shown in the modal
     */
    template?:string;
    /**
     * WebPartContext for this component
     */
    ctx: WebPartContext;
}

export interface IPopupComponentState {
    openID: string;
    showModal: boolean;
}

export class PopupComponent extends React.Component<IPopupComponentProps, IPopupComponentState> {

    constructor(props: IPopupComponentProps) {
        super(props);
        this.state = {
            openID: "",
            showModal: false
        };
    }

    public render() {

        let _errorsClick: string[] = [];
        let _errorsHeader: string[] = [];
        let _errorsBody: string[] = [];

        //Handle Errors of properties

        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(this.props.template.trim(), 'text/html');

        //Get Click HTML from template and pull out just the Click HTML based on template element with id equal to "popupclick"
        let _clickElement: HTMLElement = htmlContent.getElementById("popupclick");
        let _clickHTML = (_clickElement && !isEmpty(_clickElement.innerHTML)) ? _clickElement.innerHTML.trim() : "";
        if (isEmpty(_clickHTML)){
            _errorsClick.push('Template element with ID equal to "popupclick" not found.');
        }

        //Get Header HTML from template and pull out just the Header HTML based on template element with id equal to "popupheader"
        let _headerElement: HTMLElement = htmlContent.getElementById("popupheader");
        let _headerHTML = (_headerElement && !isEmpty(_headerElement.innerHTML)) ? _headerElement.innerHTML.trim() : "";
        if (isEmpty(_headerHTML)){
            _errorsHeader.push('Template element with ID equal to "popupheader" not found.');
        }

        //Get Body HTML from template and pull out just the Body HTML based on template element with id equal to "popupbody"
        let _bodyElement: HTMLElement = htmlContent.getElementById("popupbody");
        let _bodyHTML = (_bodyElement && !isEmpty(_bodyElement.innerHTML)) ? _bodyElement.innerHTML.trim() : "";
        if (isEmpty(_bodyHTML)){
            _errorsBody.push('Template element with ID equal to "popupbody" not found.');
        }        

        const ErrorMsgBar = (inMessage: string[]) => (
            !isEmpty(inMessage) ?
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={true}
                    dismissButtonAriaLabel="Close"
                >
                    {inMessage.map((splitMessage) => {
                        let msg = !isEmpty(splitMessage) ? <span>{splitMessage}<br /></span> : "";
                        return msg;
                    })}
                </MessageBar> : <span></span>
        );

        let _titleId: string = 'pnpModalTitle' + this.props.ctx.instanceId;
        let _subtitleId: string = 'pnpModalSubText' + this.props.ctx.instanceId;
        let _dragOptions: IDragOptions = {
            moveMenuItemText: 'Move',
            closeMenuItemText: 'Close',
            menu: ContextualMenu
        };
        return  <div>
                    <a href="#" onClick={() => this._showModal(_titleId)}>
                        {ErrorMsgBar(_errorsClick)}
                        <div dangerouslySetInnerHTML={{ __html: _clickHTML }} />
                    </a>
                    <Modal
                        titleAriaId={_titleId}
                        subtitleAriaId={_subtitleId}
                        isOpen={this.state.openID == _titleId ? this.state.showModal : false}
                        onDismiss={this._closeModal}
                        isBlocking={false}
                        containerClassName={styles.modalContainer}
                        dragOptions={_dragOptions}
                    >
                <div id={"pnp-modern-search-template_" + this.props.ctx.instanceId}>
                            <div className={styles.modalHeader}>
                                {ErrorMsgBar(_errorsHeader)}
                                <div dangerouslySetInnerHTML={{ __html: _headerHTML }} />
                            </div>
                            <div id={_subtitleId} className={styles.modalBody}>
                                {ErrorMsgBar(_errorsBody)}
                                <div dangerouslySetInnerHTML={{ __html: _bodyHTML }} />
                            </div>
                            <div className={styles.modalFooter}>
                                <PrimaryButton secondaryText="Closes window" onClick={this._closeModal as any} text="Close" />
                            </div>
                        </div>
                    </Modal>
                </div>;
    }

    private _showModal = (id: string): void => {
        this.setState({ openID: id, showModal: true });
    }

    private _closeModal = (): void => {
        this.setState({ openID: "", showModal: false });
    }
}

export class PopupWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        let props = this.resolveAttributes();
                
        //Move template from innerHTML to template property if template is empty
        props.template = (props.template && !isEmpty(props.template)) ? props.template : this.innerHTML.trim();

        // You can use this._ctx here to access current Web Part context
        const popupItem = <PopupComponent {...props} ctx={this._ctx} />;
        ReactDOM.render(popupItem, this);
    }
}