"use client";
import * as React from "react";
import {
  Persona,
  IPersonaProps,
  IPersonaSharedProps,
  getInitials,
  Icon,
  ITheme,
  PersonaPresence,
} from "@fluentui/react";
import { TemplateService } from "../services/templateService/TemplateService";
import * as ReactDOM from "react-dom";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { BaseWebComponent } from "@pnp/modern-search-extensibility";
import { ITemplateService } from "../services/templateService/ITemplateService";
import { UrlHelper } from "../helpers/UrlHelper";
import { isEmpty } from "@microsoft/sp-lodash-subset";
import { IComponentFieldsConfiguration } from "../models/common/IComponentFieldsConfiguration";
import { ServiceScope, ServiceKey, Log } from "@microsoft/sp-core-library";
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import { MSGraphClientFactory } from "@microsoft/sp-http";

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
  upn?: string;

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

  /**
   * If true, only render the image/coin (used when hover should trigger on image only)
   */
  imageOnly?: boolean;

  /**
   * If true, hide the image/coin and render only the text fields
   */
  hideImage?: boolean;

  /**
   * If true in combination with nativeLpc, trigger LPC hover only on the image
   */
  showHoverOnPictureOnly?: boolean;
}

export interface IPresenceInfo {
  Presence: PersonaPresence;
  Activity: string;
}

export interface IPersonaComponentState {
  PresenceProcessed: boolean;
  PresenceInfo: IPresenceInfo;
  imageHeight: number | undefined;
}

export class PersonaComponent extends React.Component<IPersonaComponentProps, IPersonaComponentState> {
  private imageWrapperRef = React.createRef<HTMLDivElement>();
  private componentRef = React.createRef<HTMLDivElement>();

  constructor(props: IPersonaComponentProps) {
    super(props);
    this.state = {
      PresenceProcessed: false,
      PresenceInfo: undefined as any, // will be set after graph call
      imageHeight: undefined
    };
  }

  public async componentDidMount(): Promise<void> {
    // Presence fetch
    if (this.props.showPresence && this.props.userObjectId && !this.state.PresenceProcessed) {
      this.getUserPresenceInfo(this.props.userObjectId)
        .then(presenceInfo => this.setState({ PresenceProcessed: true, PresenceInfo: presenceInfo }))
        .catch(error => {
          Log.error(LogSource, error, this.props.serviceScope);
          this.setState({ PresenceProcessed: true });
        });
    } else {
      this.setState({ PresenceProcessed: true });
    }

    // Measure image wrapper for picture-only split layout
    if (this.props.showHoverOnPictureOnly && this.imageWrapperRef.current) {
      setTimeout(() => {
        if (this.imageWrapperRef.current) {
          const h = this.imageWrapperRef.current.offsetHeight;
          if (h > 0) this.setState({ imageHeight: h });
        }
      }, 100);
    }
  }

