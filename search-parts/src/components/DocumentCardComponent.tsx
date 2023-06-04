import * as React from "react";
import * as ReactDOM from 'react-dom';
import { IDocumentCardPreviewProps, DocumentCard, DocumentCardPreview, DocumentCardTitle, DocumentCardActivity, DocumentCardType, DocumentCardDetails, IDocumentCardLocationStyleProps, IDocumentCardLocationStyles, IDocumentCardStyles, ITheme, Check } from 'office-ui-fabric-react';
import { ImageFit } from 'office-ui-fabric-react';
import PreviewContainer from '../controls/PreviewContainer/PreviewContainer';
import { PreviewType } from '../controls/PreviewContainer/IPreviewContainerProps';
import { Link } from 'office-ui-fabric-react';
import * as documentCardLocationGetStyles from 'office-ui-fabric-react/lib/components/DocumentCard/DocumentCardLocation.styles';
import { getTheme, mergeStyleSets, IIconStyles } from "office-ui-fabric-react";
import { classNamesFunction } from "office-ui-fabric-react";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { merge } from '@microsoft/sp-lodash-subset';
import { BaseWebComponent } from "@pnp/modern-search-extensibility";
import { TemplateService } from "../services/templateService/TemplateService";
import { ITemplateService } from "../services/templateService/ITemplateService";
import { UrlHelper } from "../helpers/UrlHelper";
import { FileIcon } from "./FileIconComponent";
import * as DOMPurify from 'dompurify';
import { DomPurifyHelper } from "../helpers/DomPurifyHelper";
import { IComponentFieldsConfiguration } from "../models/common/IComponentFieldsConfiguration";
import { TestConstants } from "../common/Constants";
import { ServiceScope, ServiceKey } from "@microsoft/sp-core-library";
import { ISelectableComponentItem } from "../models/common/ISelectableComponentItem";
/**
 * Document card props. These properties are retrieved from the web component attributes. They must be camel case.
 * (ex: a 'preview-image' HTML attribute becomes 'previewImage' prop, etc.)
 */
export interface IDocumentCardComponentProps extends ISelectableComponentItem {

    // Item context
    item?: { [key: string]: any };

    // Fields configuration object
    fieldsConfiguration?: IComponentFieldsConfiguration[];

    // Individual content properties (i.e web component attributes)
    title?: string;
    location?: string;
    tags?: string;
    href?: string;
    previewImage?: string;
    date?: string;
    profileImage?: string;
    previewUrl?: string;
    author?: string;
    fileExtension?: string;
    isContainer?: string;

    // Behavior properties
    enablePreview?: boolean;
    showFileIcon?: boolean;
    isCompact?: boolean;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * The Handlebars context to inject in slide content (ex: @root)
     */
    context?: string;

    /**
     * A template service instance
     */
    templateService: ITemplateService;
}

export interface IDocumentCardComponentState {
    showCallout: boolean;
}

export class DocumentCardComponent extends React.Component<IDocumentCardComponentProps, IDocumentCardComponentState> {

    private documentCardPreviewRef = React.createRef<HTMLDivElement>();

    private _domPurify: any;

