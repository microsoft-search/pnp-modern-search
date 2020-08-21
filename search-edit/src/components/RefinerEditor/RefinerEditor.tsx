import * as React from 'react';
import { Icon, PrimaryButton, DefaultButton, Panel, IIconProps, PanelType} from 'office-ui-fabric-react';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { IRefinerConfiguration, ISearchContext } from 'search-extensibility';
import { Refiner } from './controls/Refiner/Refiner';
import * as styles from './RefinerEditor.module.scss';
import * as strings from 'SearchEditComponentsLibraryStrings';

export interface IRefinerEditorProps {
    label: string;
    refiners: IRefinerConfiguration[];
    onChange: (refiners: IRefinerConfiguration[]) => Promise<boolean>;
    onAvailablePropertiesUpdated: (properties:IComboBoxOption[])=>void;
    searchService: ISearchContext;
    availableProperties: IComboBoxOption[];
}

export interface IRefinerEditorState {
    refiners: IRefinerConfiguration[];
    show: boolean;
    reload: boolean;
}


export class RefinerEditor extends React.Component<IRefinerEditorProps, IRefinerEditorState> {

    private _deleteIcon: IIconProps = { iconName: 'Delete' };    
    private _settingsIcon: IIconProps = { iconName: 'Settings' };
    private _addIcon: IIconProps = { iconName: 'Add' };
    private _fileRef: HTMLInputElement = null;
    private _cancel:boolean = true;
    
    constructor(props:IRefinerEditorProps, state:IRefinerEditorState){
        super(props);

        this.state = {
            show: false,
            refiners: this.props.refiners,
            reload: true
        };

    }

    public render(){
                
        return <div className={styles.default.refinerEditorButton}>
            <DefaultButton 
                iconProps={this._settingsIcon}
                className={styles.default.addButton}
                onClick={()=>{this.setState({show:!this.state.show});}}>
                    {this.props.label}
                </DefaultButton>
            <Panel
                className={styles.default.refEditorPanel}
                headerText={strings.RefinementEditor.HeaderText}
                isOpen={this.state.show}    
                type={PanelType.medium}
                isLightDismiss={true}
                onDismiss={()=>{
                    this.setState({
                        show: false
                    });
                }}>
                <div className={styles.default.refinerEditor}>
                    <div className={styles.default.addContainer}>
                        {this.props.refiners.map((refiner:IRefinerConfiguration)=>{
                            return <Refiner
                                searchService={this.props.searchService}                   
                                config={refiner}
                                onUpdate={this.onUpdate.bind(this)}
                                onUpdateAvailableProperties={this.props.onAvailablePropertiesUpdated.bind(this)}
                                availableProperties={this.props.availableProperties}>
                            </Refiner>;
                        })}
                    </div>
                </div>
            </Panel>
        </div>;
    }

    private onUpdate(config:IRefinerConfiguration) : Promise<void> {
        
        const newRefiners = this.state.refiners.map((refiner:IRefinerConfiguration)=>{
            return config.refinerName === refiner.refinerName
                ? config
                : refiner;
        });
        
        this.setState({
            refiners: newRefiners
        });

        return;

    }
    
}