  public render(): React.ReactNode {
    // Resolve fields via fieldsConfiguration when provided to populate persona texts/image
    let processedProps: IPersonaComponentProps = this.props;
    if (this.props.fieldsConfiguration && this.props.item) {
      processedProps = this.props.templateService.processFieldsConfiguration<IPersonaComponentProps>(
        this.props.fieldsConfiguration,
        this.props.item,
        this.props.context
      );
    }
    
    // Fallbacks to handle missing fields gracefully
    const primaryText = (this.props.primaryText ?? (processedProps as any).primaryText ?? (this.props.item as any)?.primaryText ?? (this.props.item as any)?.PrimaryText) || '';
    const secondaryText = (this.props.secondaryText ?? (processedProps as any).secondaryText ?? (this.props.item as any)?.secondaryText ?? (this.props.item as any)?.SecondaryText) || '';
    const tertiaryText = (this.props.tertiaryText ?? (processedProps as any).tertiaryText ?? (this.props.item as any)?.tertiaryText ?? (this.props.item as any)?.TertiaryText) || '';
    const optionalText = (this.props.optionalText ?? (processedProps as any).optionalText ?? (this.props.item as any)?.optionalText ?? (this.props.item as any)?.OptionalText) || '';
    const imageUrlResolved = (this.props.imageUrl ?? (processedProps as any).imageUrl ?? (this.props.item as any)?.imageUrl ?? (this.props.item as any)?.ImageUrl) as string | undefined;
    const upnResolved = (this.props.upn ?? (processedProps as any).upn ?? (this.props.item as any)?.upn ?? (this.props.item as any)?.Upn) as string | undefined;

    // Hide coin only when explicitly requested via hideImage prop
    const hideCoin = this.props.hideImage;

    const personaStyles: any = hideCoin ? {
      coin: { display: 'none', width: 0, visibility: 'hidden' },
      imageArea: { display: 'none', width: 0, visibility: 'hidden' }
    } : {};

    const persona: IPersonaProps = {
      theme: this.props.themeVariant as ITheme,
      imageUrl: hideCoin ? undefined : imageUrlResolved,
      imageShouldFadeIn: false,
      imageShouldStartVisible: true,
      styles: personaStyles,
      hidePersonaDetails: this.props.imageOnly ? true : undefined,
      text: primaryText,
      onRenderCoin: hideCoin ? () => null : undefined,
      onRenderInitials: (props: IPersonaSharedProps) => {
        let imageInitials = undefined;
        if (!isEmpty(primaryText)) {
          imageInitials = getInitials(UrlHelper.decode(primaryText), false, false);
        }
        return imageInitials ? <span>{imageInitials}</span> : <Icon iconName="Contact" />;
      },
      onRenderPrimaryText: () => {
        if (this.props.imageOnly) return null;
        return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this.props.templateService.sanitizeHtmlWithStylePreservation((this.props.templateService as any).applyDisambiguatedMgtPrefixIfNeeded(primaryText)) }} />;
      },
      onRenderSecondaryText: () => {
        if (this.props.imageOnly) return null;
        return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this.props.templateService.sanitizeHtmlWithStylePreservation((this.props.templateService as any).applyDisambiguatedMgtPrefixIfNeeded(secondaryText)) }} />;
      },
      onRenderTertiaryText: () => {
        if (this.props.imageOnly) return null;
        return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this.props.templateService.sanitizeHtmlWithStylePreservation((this.props.templateService as any).applyDisambiguatedMgtPrefixIfNeeded(tertiaryText)) }} />;
      },
      onRenderOptionalText: () => {
        if (this.props.imageOnly) return null;
        return <div style={{ display: 'inline', whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: this.props.templateService.sanitizeHtmlWithStylePreservation((this.props.templateService as any).applyDisambiguatedMgtPrefixIfNeeded(optionalText)) }} />;
      }
    };

    if (this.state.PresenceInfo) {
      persona.presence = this.state.PresenceInfo.Presence;
      persona.presenceTitle = this.state.PresenceInfo.Activity;
    }

    // Native LPC path
    if (this.props.nativeLpc) {
      if (this.props.showHoverOnPictureOnly) {
        // Picture-only mode: split layout with hover on image only
        const sizeNum = parseInt(this.props.personaSize ?? '48') || 48;
        const actualHeight = this.state.imageHeight || sizeNum;
        const wrapperWidth = Math.round(actualHeight * 1.0);

        // For coin-only: ensure image is visible by NOT inheriting hideCoin styles
        const coinOnly: IPersonaProps = { 
          ...persona, 
          imageUrl: imageUrlResolved, // Explicitly set image
          styles: {}, // No coin hiding styles
          onRenderCoin: undefined, // Allow default coin render
          hidePersonaDetails: true,
          onRenderPrimaryText: () => null,
          onRenderSecondaryText: () => null,
          onRenderTertiaryText: () => null,
          onRenderOptionalText: () => null
        };

        // Text-only half: aggressively suppress any coin/initials
        const textOnly: IPersonaProps = { 
          ...persona, 
          imageUrl: undefined, 
          onRenderCoin: () => null,
          onRenderInitials: () => null,
          styles: { 
            ...(persona.styles as any), 
            coin: { display: 'none', width: 0, minWidth: 0, height: 0, minHeight: 0, visibility: 'hidden', overflow: 'hidden' }, 
            imageArea: { display: 'none', width: 0, minWidth: 0, height: 0, minHeight: 0, visibility: 'hidden', overflow: 'hidden' } 
          } 
        };

        return (
          <div ref={this.componentRef} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div ref={this.imageWrapperRef} className="live-persona-card-wrapper" style={{ width: wrapperWidth, maxWidth: wrapperWidth, minWidth: wrapperWidth, cursor: 'pointer' }}>
              <LivePersona upn={upnResolved} template={<Persona {...coinOnly} size={parseInt(this.props.personaSize ?? '48')} />} serviceScope={this.props.serviceScope} />
            </div>
            <div className="text-only-persona" style={{ display: 'inline-block' }}>
              <style dangerouslySetInnerHTML={{ __html: `.text-only-persona .ms-Persona-coin, .text-only-persona .ms-Persona-imageArea, .text-only-persona .ms-Persona-initials, .text-only-persona [class*="coin-"], .text-only-persona [class*="imageArea-"], .text-only-persona [class*="initials-"], .text-only-persona [data-automationid="PersonaCoin"] { display: none !important; width: 0 !important; min-width: 0 !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; visibility: hidden !important; }` }} />
              <Persona {...textOnly} size={parseInt(this.props.personaSize ?? '48')} />
            </div>
          </div>
        );
      }

      // Native LPC without picture-only: full persona with hover on entire component
      return (
        <div ref={this.componentRef}>
          <LivePersona upn={upnResolved} template={<Persona {...persona} size={parseInt(this.props.personaSize ?? '48')} />} serviceScope={this.props.serviceScope} />
        </div>
      );
    }

    // Non-native picture-only: this is handled by mgt-person in the template, so just render image-only or text-only persona
    // No LivePersona wrapper needed here since mgt-person provides the hover card functionality

    // Non-native hover-on-picture-only text-only variation
    if (this.props.showHoverOnPictureOnly && this.props.hideImage) {
      // Forcefully suppress any coin/initials rendering for the text-only persona
      const textOnly: IPersonaProps = {
        ...persona,
        imageUrl: undefined,
        onRenderCoin: () => null,
        onRenderInitials: () => null,
        styles: {
          ...(persona.styles as any),
          coin: { display: 'none', width: 0, minWidth: 0, height: 0, minHeight: 0, visibility: 'hidden', overflow: 'hidden' },
          imageArea: { display: 'none', width: 0, minWidth: 0, height: 0, minHeight: 0, visibility: 'hidden', overflow: 'hidden' }
        }
      };

      return (
        <div ref={this.componentRef} className="text-only-persona" style={{ display: 'inline-block' }}>
          <style
            dangerouslySetInnerHTML={{
              __html:
                `.text-only-persona .ms-Persona-coin,` +
                `.text-only-persona .ms-Persona-imageArea,` +
                `.text-only-persona .ms-Persona-initials,` +
                `.text-only-persona [class*="coin-"],` +
                `.text-only-persona [class*="imageArea-"],` +
                `.text-only-persona [class*="initials-"],` +
                `.text-only-persona [data-automationid="PersonaCoin"] {` +
                ` display: none !important; width: 0 !important; min-width: 0 !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; visibility: hidden !important; }`
            }}
          />
          <Persona {...textOnly} size={parseInt(this.props.personaSize ?? '48')} />
        </div>
      );
    }

    return (
      <div ref={this.componentRef} style={{ display: 'inline-block' }}>
        <Persona {...persona} size={parseInt(this.props.personaSize ?? '48')} />
      </div>
    );
  }

  /**
   * Performs a MS Graph-call to retrieve presence-information of an Entra ID-user
   * @param entraIdUserObjectId Entra ID ObjectId of the user
   * @returns Object of type "IPresenceInfo" containing Presence- and Activity-information
   */
  private getUserPresenceInfo(
    entraIdUserObjectId: string
  ): Promise<IPresenceInfo> {
    return new Promise<IPresenceInfo>((resolve, reject) => {
      const msGraphClientFactory =
        this.props.serviceScope.consume<MSGraphClientFactory>(
          MSGraphClientFactory.serviceKey
        );
      msGraphClientFactory
        .getClient("3")
        .then((client) => {
          client
            .api(`/users/${entraIdUserObjectId}/presence`)
            .get((error, response: any, rawResponse?: any) => {
              if (error === null && response) {
                resolve({
                  Presence: this.getPersonaPresenceFromAvailability(
                    response.availability
                  ),
                  Activity: response.activity,
                });
              } else if (error) {
                reject(error);
              }
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Returns the Enum-value corresponding to MS Graph's "availability"-string
   * @param availability String-value "availability" from MS Graph
   * @returns PersonaPresence Enum-value
   */
  private getPersonaPresenceFromAvailability(
    availability: string
  ): PersonaPresence {
    switch (availability) {
      case "Busy":
      case "BusyIdle":
        return PersonaPresence.busy;

      case "Available":
      case "AvailableIdle":
        return PersonaPresence.online;

      case "Away":
      case "BeRightBack":
        return PersonaPresence.away;

      case "Offline":
        return PersonaPresence.offline;

      case "DoNotDisturb":
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
      serviceScope = this._webPartServiceScopes.get(props.instanceId)
        ? this._webPartServiceScopes.get(props.instanceId)
        : serviceScope;
      templateServiceKey = this._webPartServiceKeys.get(props.instanceId)
        ? this._webPartServiceKeys.get(props.instanceId).TemplateService
        : templateServiceKey;
    }

    const templateService =
      serviceScope.consume<ITemplateService>(templateServiceKey);

    const personaItem = (
      <PersonaComponent
        {...props}
        templateService={templateService}
        serviceScope={serviceScope}
      />
    );
    ReactDOM.render(personaItem, this);
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this);
  }
}
