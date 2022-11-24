import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Icon, ITheme, IIconStyles, ImageFit } from '@fluentui/react';
import { getFileTypeIconProps, FileTypeIconSize, FileIconType } from '@fluentui/react-file-type-icons';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { isEmpty } from '@microsoft/sp-lodash-subset';

export interface IFileIconProps {

    /**
     * The file extension
     */
    extension?: string;

    /**
     * Flag indicating if the item is a container (ex: folder)
     */
    isContainer?: string;

    /**
     * The icon size
     */
    size?: string;

    /**
     * Image url to use as the icon
     */
    imageUrl?: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Styles to apply to the icon
     */
    styles?: IIconStyles;
}

export interface IFileIconState {
}

export class FileIcon extends React.Component<IFileIconProps, IFileIconState> {

    public render() {

        let extension = null;
        let iconProps = null;

        const size = this.props.size ? parseInt(this.props.size) as FileTypeIconSize : 16;

        if (this.props.extension || this.props.isContainer || this.props.imageUrl) {

            let isContainer = this.props.isContainer ? this.props.isContainer.toString() : undefined;
            const isOneNote = this.props.extension && this.props.extension.indexOf("OneNote") !== -1 ? true : false;

            if (this.props.imageUrl && !isEmpty(this.props.imageUrl)) {

                iconProps = { imageProps: { src: this.props.imageUrl, imageFit: ImageFit.contain, width: size + 'px', height: size + 'px' } };

            }
            else if (isContainer && !isOneNote) {
                // Folder
                // SharePointCAML SharePoint REST => FSObjType = 1
                // SharePoint Search => ContentTypeId => 0x0120...
                if ((isContainer === "true" || isContainer === "1" || isContainer.indexOf('0x0120') !== -1)) {
                    iconProps = getFileTypeIconProps({ type: FileIconType.folder, size: size, imageFileType: 'svg' });
                }

                // SharePoint Document Set
                if (isContainer.indexOf('0x0120D520') !== -1) {
                    iconProps = getFileTypeIconProps({ type: FileIconType.docset, size: size, imageFileType: 'svg' });
                }
            }

            if (this.props.extension && !iconProps) {
                extension = isOneNote ? "onetoc" : this.props.extension.split("?")[0].split("#")[0].split('.').pop();
                iconProps = getFileTypeIconProps({ extension: extension, size: size, imageFileType: 'svg' });
            }
        }

        if (isEmpty(iconProps)) {
            iconProps = getFileTypeIconProps({ type: FileIconType.genericFile, size: size, imageFileType: 'svg' });
        }

        return <Icon styles={this.props.styles} theme={this.props.themeVariant as ITheme} {...iconProps} />;
    }
}

export class FileIconWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        let props = this.resolveAttributes();
        const fileIcon = <FileIcon {...props} />;
        ReactDOM.render(fileIcon, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}