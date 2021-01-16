import * as React from 'react';
import { Persona, IPersonaProps, IPersonaSharedProps, getInitials, Icon } from 'office-ui-fabric-react';
import { TemplateService } from "../services/templateService/TemplateService";
import * as ReactDOM from 'react-dom';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { ITheme } from '@uifabric/styling';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { ITemplateService } from '../services/templateService/ITemplateService';
import * as DOMPurify from 'dompurify';
import { UrlHelper } from '../helpers/UrlHelper';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { DomPurifyHelper } from '../helpers/DomPurifyHelper';
import { IComponentFieldsConfiguration } from '../models/common/IComponentFieldsConfiguration';

export interface IPersonaComponentProps {

    /**
     * The item context
     */
    item?: {[key:string]: any};

    /**
     * The current field configuration
     */
    fieldsConfiguration?: IComponentFieldsConfiguration[];

    // Individual content properties (i.e web component attributes)

    /**
     * The persona coin image URL
     */
    imageUrl?: string;

    /**
     * Persona card primary text
     */
    primaryText?: string;

    /**
     * Persona card secondary text
     */
    secondaryText?: string;

    /**
     * Persona card tertiary text
     */
    tertiaryText?: string;

    /**
     * Persona card optional text
     */
    optionalText?: string;

    /**
     * The persona image size
     */
    personaSize?: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * A template service instance
     */
    templateService: ITemplateService;

    /**
     * The Handlebars context to inject in slide content (ex: @root)
     */
    context?: string;
}

export interface IPersonaComponentState {
}

export class PersonaComponent extends React.Component<IPersonaComponentProps, IPersonaComponentState> {

    private _domPurify: any;

    public constructor(props: IPersonaComponentProps) {
        super(props);

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            FORBID_TAGS: ['style'],
            WHOLE_DOCUMENT: true
        });

        this._domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        this._domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);   
    }

    public render() {

        let processedProps: IPersonaComponentProps = this.props;

        if (this.props.fieldsConfiguration && this.props.item) {
            processedProps = this.props.templateService.processFieldsConfiguration<IPersonaComponentProps>(this.props.fieldsConfiguration, this.props.item, this.props.context);
        }
        
        const persona: IPersonaProps = {
            theme:this.props.themeVariant as ITheme,
            imageUrl: this.props.imageUrl ? this.props.imageUrl : processedProps.imageUrl,
            imageShouldFadeIn: false,
            imageShouldStartVisible: true,
            styles:{
                root: {
                    height: '100%'
                }
            },
            text: processedProps.primaryText, // This is to get the correct color for coin (used internally by the Persona component)
            onRenderInitials: (props: IPersonaSharedProps) => {

                let imageInitials = undefined;
                if (!isEmpty(processedProps.primaryText)) {
                    imageInitials = getInitials(UrlHelper.decode(processedProps.primaryText), false, false);
                }

                return imageInitials ? <span>{imageInitials}</span> : <Icon iconName="Contact" />;
            },
            onRenderPrimaryText: (props: IPersonaProps) => {                
                return <div style={{display: 'inline'}} dangerouslySetInnerHTML={{__html: this._domPurify.sanitize(processedProps.primaryText) }}></div>;
            },
            onRenderSecondaryText: (props: IPersonaProps) => {
                return <div style={{display: 'inline'}} dangerouslySetInnerHTML={{__html: this._domPurify.sanitize(processedProps.secondaryText) }}></div>;
            },
            onRenderTertiaryText: (props: IPersonaProps) => {
                return <div style={{display: 'inline'}} dangerouslySetInnerHTML={{__html: this._domPurify.sanitize(processedProps.tertiaryText) }}></div>;
            },
            onRenderOptionalText: (props: IPersonaProps) => {
                return <div style={{display: 'inline'}} dangerouslySetInnerHTML={{__html: this._domPurify.sanitize(processedProps.optionalText) }}></div>;
            }
        };

        return  <Persona {...persona} size={parseInt(this.props.personaSize)}></Persona>;
    }
}

export class PersonaWebComponent extends BaseWebComponent {
   
    constructor() {
        super();
    }
 
    public connectedCallback() {
 
       let props = this.resolveAttributes();
       const templateService = this._serviceScope.consume<ITemplateService>(TemplateService.ServiceKey);
       const personaItem = <PersonaComponent {...props} templateService={templateService}/>;
       ReactDOM.render(personaItem, this);
    }    
}