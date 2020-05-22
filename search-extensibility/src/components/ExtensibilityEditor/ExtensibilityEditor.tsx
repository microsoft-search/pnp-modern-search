import * as React from 'react';
import { Icon, SelectionMode, DetailsListLayoutMode, IconButton, DetailsList, Panel, TextField, Button, IIconProps, PanelType} from 'office-ui-fabric-react';
import { IExtensibilityLibrary } from '../../models/IExtensibilityLibrary';
import {  IExtension } from '../../models/IExtension';
import { Guid } from '@microsoft/sp-core-library';
import * as styles from './ExtensibilityEditor.module.scss';
import * as strings from 'ModernSearchExtensibilityLibraryStrings';

export interface IExtensibilityEditorProps {
    label: string;
    allowedExtensions: string[];
    libraries: IExtensibilityLibrary[];
    onLibraryAdded: (id:Guid) => void;
    onLibraryDeleted: (id:Guid) => void;
}

export interface IExtensibilityEditorState {
    libraries: IExtensibilityLibrary[];
    show: boolean;
}

export class ExtensibilityEditor extends React.Component<IExtensibilityEditorProps, IExtensibilityEditorState> {

    private _c = [
        { key: 'i', name: strings.IconLabel, fieldName: 'icon', minWidth: 20, maxWidth: 20, isResizable: true, onRender: (item:IExtension<any>)=>{
          return <Icon iconName={item.icon && item.icon != "" ? item.icon : "Settings"} />;
        }},
        { key: 'dn', name: strings.DisplayNameLabel, fieldName: 'displayName', minWidth: 100, maxWidth: 150, isResizable: true },
        { key: 'n', name: strings.IconLabel, fieldName: 'name', minWidth: 150, maxWidth: 300, isResizable: true },
        { key: 'd', name: strings.DescLabel, fieldName: 'description', minWidth: 300, maxWidth: 800, isResizable: true }
      ];

    private _deleteIcon: IIconProps = { iconName: 'Delete' };    

    constructor(props:IExtensibilityEditorProps, state:IExtensibilityEditorState){
        super(props);
        this.state = {
            show: false,
            libraries: this.props.libraries
        };
    }

    public render(){
        
        const extensions = new Map<Guid, IExtension<any>>();
        const libraries = this.props.libraries.map((lib)=>this.renderLibrary(lib,lib.getExtensions()));

        return <div>
            <IconButton 
                iconProps={this._deleteIcon}
                className={styles.default.addButton}
                onClick={()=>{this.setState({show:!this.state.show});}}>
                    {this.props.label}
                </IconButton>
            <Panel
                    isOpen={this.state.show}    
                    type={PanelType.large}
                    isLightDismiss={true}
                    onDismiss={()=>{
                        this.setState({
                            show: false
                        });
                    }}>
                <div className={styles.default.extensibilityEditor}>
                    <div className={styles.default.addContainer}>
                        <TextField className={styles.default.addText}></TextField>
                        <Button className={styles.default.addButton}></Button>
                    </div>
                    {libraries}
                </div>
            </Panel>
        </div>;
    }

    private renderLibrary(library:IExtensibilityLibrary,extensions:IExtension<any>[]) : JSX.Element {

        if(!extensions || extensions.length === 0) {
          return <div>
              <h2 className={styles.default.subTitle}>{library.name}</h2>
              <p className={styles.default.description}>{strings.NoExtensions}</p>
            </div>;
        }
    
        return <div className={styles.default.library}>
            <h1 className={styles.default.title}>{library.name}</h1>
            <h2 className={styles.default.subTitle}>{library.description}</h2>
            <h2 className={styles.default.subTitle}>{library.guid.toString()}</h2>
            <h2 className={styles.default.subTitle}><Icon iconName={library.icon && library.icon != "" ? library.icon : "Settings"} /></h2>
            <IconButton 
                iconProps={this._deleteIcon}
                className={styles.default.addButton}
                onClick={()=>{this.props.onLibraryDeleted(library.guid);}}
            >{strings.Delete}</IconButton>
            <DetailsList
                compact={true}
                items={extensions}
                columns={this._c}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
                />
        </div>;
    
      }

}