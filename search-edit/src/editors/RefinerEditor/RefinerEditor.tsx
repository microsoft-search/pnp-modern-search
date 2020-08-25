import * as React from 'react';
import { Icon, DefaultButton, Panel, IIconProps, PanelType} from 'office-ui-fabric-react';
import { Text as TextUI } from 'office-ui-fabric-react/lib/Text';
import { IRefinerConfiguration, IRefinerEditorProps, RefinerTemplateOption, RefinersSortOption, RefinerSortDirection } from 'search-extensibility';
import { Refiner } from './controls/Refiner/Refiner';
import * as styles from './RefinerEditor.module.scss';
import * as strings from 'SearchEditComponentsLibraryStrings';
import {
    GroupedList,
    IGroup,
    IGroupDividerProps,
    IGroupedList
} from 'office-ui-fabric-react/lib/components/GroupedList';
import { CommandBarButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';

export interface IRefinerEditorState {
    refiners: IRefinerConfiguration[];
    show: boolean;
    reload: boolean;
    groups: IGroup[];
    addNew: boolean;
}

export interface IRefinerEditorMenuItem extends IOverflowSetItemProps {
    key:string;
    displayName:string;
    icon:string;
    onClick:(key:string) => void;
}

export class RefinerEditor extends React.Component<IRefinerEditorProps, IRefinerEditorState> {

    private _groupedList: IGroupedList;    
    private _settingsIcon: IIconProps = { iconName: 'Settings' };
    private _addIcon: IIconProps = { iconName: 'Add' };
    private _buttonStyles = { root: { padding: '10px' }, menuIcon: { fontSize: '16px' } };

    constructor(props:IRefinerEditorProps, state:IRefinerEditorState){
        super(props);

        this.state = {
            show: false,
            refiners: this.props.refiners,
            reload: true,
            groups: this._createGroups(this.props.refiners),
            addNew: false
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
                onRenderFooter={this.renderPanelFooter.bind(this)}
                onDismiss={()=>{
                    this.setState({
                        show: false
                    });
                }}>
                <div className={styles.default.refinerEditor}>
                    <div className={styles.default.addContainer}>
                        <DefaultButton 
                            iconProps={this._addIcon}
                            className={styles.default.addButton}
                            onClick={this._addRefiner.bind(this)}>
                                {strings.RefinementEditor.AddRefiner}
                        </DefaultButton>
                        
                        {this.state.addNew
                            ? this._renderAddNew()
                            : null}

                    </div>
                    <GroupedList
                        ref='groupedList'
                        componentRef={(g) => { this._groupedList = g; }}
                        items={this.state.refiners}
                        onRenderCell={this._onRenderGroupCell.bind(this)}
                        onShouldVirtualize={() => false}
                        listProps={{ onShouldVirtualize: () => false }}
                        groupProps={{ onRenderHeader: this._onRenderGroupHeader.bind(this) }}
                        groups={this.state.groups}
                        className={styles.default.groupList}
                        />
                </div>
            </Panel>
        </div>;
    }

    private _createGroups(refiners:IRefinerConfiguration[]):IGroup[] {

        const groupHash : Map<string,IGroup> = new Map<string, IGroup>();

        if(this.state && this.state.groups) {
            this.state.groups.map((group: IGroup)=>{
                groupHash.set(group.key, group);
            });
        }

        return refiners.map((refiner:IRefinerConfiguration, index:number)=>{
            const isCollapsed = groupHash.has(refiner.refinerName) ? groupHash.get(refiner.refinerName).isCollapsed : true;
            return {
                key: refiner.refinerName,
                name: refiner.displayValue,
                count: 1,
                startIndex: index,
                isCollapsed: isCollapsed
            };         
        });

    }

    private _onRenderGroupCell(nestingDepth: number, item: IRefinerConfiguration, itemIndex: number) : JSX.Element {
        return <Refiner
            searchService={this.props.searchService}  
            templateService={this.props.templateService}                 
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
                onClick={() => { props.onToggleCollapse(props.group); }}
                className={styles.default.refinerHeader}>
                <div className={styles.default.collapseIcon}>{props.group.isCollapsed ? <Icon className={styles.default.expandCollapse} iconName='ChevronDown' /> : <Icon className={styles.default.expandCollapse} iconName='ChevronUp' /> }</div>
                <TextUI variant={'large'}>{props.group.name}</TextUI>
                <OverflowSet className={styles.default.refinerMenu} 
                    role="menubar" 
                    items={menuItems} 
                    onRenderItem={this._onRenderCommandItem.bind(this)} 
                    onRenderOverflowButton={null} />
            </div>
        );

    }

    private _renderAddNew() : JSX.Element {

        const newItem = {
                refinerName: "",
                displayValue: "",
                template: RefinerTemplateOption.CheckBox,
                refinerSortType: RefinersSortOption.Default,
                refinerSortDirection: RefinerSortDirection.Ascending,
                showExpanded:false,
                showValueFilter:false
            };

        return <div className={styles.default.newItem}>
            <Refiner
                searchService={this.props.searchService}   
                templateService={this.props.templateService}                
                config={newItem}
                onUpdate={this.onUpdate.bind(this)}
                onUpdateAvailableProperties={this.props.onAvailablePropertiesUpdated.bind(this)}
                availableProperties={this.props.availableProperties}
                isNew={true}>
            </Refiner>
        </div>;

    }

    private async _addRefiner(newRefiner:IRefinerConfiguration): Promise<void> {
        await this._updateState({
            addNew: true
        });
    }

    private async _moveUp(refinerName: string) : Promise<void> {
        const refiners = this._reorder(refinerName, this.state.refiners, -1);
        await this._updateState({
            refiners: refiners,
            groups: this._createGroups(refiners)
        });
    }

    private async _moveDown(refinerName: string) : Promise<void> {
        const refiners = this._reorder(refinerName, this.state.refiners, 1);
        await this._updateState({
            refiners: refiners,
            groups: this._createGroups(refiners)
        });        
    }

    private _reorder(refinerName: string, refiners: IRefinerConfiguration[], dir: number) : IRefinerConfiguration[] {
        let index : number = -1;
        if(refiners.some((refiner, i)=>{
            index = i;
            return refiner.refinerName === refinerName;
        })) {
            const sp = index+dir;
            const t : IRefinerConfiguration = refiners.splice(index, 1)[0];
            refiners.splice(index+dir, 0, t);
            return refiners;
        }
    }

    private async _delete(refinerName: string) : Promise<void> {
        const refiners = this.state.refiners.filter((refiner:IRefinerConfiguration)=>refiner.refinerName !== refinerName);
        await this._updateState({
            refiners: refiners,
            groups: this._createGroups(refiners)
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

    private async onUpdate(config:IRefinerConfiguration, isNew?:boolean) : Promise<void> {
        
        let newRefiners : IRefinerConfiguration[] = this.state.refiners;
        let addNew:boolean = this.state.addNew;

        if(isNew) {
            newRefiners.push(config);
            addNew = false;
        } else {
            newRefiners = this.state.refiners.map((refiner:IRefinerConfiguration)=>{
                return config.refinerName === refiner.refinerName ? config : refiner;
            });
        }
        
        await this._updateState({
            refiners: newRefiners,
            groups: this._createGroups(newRefiners),
            addNew: addNew
        });

        return;

    }

    private async _updateState(newState:any) : Promise<void>{
        this.setState(newState);
    }

    private renderPanelFooter() : JSX.Element {
        return <div className={styles.default.footerPanel}>
            <PrimaryButton onClick={this._saveRefiners.bind(this)}>
                {strings.RefinementEditor.SaveButtonLabel}
            </PrimaryButton>
            <DefaultButton onClick={()=>{this.setState({show:false});}}>{strings.RefinementEditor.CancelButtonLabel}</DefaultButton>
        </div>;
    }

    private async _saveRefiners() : Promise<void> {
        await this.props.onChange(this.state.refiners);
        this._updateState({show:false});
    }
    
}