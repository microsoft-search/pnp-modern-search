import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { isEmpty } from '@microsoft/sp-lodash-subset';


export interface IImageState {
    hasError: boolean;
}

interface IImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    errorImage?: string;
    hideOnError?: boolean;
    imageSize?: string;
}

export class ImageComponent extends React.Component<IImageProps, IImageState> {

    constructor(props: IImageProps) {
        super(props);
        this.state = {
            hasError: false
        };

        this.addDefaultSrc = this.addDefaultSrc.bind(this);
    }

    public render() {
        const { errorImage, ...imgProps } = this.props;
        const { src, imageSize } = imgProps;
        if(isEmpty(src)) return null;
        const imgSrc = imageSize ? src.replace('/thumbnails/0/large/content', `/thumbnails/0/${imageSize}/content`) : src;
        return <img {...imgProps} src={imgSrc} onError={this.addDefaultSrc} />;
    }

    private addDefaultSrc(ev: any) {
        if (!this.state.hasError) {
            const element = ev.target as HTMLImageElement;
            if (this.props.hideOnError) {
                try {
                    element.parentElement.removeChild(element);
                } finally {}
            } else {
                element.src = this.props.errorImage;
            }
            this.setState({ hasError: true });
        }
    }
}

export class ImageWebComponent extends BaseWebComponent {
    public constructor() {
        super();
    }

    public connectedCallback() {
        let props = this.resolveAttributes();
        const iconComponent = <ImageComponent {...props} />;
        ReactDOM.render(iconComponent, this);
    }
}