    public constructor(props: IDocumentCardComponentProps) {
        super(props);
        this.showPreviewOnClick = this.showPreviewOnClick.bind(this);

        this.state = {
            showCallout: false
        };

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            WHOLE_DOCUMENT: true
        });

        this._domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        this._domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);
    }

    private showPreviewOnClick() {
        this.setState({
            showCallout: true
        });
    }

    public render() {

        let renderPreviewCallout: JSX.Element = null;
        let renderItemCheck: JSX.Element = null;
        let isSelected = false;
        let fileExtension = null;
        let processedProps: IDocumentCardComponentProps = this.props;

        if (this.props.fieldsConfiguration && this.props.item) {
            processedProps = this.props.templateService.processFieldsConfiguration<IDocumentCardComponentProps>(this.props.fieldsConfiguration, this.props.item, this.props.context);
        }

        if (processedProps.fileExtension) {
            fileExtension = processedProps.fileExtension.split("?")[0].split("#")[0].split('.').pop();
        }

        if (this.state.showCallout && processedProps.previewUrl && this.props.enablePreview) {

            renderPreviewCallout = <PreviewContainer
                elementUrl={UrlHelper.decode(processedProps.previewUrl)}
                previewImageUrl={UrlHelper.decode(processedProps.previewImage)}
                previewType={PreviewType.Document}
                targetElement={this.documentCardPreviewRef.current}
                showPreview={this.state.showCallout}
            />;
        }

        // Get the current loaded theme
        const theme = merge(getTheme(), this.props.themeVariant);

        // DocumentCard Location styles
        const documentCardLocationProps: IDocumentCardLocationStyleProps = {
            theme: theme
        };

        const documentCardLocationStyles = mergeStyleSets(documentCardLocationGetStyles.getStyles(documentCardLocationProps));
        const documentCardLocationClassNames = classNamesFunction<IDocumentCardLocationStyleProps, IDocumentCardLocationStyles>()(documentCardLocationStyles);

        // We don't use native icon properties from the document preview component beacuse we can't use the uifabric fluent icon (we don't have the image URL)
        const iconstyles: IIconStyles = {
            root: {
                position: 'absolute',
                left: 10,
                bottom: 10
            }
        };

        const documentCardStyles: IDocumentCardStyles = {
            root: {
                margin: '0 auto',
                boxShadow: 'rgba(0, 0, 0, 0.133) 0px 1.6px 3.6px 0px, rgba(0, 0, 0, 0.11) 0px 0.3px 0.9px 0px'
            }
        };

        let previewProps: IDocumentCardPreviewProps = {
            theme: this.props.themeVariant as ITheme,
            previewImages: [
                {
                    name: processedProps.title,
                    previewImageSrc: processedProps.previewImage ? UrlHelper.decode(processedProps.previewImage) : '#',
                    imageFit: ImageFit.centerCover,
                    height: 126
                }
            ]
        };

        if (this.props.isCompact) {
            documentCardStyles.root["minHeight"] = '100%';
            previewProps.styles = {
                root: {
                    minWidth: 120
                }
            };
        }

        let author = "";
        if (processedProps.author) {
            const parts = processedProps.author.split('|');
            author = parts.length === 1 ? parts[0] : parts[1];
        }

        let previewFunc = this.props.enablePreview ? this.showPreviewOnClick : null;

        // Handle item selection
        if (this.props.allowItemSelection && this.props.itemKey) {
            isSelected = this.props.selectedKeys ? this.props.selectedKeys.indexOf(this.props.itemKey.toString()) !== -1 : false;
            renderItemCheck = <div>
                <div data-is-focusable data-selection-select>
                    <Check checked={isSelected}
                        styles={{
                            root: {
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                zIndex: 1
                            }
                        }}
                    />
                </div>
            </div>;

            if (isSelected) {
                documentCardStyles.root = {
                    borderWidth: '2px',
                    borderColor: this.props.themeVariant.semanticColors.primaryButtonBackgroundHovered
                };
            }
        }

        return <div data-is-focusable data-selection-index={this.props.index} data-selection-toggle>
            <DocumentCard
                theme={this.props.themeVariant as ITheme}
                onClick={previewFunc}
                styles={documentCardStyles}
                type={this.props.isCompact ? DocumentCardType.compact : DocumentCardType.normal}
            >
                <div ref={this.documentCardPreviewRef} style={{ position: 'relative', height: '100%' }} data-selection-disabled={!this.props.allowItemSelection}>
                    {renderItemCheck}
                    <DocumentCardPreview {...previewProps} />
                    {this.props.showFileIcon ?
                        <div data-ui-test-id={TestConstants.DocumentCardFileIcon}><FileIcon styles={iconstyles} size="32" extension={fileExtension} isContainer={processedProps.isContainer} /></div> : null
                    }
                </div>
                <DocumentCardDetails>
                    {processedProps.location && !this.props.isCompact ?
                        <div className={documentCardLocationClassNames.root} dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(processedProps.location) }}></div> : null
                    }
                    <Link
                        theme={this.props.themeVariant as ITheme}
                        href={processedProps.href} target='_blank' styles={{
                            root: {
                                selectors: {
                                    ':hover': {
                                        textDecoration: 'underline'
                                    }
                                }
                            }
                        }}>
                        <DocumentCardTitle
                            theme={this.props.themeVariant as ITheme}
                            title={processedProps.title}
                            shouldTruncate={true}
                        />
                    </Link>
                    {processedProps.tags && !this.props.isCompact ?
                        <div className={documentCardLocationClassNames.root} style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(processedProps.tags) }}></div> : null
                    }
                    {processedProps.author ?
                        <DocumentCardActivity
                            theme={this.props.themeVariant as ITheme}
                            activity={processedProps.date}
                            people={[{ name: author, profileImageSrc: processedProps.profileImage }]}
                        /> : null
                    }
                </DocumentCardDetails>
            </DocumentCard>
            {renderPreviewCallout}
        </div>;
    }
}

export class DocumentCardWebComponent extends BaseWebComponent {
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

        const documentCarditem = <DocumentCardComponent {...props} templateService={templateService} />;
        ReactDOM.render(documentCarditem, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}