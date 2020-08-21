import * as React from 'react';
import { Icon, PrimaryButton, DefaultButton, Panel, IIconProps, PanelType} from 'office-ui-fabric-react';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { Text as TextUI } from 'office-ui-fabric-react/lib/Text';
import { IRefinerConfiguration, ISearchContext } from 'search-extensibility';
import { Refiner } from './controls/Refiner/Refiner';
import * as styles from './RefinerEditor.module.scss';
import * as strings from 'SearchEditComponentsLibraryStrings';
import {
    GroupedList,
    IGroup,
    IGroupDividerProps,
    IGroupedList
} from 'office-ui-fabric-react/lib/components/GroupedList/index';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';

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

export interface IRefinerEditorMenuItem extends IOverflowSetItemProps {
    key:string;
    displayName:string;
    icon:string;
    onClick:(key:string) => void;

}

export class RefinerEditor extends React.Component<IRefinerEditorProps, IRefinerEditorState> {

    private _groupedList: IGroupedList;
    private _deleteIcon: IIconProps = { iconName: 'Delete' };    
    private _settingsIcon: IIconProps = { iconName: 'Settings' };
    private _addIcon: IIconProps = { iconName: 'Add' };
    private _fileRef: HTMLInputElement = null;
    private _cancel:boolean = true;
    private _buttonStyles = { root: { padding: '10px' }, menuIcon: { fontSize: '16px' } };

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
                    <GroupedList
                        ref='groupedList'
                        componentRef={(g) => { this._groupedList = g; }}
                        items={this.state.refiners}
                        onRenderCell={this._onRenderGroupCell}
                        onShouldVirtualize={() => false}
                        listProps={{ onShouldVirtualize: () => false }}
                        groupProps={{ onRenderHeader: this._onRenderGroupHeader }}
                        groups={this._createGroups(this.state.refiners)} />;
                    </div>
                </div>
            </Panel>
        </div>;
    }

    private _createGroups(refiners:IRefinerConfiguration[]):IGroup[] {

        return refiners.map((refiner:IRefinerConfiguration, index:number)=>{
            return {
                key: refiner.refinerName,
                name: refiner.displayValue,
                count: 1,
                startIndex: index,
                isCollapsed: true
            };         
        });

    }

    private _onRenderGroupCell(nestingDepth: number, item: IRefinerConfiguration, itemIndex: number) : JSX.Element {
        return <Refiner
            searchService={this.props.searchService}                   
            config={item}
            onUpdate={this.onUpdate.bind(this)}
            onUpdateAvailableProperties={this.props.onAvailablePropertiesUpdated.bind(this)}
            availableProperties={this.props.availableProperties}>
        </Refiner>;
    }

    private _onRenderGroupHeader(props: IGroupDividerProps): JSX.Element {

        const menuItems : IRefinerEditorMenuItem[] = [
            { key: 'moveUp', icon: 'Up', displayName: 'moveUp', onClick: this._moveUp.bind(this, [props.group.key]) },
            { key: 'moveDown', icon: 'Down', displayName: 'moveDown', onClick: this._moveDown.bind(this, [props.group.key]) },
            { key: 'delete', icon: 'Delete', displayName: 'delete', onClick: this._delete.bind(this,[props.group.key]) },
        ];

        return (
            <div
                style={props.groupIndex > 0 ? { marginTop: '10px' } : undefined}
                onClick={() => { props.onToggleCollapse(props.group); }}>
                <div>{props.group.isCollapsed ? <Icon iconName='ChevronDown' /> : <Icon iconName='ChevronUp' /> }</div>
                <TextUI variant={'large'}>{props.group.name}</TextUI>
                <OverflowSet role="menubar" items={menuItems} onRenderItem={this._onRenderCommandItem.bind(this)} onRenderOverflowButton={null} />
            </div>
        );

    }    

    private _moveUp(refinerName: string) : void {

    }

    private _moveDown(refinerName: string) : void {

    }

    private _delete(refinerName: string) : void {

    }

    private _onRenderCommandItem(item: IRefinerEditorMenuItem) : JSX.Element {
        return (<CommandBarButton
            role="menuitem"
            title={item.key}
            styles={this._buttonStyles}
            menuIconProps={{ iconName: 'More' }}
            menuProps={{ items: overflowItems! }}
          />);
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