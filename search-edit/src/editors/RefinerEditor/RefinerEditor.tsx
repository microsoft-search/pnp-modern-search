import * as React from 'react';
import { Icon, DefaultButton, Panel, IIconProps, PanelType} from 'office-ui-fabric-react';
import { Text as TextUI } from 'office-ui-fabric-react/lib/Text';
import { IRefinerConfiguration, ISearchContext,IRefinerEditorProps } from 'search-extensibility';
import { Refiner } from './controls/Refiner/Refiner';
import * as styles from './RefinerEditor.module.scss';
import * as strings from 'SearchEditComponentsLibraryStrings';
import {
    GroupedList,
    IGroup,
    IGroupDividerProps,
    IGroupedList
} from 'office-ui-fabric-react/lib/components/GroupedList';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';

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

    private _groups : IGroup[] = null;
    private _groupedList: IGroupedList;
    private _deleteIcon: IIconProps = { iconName: 'Delete' };    
    private _settingsIcon: IIconProps = { iconName: 'Settings' };
    private _addIcon: IIconProps = { iconName: 'Add' };
    private _fileRef: HTMLInputElement = null;
    private _collapsedState : Map<string,boolean> = null;
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
        if(!this._groups) this._groups = this._createGroups(this.state.refiners);

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
                        onRenderCell={this._onRenderGroupCell.bind(this)}
                        onShouldVirtualize={() => false}
                        listProps={{ onShouldVirtualize: () => false }}
                        groupProps={{ onRenderHeader: this._onRenderGroupHeader.bind(this) }}
                        groups={this._groups} />
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
            { key: 'delete', icon: 'Delete', displayName: 'delete', onClick: () => { this._delete(props.group.key); } },
        ];

        if(props.groupIndex > 0) menuItems.push({ key: 'moveUp', icon: 'Up', displayName: 'moveUp', onClick: () => { this._moveUp(props.group.key); }});
        if(props.groupIndex < (this.state.refiners.length-1)) menuItems.push({ key: 'moveDown', icon: 'Down', displayName: 'moveDown', onClick: () => { this._moveDown(props.group.key); }});

        return (
            <div
                style={props.groupIndex > 0 ? { marginTop: '10px' } : undefined}
                onClick={() => { props.onToggleCollapse(props.group); }}
                className={styles.default.refinerHeader}>
                <div>{props.group.isCollapsed ? <Icon className={styles.default.expandCollapse} iconName='ChevronDown' /> : <Icon className={styles.default.expandCollapse} iconName='ChevronUp' /> }</div>
                <TextUI variant={'large'}>{props.group.name}</TextUI>
                <OverflowSet className={styles.default.refinerMenu} 
                    role="menubar" 
                    items={menuItems} 
                    onRenderItem={this._onRenderCommandItem.bind(this)} 
                    onRenderOverflowButton={null} />
            </div>
        );

    }    

    private _moveUp(refinerName: string) : void {
        this.setState({
            refiners: this._reorder(this.state.refiners, refinerName, -1)
        });
    }

    private _moveDown(refinerName: string) : void {
        this.setState({
            refiners: this._reorder(this.state.refiners, refinerName, 1)
        });        
    }

    private _reorder(refiners: IRefinerConfiguration[], refinerName:string, adder: number) : IRefinerConfiguration[] {
        
        let newConfig : IRefinerConfiguration[] = [];
        let index: number = -1;
        let item: IRefinerConfiguration = null;

        if(refiners.some((config: IRefinerConfiguration, i: number)=>{
                index = i;
                item = config;
                return config.refinerName === refinerName;
            }) && index > -1 && index < refiners.length){
            
            index = index - adder;

            refiners.map((config:IRefinerConfiguration, i:number)=>{
                
                if (i === index) {
                    newConfig.push(item);
                    newConfig.push(config);
                } else if (i !== (index+adder)) {
                    newConfig.push(config);
                }

            });

        }

        return newConfig;

    }

    private _delete(refinerName: string) : void {
        this.setState({
            refiners: this.state.refiners.filter((refiner:IRefinerConfiguration)=>refiner.refinerName !== refinerName)
        });
    }

    private _onRenderCommandItem(item: IRefinerEditorMenuItem) : JSX.Element {
        
        return <CommandBarButton
            role="menuitem"
            title={item.displayName}
            styles={this._buttonStyles}
            iconProps={{iconName:item.icon}}
            onClick={item.onClick.bind(this, [item.key])}
          />;

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