import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import PreviewContainer from '../controls/PreviewContainer/PreviewContainer';
import { PreviewType } from '../controls/PreviewContainer/IPreviewContainerProps';
import { UrlHelper } from '../helpers/UrlHelper';
import * as DOMPurify from 'dompurify';

export interface IFilePreviewProps {

    /**
     * The file extension
     */
    extension?: string;

    /**
     * The file URL
     */
    previewUrl?: string;

    /**
     * The file preview image
     */
    previewImageUrl?: string;

    /**
     * The inner HTML content to wrap with the file viewer
     */
    template?: string;
}

export interface IFileIconState {
    isCalloutVisible: boolean;
}

export class FilePreview extends React.Component<IFilePreviewProps, IFileIconState> {

    private elementPreviewRef = React.createRef<HTMLDivElement>();

    constructor(props) {
        super(props);

        this.state = {
            isCalloutVisible: false
        };
    }

    public render() {

        let renderPreviewCallout: JSX.Element = null;

        let previewUrl = this.props.previewUrl;

        // Fallback to thumbnail in iframe if different domain as auth won't work cross domains
        if(previewUrl && this.props.previewImageUrl && !this.isCurrentDomain(previewUrl)) {
            previewUrl = this.props.previewImageUrl;
        }

        if (!this.props.previewImageUrl) {
            return null;
        }

        if (this.state.isCalloutVisible && previewUrl) {
            renderPreviewCallout = <PreviewContainer
                elementUrl={UrlHelper.decode(previewUrl)}
                previewImageUrl={this.props.previewImageUrl ? UrlHelper.decode(this.props.previewImageUrl) : UrlHelper.decode(previewUrl)}
                targetElement={this.elementPreviewRef.current}
                previewType={PreviewType.Document}
                showPreview={this.state.isCalloutVisible}
            />;
        }

        return <div>
            <div
                ref={this.elementPreviewRef}
                dangerouslySetInnerHTML={{ __html: DOMPurify.default.sanitize(this.props.template) }}
                onClick={() => {
                    this.setState({
                        isCalloutVisible: true
                    });
                }} />
            {renderPreviewCallout}
        </div>;
    }

    /**
     * Check if we're on the same domain
     * @param domain
     */
    private isCurrentDomain(url: string) {
        return url && url.toLocaleLowerCase().indexOf(window.location.hostname.toLocaleLowerCase()) !== -1;
    }
}

export class FilePreviewWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        let props = this.resolveAttributes();
        const filePreview = <FilePreview {...props} template={this.innerHTML} />;
        ReactDOM.render(filePreview, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}