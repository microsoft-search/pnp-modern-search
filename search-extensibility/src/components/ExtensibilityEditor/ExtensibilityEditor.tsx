import * as React from 'react';
import { Icon, SelectionMode, DetailsListLayoutMode, DefaultButton, DetailsList, Panel, TextField, IIconProps, PanelType} from 'office-ui-fabric-react';
import { IExtensibilityLibrary } from '../../models/IExtensibilityLibrary';
import {  IExtension } from '../../models/IExtension';
import { ExtensibilityService } from '../../service/ExtensibilityService';
import { Guid } from '@microsoft/sp-core-library';
import * as styles from './ExtensibilityEditor.module.scss';
import * as strings from 'ModernSearchExtensibilityLibraryStrings';

export interface IExtensibilityEditorProps {
    label: string;
    allowedExtensions: string[];
    libraries: IExtensibilityLibrary[];
    onLibraryAdded: (id:Guid) => Promise<boolean>;
    onLibraryDeleted: (id:Guid) => Promise<boolean>;
}

export interface IExtensibilityEditorState {
    libraries: IExtensibilityLibrary[];
    show: boolean;
    reload: boolean;
}

export class ExtensibilityEditor extends React.Component<IExtensibilityEditorProps, IExtensibilityEditorState> {

    private _c = [
        { key: 'i', name: strings.IconLabel, fieldName: 'icon', minWidth: 20, maxWidth: 20, isResizable: true, onRender: (item:IExtension<any>)=>{
          return <Icon iconName={item.icon && item.icon != "" ? item.icon : "Settings"} />;
        }},
        { key: 'dn', name: strings.DisplayNameLabel, fieldName: 'displayName', minWidth: 100, maxWidth: 150, isResizable: true },
        { key: 'n', name: strings.NameLabel, fieldName: 'name', minWidth: 150, maxWidth: 300, isResizable: true },
        { key: 'd', name: strings.DescLabel, fieldName: 'description', minWidth: 300, maxWidth: 800, isResizable: true }
      ];

    private _deleteIcon: IIconProps = { iconName: 'Delete' };    
    private _settingsIcon: IIconProps = { iconName: 'Settings' };
    private _addIcon: IIconProps = { iconName: 'Add' };
    private _service: ExtensibilityService = null;

    constructor(props:IExtensibilityEditorProps, state:IExtensibilityEditorState){
        super(props);
        
        this._service = new ExtensibilityService();

        this.state = {
            show: false,
            libraries: this.props.libraries,
            reload: true
        };

    }

    public render(){
        
        const extensions = new Map<Guid, IExtension<any>>();
        const libraries = this.props.libraries.length > 0 
                ? this.props.libraries.map((lib)=>this.renderLibrary(lib,lib.getExtensions()))
                : <p>{strings.NoLibrariesAdded}</p>;
        
        return <div className={styles.default.extensibilityEditorButton}>
            <DefaultButton 
                iconProps={this._settingsIcon}
                className={styles.default.addButton}
                onClick={()=>{this.setState({show:!this.state.show});}}>
                    {this.props.label}
                </DefaultButton>
            <Panel
                className={styles.default.extEditorPanel}
                headerText={strings.PanelTitle}
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
                        <TextField className={styles.default.addText} placeholder={strings.AddPlaceholder} onGetErrorMessage={this.validateLibrary.bind(this)} validateOnFocusOut={true} validateOnLoad={false}></TextField>
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

        let lists : JSX.Element = <div className={styles.default.extensions} >{this.props.allowedExtensions.map((extensionType:string)=> {
            const extensionsOfType = this._service.filter(library.getExtensions(), extensionType);
            return extensionsOfType.length > 0 ? <div className={styles.default.libraryContainer}>
                <h2 className={styles.default.subTitle}>{this.tryGetLabel(extensionType)}s</h2>
                <DetailsList
                    compact={true}
                    items={extensionsOfType}
                    columns={this._c}
                    layoutMode={DetailsListLayoutMode.justified}
                    selectionMode={SelectionMode.none}
                    />
            </div> : null;
        })}</div>;
    
        return <div className={styles.default.library}>
            <h1 className={styles.default.title}><Icon iconName={library.icon && library.icon != "" ? library.icon : "Settings"} />
                <span className={styles.default.titleText}>{library.name}</span>
                <DefaultButton 
                    iconProps={this._deleteIcon}
                    className={styles.default.deleteButton}
                    onClick={this.deleteLibrary.bind(this, library.guid)}
                    >{strings.Delete}</DefaultButton>
            </h1>
            <h2 className={styles.default.subTitle}>{strings.LibraryDescription}{library.description}</h2>
            <h2 className={styles.default.subTitle}>{strings.LibraryGuid}{library.guid.toString()}</h2>
            {lists}
        </div>;
    
    }

    private tryGetLabel(key:string) : string {
        return strings[key + "Label"] || key;
    }

    private async deleteLibrary(removeGuid:Guid) : Promise<void> {
        if(removeGuid) {
            if(!(await this.props.onLibraryDeleted(removeGuid))) {
                const newLibs = this.props.libraries.filter((lib)=>lib.guid.toString()!==removeGuid.toString());
                this.setState({libraries: newLibs, reload: !this.state.reload});
            }
        }
    }

    private async validateLibrary(guid:string): Promise<string> {
        let libraryGuid:Guid;
        let loadedLibrary:IExtensibilityLibrary;
        
        if(!guid || guid.trim() == "") return strings.EnterValidGuid;
        
        if(!(libraryGuid = Guid.tryParse(guid))) return strings.EnterValidGuid;

        if(this.libraryAlreadyLoaded(libraryGuid)) return strings.LibraryAlreadyLoaded;

        if(loadedLibrary = await this._service.tryLoadExtensibilityLibrary(libraryGuid)) {
            
            const libraryExtensions = loadedLibrary.getExtensions();
            
            if(libraryExtensions && libraryExtensions.length>0) {
            
                this.props.libraries.push(loadedLibrary);
                if(!await this.props.onLibraryAdded(libraryGuid)) {
                    this.setState({libraries:this.props.libraries, reload: !this.state.reload});
                }
            
            } else {
            
                return strings.LibraryHasNoExtensions;
            
            }

        } else {

            return strings.LibraryCouldNotBeLoaded;

        }

    }

    private libraryAlreadyLoaded(guid:Guid):boolean{
        return (guid && this.props.libraries && this.props.libraries.length>0)
            ? this.props.libraries.filter((i)=>i.guid.toString()===guid.toString()).length > 0
            : false;
    }
}