import * as React from 'react';
import { Icon, SelectionMode, DetailsListLayoutMode, DefaultButton, DetailsList, Panel, TextField, IIconProps, PanelType} from 'office-ui-fabric-react';
import { Guid } from '@microsoft/sp-core-library';
import { IExtensibilityLibrary, IExtension, ExtensibilityService, IExtensibilityEditorProps } from 'search-extensibility';
import * as styles from './ExtensibilityEditor.module.scss';
import * as strings from 'SearchEditComponentsLibraryStrings';


export interface IExtensibilityEditorState {
    libraries: IExtensibilityLibrary[];
    show: boolean;
    reload: boolean;
}

export class ExtensibilityEditor extends React.Component<IExtensibilityEditorProps, IExtensibilityEditorState> {

    private _c = [
        { key: 'i', name: strings.ExtensibilityEditor.IconLabel, fieldName: 'icon', minWidth: 20, maxWidth: 20, isResizable: true, onRender: (item:IExtension<any>)=>{
          return <Icon iconName={item.icon && item.icon != "" ? item.icon : "Settings"} />;
        }},
        { key: 'dn', name: strings.ExtensibilityEditor.DisplayNameLabel, fieldName: 'displayName', minWidth: 100, maxWidth: 150, isResizable: true },
        { key: 'n', name: strings.ExtensibilityEditor.NameLabel, fieldName: 'name', minWidth: 150, maxWidth: 300, isResizable: true },
        { key: 'd', name: strings.ExtensibilityEditor.DescLabel, fieldName: 'description', minWidth: 300, maxWidth: 800, isResizable: true }
      ];

    private _deleteIcon: IIconProps = { iconName: 'Delete' };    
    private _settingsIcon: IIconProps = { iconName: 'Settings' };
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
        const libraries = this.state.libraries.length > 0 
                ? this.state.libraries.map((lib)=>this.renderLibrary(lib,lib.getExtensions()))
                : <p>{strings.ExtensibilityEditor.NoLibrariesAdded}</p>;
        
        return <div className={styles.default.extensibilityEditorButton}>
            <DefaultButton 
                iconProps={this._settingsIcon}
                className={styles.default.addButton}
                onClick={()=>{this.setState({show:!this.state.show});}}>
                    {this.props.label}
                </DefaultButton>
            <Panel
                className={styles.default.extEditorPanel}
                headerText={strings.ExtensibilityEditor.PanelTitle}
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
                        <TextField className={styles.default.addText} placeholder={strings.ExtensibilityEditor.AddPlaceholder} onGetErrorMessage={this.validateLibrary.bind(this)} validateOnFocusOut={true} validateOnLoad={false}></TextField>
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
              <p className={styles.default.description}>{strings.ExtensibilityEditor.NoExtensions}</p>
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
                    >{strings.ExtensibilityEditor.Delete}</DefaultButton>
            </h1>
            <h2 className={styles.default.subTitle}>{strings.ExtensibilityEditor.LibraryDescription}{library.description}</h2>
            <h2 className={styles.default.subTitle}>{strings.ExtensibilityEditor.LibraryGuid}{library.guid.toString()}</h2>
            {lists}
        </div>;
    
    }

    private tryGetLabel(key:string) : string {
        return strings[key + "Label"] || key;
    }

    private async deleteLibrary(removeGuid:Guid) : Promise<void> {
        if(removeGuid && !(await this.props.onLibraryDeleted(removeGuid))) {
            const newLibs = this.state.libraries.filter((lib)=>lib.guid.toString()!==removeGuid.toString());
            this.setState({libraries: newLibs, reload: !this.state.reload});
        }
    }

    private async validateLibrary(guid:string): Promise<string> {
        let libraryGuid:Guid;
        let loadedLibrary:IExtensibilityLibrary;
        
        if(!guid || guid.trim() == "") return strings.ExtensibilityEditor.EnterValidGuid;
        
        if(!(libraryGuid = Guid.tryParse(guid))) return strings.ExtensibilityEditor.EnterValidGuid;

        if(this.libraryAlreadyLoaded(libraryGuid)) return strings.ExtensibilityEditor.LibraryAlreadyLoaded;

        if(loadedLibrary = await this._service.tryLoadExtensibilityLibrary(libraryGuid)) {
            
            const libraryExtensions = loadedLibrary.getExtensions();
            
            if(libraryExtensions && libraryExtensions.length>0) {
            
                this.state.libraries.push(loadedLibrary);
                if(!await this.props.onLibraryAdded(libraryGuid)) {
                    this.setState({libraries:this.state.libraries, reload: !this.state.reload});
                }
            
            } else {
            
                return strings.ExtensibilityEditor.LibraryHasNoExtensions;
            
            }

        } else {

            return strings.ExtensibilityEditor.LibraryCouldNotBeLoaded;

        }

    }

    private libraryAlreadyLoaded(guid:Guid):boolean{
        return (guid && this.state.libraries && this.state.libraries.length>0)
            ? this.state.libraries.filter((i)=>i.guid.toString()===guid.toString()).length > 0
            : false;
    }
}