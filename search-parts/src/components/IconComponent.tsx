 import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Icon, ITheme } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface IIconProps {

    /**
     * The Office UI Fabric icon name
     */
    name?: string;

    /**
     * The icon size
     */
    size?: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;
}

export interface IIconState {
}

export class FileIcon extends React.Component<IIconProps, IIconState> {
    
    public render() {
        return <Icon iconName={this.props.name} theme={this.props.themeVariant as ITheme} />;
    }
}

export class IconWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
 
       let props = this.resolveAttributes();
       const fileIcon = <div style={{ display: 'flex' }}><FileIcon {...props}/></div>;
       ReactDOM.render(fileIcon, this);
    }    
}