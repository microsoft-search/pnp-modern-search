
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, SelectionMode, DetailsListLayoutMode, IconButton, DetailsList, Panel, TextField, Button, IIconProps} from 'office-ui-fabric-react';
import { IExtensibilityLibrary, IExtension } from 'search-extensibility';
import { Guid } from '@microsoft/sp-core-library';
import * as styles from './extensibilityEditor.module.scss';
import * as strings from 'ExtensibilityEditorStrings';

export interface IExtensibilityEditorProps {
    allowedExtensions: string[];
    libraries: IExtensibilityLibrary[];
    onLibraryAdded: (id:Guid) => void;
    onLibraryDeleted: (id:Guid) => void;
}

export interface IExtensibilityEditorState {
    libraries: Map<IExtensibilityLibrary, IExtension<any>[]>;
}

export class ExtensibilityEditor extends React.Component<IExtensibilityEditorProps, IExtensibilityEditorState> {

    private _c = [
        { key: 'icon', name: strings.IconLabel, fieldName: 'icon', minWidth: 20, maxWidth: 20, isResizable: true, onRender: (item:IExtension<any>)=>{
          return <Icon iconName={item.icon && item.icon != "" ? item.icon : "Settings"} />;
        }},
        { key: 'colDisplayName', name: strings.DisplayNameLabel, fieldName: 'displayName', minWidth: 100, maxWidth: 150, isResizable: true },
        { key: 'colName', name: strings.IconLabel, fieldName: 'name', minWidth: 150, maxWidth: 300, isResizable: true },
        { key: 'colDesc', name: strings.DescLabel, fieldName: 'description', minWidth: 300, maxWidth: 800, isResizable: true }
      ];

    private _deleteIcon: IIconProps = { iconName: 'Delete' };    

    public render(){
        
        const libraries = this.props.libraries.map((lib,ext)=>this.renderLibrary(lib,lib[ext]));

        return <Panel>
            <div className={styles.extensibilityEditor}>
                <div className={styles.addContainer}>
                    <TextField className={styles.addText}></TextField>
                    <Button className={styles.addButton}></Button>
                </div>

            </div>
        </Panel>;
    }

    private renderLibrary(library:IExtensibilityLibrary,extensions:IExtension<any>[]) : JSX.Element {

        if(!extensions || extensions.length === 0) {
          return <div>
              <h2 className={styles.subTitle}>{library.name}</h2>
              <p className={styles.description}>{strings.NoExtensions}</p>
            </div>;
        }
    
        return <div className={styles.library}>
            <h1 className={styles.title}>{library.name}</h1>
            <h2 className={styles.subTitle}>{library.description}</h2>
            <h2 className={styles.subTitle}>{library.guid.toString()}</h2>
            <h2 className={styles.subTitle}><Icon iconName={library.icon && library.icon != "" ? library.icon : "Settings"} /></h2>
            <IconButton 
                iconProps={this._deleteIcon}
                className={styles.button}
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