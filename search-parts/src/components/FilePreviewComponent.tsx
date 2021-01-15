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

        if (this.state.isCalloutVisible && this.props.previewUrl) {

            renderPreviewCallout = <PreviewContainer
                elementUrl={UrlHelper.decode(this.props.previewUrl)}
                previewImageUrl={this.props.previewImageUrl ? UrlHelper.decode(this.props.previewImageUrl) : UrlHelper.decode(this.props.previewUrl)}
                targetElement={this.elementPreviewRef.current}
                previewType={PreviewType.Document}
                showPreview={this.state.isCalloutVisible}
            />;
        }   

        return  <div>
                    <div 
                        ref={this.elementPreviewRef} 
                        dangerouslySetInnerHTML={ { __html: DOMPurify.default.sanitize(this.props.template) }} 
                        onClick={() => {
                            this.setState({
                                isCalloutVisible: true
                            });
                        }}/>
                    {renderPreviewCallout}
                </div>;
    }
}

export class FilePreviewWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {

       let props = this.resolveAttributes();
       const filePreview = <FilePreview {...props} template={this.innerHTML}/>;
       ReactDOM.render(filePreview, this);
    }    
}