import * as React from 'react';
import ISearchTemplateState from './ISearchTemplateState';
import ISearchTemplateProps from './ISearchTemplateProps';
import * as DOMPurify from 'dompurify';
import { CssHelper } from '../../helpers/CssHelper';
import { LogLevel } from '@pnp/logging';
import Logger from '../../services/LogService/LogService';
import { Guid } from '@microsoft/sp-core-library';

const TEMPLATE_ID_PREFIX = 'pnp-modern-search-template_';

export default class SearchTemplate<DataContext extends object> extends React.Component<ISearchTemplateProps<DataContext>, ISearchTemplateState> {

    private _domPurify: any;
    
    constructor(props: ISearchTemplateProps<DataContext>) {
        super(props);
        
        this.state = {
            processedTemplate: null
        };

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            ADD_TAGS: ['style'],
            ADD_ATTR: ['onerror', 'target', 'loading'],
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|ms-\w+):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            WHOLE_DOCUMENT: true
        });

        let customTags = [];
        // Allow custom elements (ex: my-component)
        this._domPurify.addHook('uponSanitizeElement', (node, data) => {
            if (node.nodeName && node.nodeName.match(/^\w+((-\w+)+)+$/)
                && !data.allowedTags[data.tagName]) {
                data.allowedTags[data.tagName] = true;                
                customTags.push(data.tagName.toLocaleUpperCase());
            }
        });

        
        // Allow all custom attributes on custom elements - except javascript events ones starting with "on"
        // Ideally we'd support only data- ones, but we know other web components don't follow this pattern
        this._domPurify.addHook('uponSanitizeAttribute', (attr, data) => {
            if (data && data.attrName && customTags.indexOf(attr.tagName) !== -1) {
                if(data.attrName.indexOf("on") == 0) return;
                data.allowedAttributes[data.attrName] = true;
            }
        });        

        Logger.write('[MSWP.SearchTemplate.constructor()]');

    }

    public render() {
        if(this.state.processedTemplate) {
            const objectNode: any = document.querySelector("object[data='about:blank']");
            if (objectNode) {
                objectNode.style.display = "none";
            }
            
            Logger.write('[MSWP.SearchTemplate.render()]: rendering search template: ' + this.props.instanceId);
            Logger.write('[MSWP.SearchTemplate.render()]: \n' + this.state.processedTemplate, LogLevel.Verbose);
            
            return <div>
                <div key={JSON.stringify(this.props.templateContext)} dangerouslySetInnerHTML={{ __html: this.state.processedTemplate }}></div>
            </div>;

        } else {
            return null;
        }
    }

    public componentDidMount() : void {
        Logger.write('[MSWP.SearchTemplate.componentDidMount()]: component did mount.');
        this._updateTemplate(this.props);
    }

    public componentDidUpdate() : void {
        // Post render operations (previews on elements, etc.)
        Logger.write('[MSWP.SearchTemplate.componentDidUpdate()]: component did update.');
        this.props.templateService.initPreviewElements();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: ISearchTemplateProps<DataContext>) {
        Logger.write('[MSWP.SearchTemplate.UNSAFE_componentWillReceiveProps()]: updating template again.');
        this._updateTemplate(nextProps);
    }

    private async _updateTemplate(props: ISearchTemplateProps<DataContext>): Promise<void> {

        let templateContent = props.templateContent;

        // Process the Handlebars template
        let template = await this.props.templateService.processTemplate(props.templateContext, templateContent);
        
        Logger.write('[MSWP.SearchTemplate._updateTemplate()]: processed template: ' + template, LogLevel.Info);
        Logger.write('[MSWP.SearchTemplate._updateTemplate()]: \n' + template, LogLevel.Verbose);

        if (template) {

            // Sanitize the template HTML
            template = this._domPurify.sanitize(`${template}`);
            
            const templateAsHtml = new DOMParser().parseFromString(template, "text/html");
            template = CssHelper.prefixStyleElements(templateAsHtml, `${TEMPLATE_ID_PREFIX}${this.props.instanceId}`);

        }

        this.setState({
            processedTemplate: template
        });

    }

}
