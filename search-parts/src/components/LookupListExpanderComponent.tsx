import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from './BaseWebComponent';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
    MessageBar,
    MessageBarType
} from 'office-ui-fabric-react';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import * as Handlebars from 'handlebars';
import { sp, Web } from "@pnp/sp";

export interface ILookupListExpanderComponentProps {
    /**
     * Optional: URL of SharePoint web where List to expand resides if not in current web
     */
    listUrl?: string;
    /**
     * ID of List
     */
    listId?: string;
    /**
     * ID of List Item
     */
    listItemId?: number;
    /**
     * Internal Name of List Column
     */
    columnName?: string;
    /**
     * Comma separated list of fields to retrieve from lookup list
     */
    lookupListFields?: string;
    /**
     * Content shown in the body
     */
    template?: string;
    /**
     * WebPartContext for this component
     */
    ctx: WebPartContext;
}

export interface ILookupListExpanderComponentState {
    items: any;
    itemsLoaded: boolean;
}

export class LookupListExpanderComponent extends React.Component<ILookupListExpanderComponentProps, ILookupListExpanderComponentState> {

    constructor(props: ILookupListExpanderComponentProps) {
        super(props);

        sp.setup({
            spfxContext: this.props.ctx
        });

        this.state = {
            items: null,
            itemsLoaded: false
        };
    }

    public render() {

        let _errors: string[] = [];
        const hb = ((window as any).searchHBHelper !== undefined) ? (window as any).searchHBHelper : Handlebars;       

        //Error handle required properties
        if(isEmpty(this.props.template.trim())){
             _errors.push("Please include template within <pnp-lookup-list-expander> component tags. This could be static HTML or search template.");
        }
        if (!this.props.listId || isEmpty(this.props.listId.trim())) {
            _errors.push("Please include required parameter, data-list-id parameter on <pnp-lookup-list-expander>, with the value of the ListId of the search result item.");
        }
        if (!this.props.listItemId || this.props.listItemId < 0) {
            _errors.push("Please include required parameter, data-list-item-id parameter on <pnp-lookup-list-expander>, with the value of the ListItemId of the search result item.");
        }
        if (!this.props.columnName || isEmpty(this.props.columnName.trim())) {
            _errors.push("Please include required parameter, data-column-name parameter on <pnp-lookup-list-expander>, with the value of the internalname of the lookup column.");
        }
        if (!this.props.lookupListFields || isEmpty(this.props.lookupListFields.trim())) {
            _errors.push("Please include required parameter, data-lookup-list-fields parameter on <pnp-lookup-list-expander>, with the value of comma separated list of columns to select from the lookup list.");
        }

        const ErrorMsgBar = (inMessage: string[]) => (
            !isEmpty(inMessage) ?
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={true}
                    dismissButtonAriaLabel="Close"
                >
                    {inMessage.map((splitMessage) => {
                        let msg = !isEmpty(splitMessage)?<span>{splitMessage}<br /></span>:"";
                        return msg;
                    })}
                </MessageBar> : <span></span>
        );

        //Only try to get items if no errors
        if (!this.state.itemsLoaded && _errors.length == 0) {
            this.getLookupItems(this.props);
            this.setState({
                itemsLoaded: true
            });
        }

        return  <div>
                    {ErrorMsgBar(_errors)}
                    {this.state.items && this.state.items.map((lookupItem) => {
                        //Add a file extension to item for icon lookup
                        var re = /(?:\.([^.]+))?$/;
                        var ext = "txt";
                        try{ext = re.exec(lookupItem.FileLeafRef)[1];}catch(eExt){}
                        lookupItem.FileExtension = ext;

                        // Create a temp context with the current so we can use global registered helpers on the current item
                        const tempTemplateContent = `{{#with item as |item|}}${this.props.template.trim()}{{/with}}`;
                        let template = hb.compile(tempTemplateContent);

                        const templateContentValue = template({
                            item: lookupItem
                        });

                        return (
                            <div dangerouslySetInnerHTML={ { __html : templateContentValue}}></div>);
                    })
                    }
                </div>;
    }

    private getLookupItems(props:ILookupListExpanderComponentProps) {
        var reactHandler = this;
        let _LookupListID = "";
        let spWeb = sp.web;
        if (this.props.listUrl && !isEmpty(this.props.listUrl.trim())){
            spWeb = new Web(this.props.listUrl);
        }
        spWeb.lists.getById(props.listId).fields.getByInternalNameOrTitle(props.columnName).get().then((resField) => {
            _LookupListID = resField.SchemaXml.match(/List=(.*?)(?!\S)/g)[0].match(/[^List="][^"]*/)[0];
            spWeb.lists.getById(props.listId).items.getById(props.listItemId).select("Title", `${props.columnName}/Title`, `${props.columnName}/ID`).expand(props.columnName).get().then((resLookups) => {
                let _FilterString = "(";
                resLookups[props.columnName].map((docItem) => {
                    if (_FilterString == "(") {
                        _FilterString += "(ID eq " + docItem.ID + ")";
                    }
                    else {
                        _FilterString += "or (ID eq " + docItem.ID + ")";
                    }
                });
                _FilterString += ")";
                let _selectFields = props.lookupListFields.split(",");
                let _call = spWeb.lists.getById(_LookupListID).items.select(..._selectFields);
                if(props.lookupListFields.indexOf("/") > -1){
                    let _expandFields = "";
                    _selectFields.filter(i => i.indexOf("/") > -1).map((field) =>{
                        if(isEmpty(_expandFields)){
                            _expandFields = field.split("/")[0];
                        } 
                        else{
                            _expandFields += "," + field.split("/")[0];
                        }
                    });
                    _call = _call.expand(_expandFields);
                }                
                _call.filter(_FilterString).get().then((resItems) => {
                    reactHandler.setState({
                        items: resItems,
                        itemsLoaded: true
                    });
                });
            });
        });
    }
}

export class LookupListExpanderWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        let props = this.resolveAttributes();
        
        //Move template from innerHTML to template property if template is empty
        props.template = (props.template && !isEmpty(props.template)) ? props.template : this.innerHTML.trim();

        // You can use this._ctx here to access current Web Part context
        const lookupListExpanderItem = <LookupListExpanderComponent {...props} ctx={this._ctx} />;
        ReactDOM.render(lookupListExpanderItem, this);
    }
}