import * as React from 'react';
import { IPreviewContainerProps, PreviewType } from './IPreviewContainerProps';
import IPreviewContainerState from './IPreviewContainerState';
import { Callout } from 'office-ui-fabric-react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import previewContainerStyles from './PreviewContainer.module.scss';
import { IconButton } from 'office-ui-fabric-react';
import { Overlay } from 'office-ui-fabric-react';
import { TestConstants } from '../../common/Constants';

export default class PreviewContainer extends React.Component<IPreviewContainerProps, IPreviewContainerState> {

    public constructor(props: IPreviewContainerProps) {
        super(props);
        this.state = {
            showCallout: false,
            isLoading: true
        };

        this._onCloseCallout = this._onCloseCallout.bind(this);
    }

    public render(): React.ReactElement<IPreviewContainerProps> {

        let renderPreview: JSX.Element = null;

        switch (this.props.previewType) {
            case PreviewType.Document:
                renderPreview = <div data-ui-test-id={TestConstants.PreviewCallout} className={`${previewContainerStyles.iframeContainer} ${this.state.isLoading ? previewContainerStyles.hide : ''}`}>
                                    <iframe 
                                        src={this.props.elementUrl} frameBorder="0"
                                        allowFullScreen
                                        allowTransparency
                                        onLoad={() => { this.setState({ isLoading: false}); }}
                                    >
                                    </iframe>
                                </div>;
            break;

            default:
                break;
        }

        let renderLoading: JSX.Element = this.state.isLoading ? <Overlay isDarkThemed={false} className={previewContainerStyles.overlay}><Spinner size={ SpinnerSize.large }/></Overlay>: null;
        let backgroundImage = this.state.isLoading ? `url('${this.props.previewImageUrl}')` : 'none';
 
        return  <Callout 
                    gapSpace={0} 
                    target={this.props.targetElement} 
                    hidden={false} 
                    className={`${!this.state.showCallout ? previewContainerStyles.hide : ''} ${previewContainerStyles.calloutContainer}`}
                    onDismiss={this.props.previewType === PreviewType.Document ? this._onCloseCallout: null}
                    setInitialFocus={true}
                    preventDismissOnScroll={true}
                    >
                    <div className={previewContainerStyles.calloutHeader}>
                        <IconButton iconProps={{
                            iconName: 'ChromeClose',
                            onClick: this._onCloseCallout
                        }}></IconButton>
                    </div>
                    <div className={previewContainerStyles.calloutContentContainer} style={{backgroundImage: backgroundImage}}>
                        {renderLoading}
                        {renderPreview}
                    </div>
                </Callout>;
    }

    public componentDidMount() {
        this.setState({
            showCallout: this.props.showPreview,
            isLoading: true
        });
    }   

    public componentWillReceiveProps(nextProps: IPreviewContainerProps) {
        this.setState({
            showCallout: nextProps.showPreview
        });
    }

    private _onCloseCallout() {

        this.setState({
            showCallout: false
        });
    }
}
