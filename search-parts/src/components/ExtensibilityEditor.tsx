
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, SelectionMode, DetailsListLayoutMode, IconButton, DetailsList, Panel, TextField, Button, IIconProps} from 'office-ui-fabric-react';
import { IExtensibilityLibrary, IExtension } from 'search-extensibility';
import { Guid } from '@microsoft/sp-core-library';
import * as styles from './ExtensibilityEditor.module.scss';
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
        { key: 'icon', name: strings.Extensibility.IconLabel, fieldName: 'icon', minWidth: 20, maxWidth: 20, isResizable: true, onRender: (item:IExtension<any>)=>{
          return <Icon iconName={item.icon && item.icon != "" ? item.icon : "Settings"} />;
        }},
        { key: 'colDisplayName', name: strings.Extensibility.DisplayNameLabel, fieldName: 'displayName', minWidth: 100, maxWidth: 150, isResizable: true },
        { key: 'colName', name: strings.Extensibility.IconLabel, fieldName: 'name', minWidth: 150, maxWidth: 300, isResizable: true },
        { key: 'colDesc', name: strings.Extensibility.DescLabel, fieldName: 'description', minWidth: 300, maxWidth: 800, isResizable: true }
      ];

    private _deleteIcon: IIconProps = { iconName: 'Delete' };    

    public render(){
        
        const libraries = this.props.libraries.map((lib,ext)=>this.renderLibrary(lib,lib[ext]));

        return <Panel>
            <div className={styles.default.extensibilityEditor}>
                <div className={styles.default.addContainer}>
                    <TextField className={styles.default.addText}></TextField>
                    <Button className={styles.default.addButton}></Button>
                </div>

            </div>
        </Panel>;
    }

    private renderLibrary(library:IExtensibilityLibrary,extensions:IExtension<any>[]) : JSX.Element {

        if(!extensions || extensions.length === 0) {
          return <div>
              <h2 className={styles.default.subTitle}>{library.name}</h2>
              <p className={styles.default.description}>{strings.Extensibility.NoExtensions}</p>
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
            >{strings.Extensibility.Delete}</IconButton>
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