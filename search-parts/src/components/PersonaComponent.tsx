import * as React from 'react';
import { Persona, IPersonaProps, IPersonaSharedProps, getInitials, Icon, ITheme, PersonaPresence } from '@fluentui/react';
import { TemplateService } from "../services/templateService/TemplateService";
import * as ReactDOM from 'react-dom';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { ITemplateService } from '../services/templateService/ITemplateService';
import * as DOMPurify from 'dompurify';
import { UrlHelper } from '../helpers/UrlHelper';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { DomPurifyHelper } from '../helpers/DomPurifyHelper';
import { IComponentFieldsConfiguration } from '../models/common/IComponentFieldsConfiguration';
import { ServiceScope, ServiceKey, Log } from '@microsoft/sp-core-library';
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import { Constants } from '../common/Constants';
import { MSGraphClientFactory } from '@microsoft/sp-http';

const LogSource = "PersonaComponent";

export interface IPersonaComponentProps {

    /**
     * The item context
     */
    item?: { [key: string]: any };

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
     * UPN of the person (necessary to display LPC)
     */
    upn?:string;

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
     * Current servicescope
     */
    serviceScope: ServiceScope;

    /**
     * The Handlebars context to inject in slide content (ex: @root)
     */
    context?: string;

    /**
     * Enable native LPC from SharePoint
     */
    nativeLpc?: boolean;

    /**
     * Show presence information?
     */
    showPresence?: boolean;

    /**
     * The person's Entra ID Object-ID (usually passed via default-slot "PersonQuery")
     */
    userObjectId?: string;
}

export interface IPresenceInfo {
    Presence: PersonaPresence;
    Activity: string;
}

export interface IPersonaComponentState {
    PresenceProcessed: boolean;
    PresenceInfo: IPresenceInfo;
}

export class PersonaComponent extends React.Component<IPersonaComponentProps, IPersonaComponentState> {

    private _domPurify: any;

    public constructor(props: IPersonaComponentProps) {
        super(props);

        this._domPurify = DOMPurify;

        this._domPurify.setConfig({
            WHOLE_DOCUMENT: true,
            ALLOWED_URI_REGEXP: Constants.ALLOWED_URI_REGEXP,
        });

        this._domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        this._domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);

        this.state = {
            PresenceProcessed: false,
            PresenceInfo: undefined
        }
    }

    public async componentDidMount(): Promise<void> {

        if (this.props.showPresence && this.props.userObjectId && !this.state.PresenceProcessed) {

            // get presence-information via MS Graph asynchronously
            this.getUserPresenceInfo(this.props.userObjectId)
                .then((presenceInfo) => {
                    this.setState({
                        PresenceProcessed: true,
                        PresenceInfo: presenceInfo
                    });
                })
                .catch((error) => {
                    // in case of an error, simply set state "PresenceProcessed" to "true" and leave "PresenceInfo" = "undefined"
                    Log.error(LogSource, error, this.props.serviceScope);
                    this.setState({ PresenceProcessed: true });
                });
        }
        else {
            // if not showing presence-information, simply set state "PresenceProcessed" to "true" and leave "PresenceInfo" = "undefined"
            this.setState({ PresenceProcessed: true });
        }
    }

    public render() {

        let processedProps: IPersonaComponentProps = this.props;

        if (this.props.fieldsConfiguration && this.props.item) {
            processedProps = this.props.templateService.processFieldsConfiguration<IPersonaComponentProps>(this.props.fieldsConfiguration, this.props.item, this.props.context);
        }

        const persona: IPersonaProps = {
            theme: this.props.themeVariant as ITheme,
            imageUrl: this.props.imageUrl ? this.props.imageUrl : processedProps.imageUrl,
            imageShouldFadeIn: false,
            imageShouldStartVisible: true,
            styles: {
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
                return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(this.props.templateService.applyDisambiguatedMgtPrefixIfNeeded(processedProps.primaryText)) }}></div>;
            },
            onRenderSecondaryText: (props: IPersonaProps) => {
                return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(this.props.templateService.applyDisambiguatedMgtPrefixIfNeeded(processedProps.secondaryText)) }}></div>;
            },
            onRenderTertiaryText: (props: IPersonaProps) => {
                return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(this.props.templateService.applyDisambiguatedMgtPrefixIfNeeded(processedProps.tertiaryText)) }}></div>;
            },
            onRenderOptionalText: (props: IPersonaProps) => {
                return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(this.props.templateService.applyDisambiguatedMgtPrefixIfNeeded(processedProps.optionalText)) }}></div>;
            }
        };

        // if PresenceInfo is present, set appropriate props in IPersonaProps
        if (this.state.PresenceInfo) {
            persona.presence = this.state.PresenceInfo.Presence;
            persona.presenceTitle = this.state.PresenceInfo.Activity;
        }

        if (this.props.nativeLpc) {
            return <LivePersona upn={processedProps.upn}
                template={
                    <>
                        <Persona {...persona} size={parseInt(this.props.personaSize)}></Persona>
                    </>
                }
                serviceScope={this.props.serviceScope}
            />
        }

        return <Persona {...persona} size={parseInt(this.props.personaSize)}></Persona>;
    }

    /**
     * Performs a MS Graph-call to retrieve presence-information of an Entra ID-user
     * @param entraIdUserObjectId Entra ID ObjectId of the user
     * @returns Object of type "IPresenceInfo" containing Presence- and Activity-information
     */
    private getUserPresenceInfo(entraIdUserObjectId: string): Promise<IPresenceInfo> {

        return new Promise<IPresenceInfo>((resolve, reject) => {

            const msGraphClientFactory = this.props.serviceScope.consume<MSGraphClientFactory>(MSGraphClientFactory.serviceKey);
            msGraphClientFactory.getClient("3")
                .then((client) => {
                    client.api(`/users/${entraIdUserObjectId}/presence`)
                        .get((error, response: any, rawResponse?: any) => {

                            if (error === null && response) {
                                resolve({
                                    Presence: this.getPersonaPresenceFromAvailability(response.availability),
                                    Activity: response.activity
                                });
                            }
                            else if (error) { reject(error); }
                        })
                })
                .catch((error) => { reject(error); })
        });
    }

    /**
     * Returns the Enum-value corresponding to MS Graph's "availability"-string
     * @param availability String-value "availability" from MS Graph
     * @returns PersonaPresence Enum-value 
     */
    private getPersonaPresenceFromAvailability(availability: string): PersonaPresence {
        switch (availability) {
            case 'Busy':
            case 'BusyIdle':
                return PersonaPresence.busy;

            case 'Available':
            case 'AvailableIdle':
                return PersonaPresence.online;

            case 'Away':
            case 'BeRightBack':
                return PersonaPresence.away;

            case 'Offline':
                return PersonaPresence.offline;

            case 'DoNotDisturb':
                return PersonaPresence.dnd;

            default:
                return PersonaPresence.none;
        }
    }
}

export class PersonaWebComponent extends BaseWebComponent {

    constructor() {
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

        const personaItem = <PersonaComponent {...props} templateService={templateService} serviceScope={serviceScope} />;
        ReactDOM.render(personaItem, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}