import * as React from 'react';
import { IRefinerConfiguration, ISearchContext, RefinerTemplateOption, RefinersSortOption, RefinerSortDirection, ITemplateContext } from 'search-extensibility';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { ComboBox, IComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import { Checkbox, ICheckboxProps } from 'office-ui-fabric-react/lib/Checkbox';
import { SearchManagedProperties } from '../../../../controls/SearchManagedProperties/SearchManagedProperties';
import PropertyFieldCodeEditorHost  from '@pnp/spfx-property-controls/lib/propertyFields/codeEditor/PropertyFieldCodeEditorHost';
import { PropertyFieldCodeEditorLanguages } from '@pnp/spfx-property-controls/lib/propertyFields/codeEditor/IPropertyFieldCodeEditor';
import * as styles from './Refiner.module.scss';
import * as strings from 'SearchEditComponentsLibraryStrings';

export interface IRefinerProps {
    searchService: ISearchContext;
    templateService: ITemplateContext;
    config: IRefinerConfiguration; 
    onUpdate : (config:IRefinerConfiguration, isNew?:boolean) => Promise<void>;
    onUpdateAvailableProperties: (properties:IComboBoxOption[])=>void;
    availableProperties: IComboBoxOption[];
    isNew?:boolean;
}

export interface IRefinerState {
    config: IRefinerConfiguration;
    error: string;
}

export class Refiner extends React.Component<IRefinerProps, IRefinerState> {
    
    private _addIcon: IIconProps = { iconName: 'Add' };

    constructor(props:IRefinerProps) {
        super(props);
        this.state = { config: this.props.config, error: null };
    }

    public render() {

        return <div className={styles.default.refiner}>

            {this.state.error
                ? <MessageBar messageBarType={MessageBarType.error}
                    dismissButtonAriaLabel='Close'
                    isMultiline={ false }
                    className={styles.default.errorMessage}>
                    {this.state.error}</MessageBar>
                : null}

            <div className={styles.default.property}>
                <Label>{strings.RefinementEditor.AvailableRefinersLabel}</Label>
                <SearchManagedProperties
                    defaultSelectedKey={this.state.config.refinerName}
                    onUpdate={(newValue: string, isSortable: boolean)=>{
                        const config = this.state.config;
                        config.refinerName = newValue;
                        this._updateState(config);
                    }}
                    searchService={this.props.searchService}
                    validateSortable={false}
                    availableProperties={this.props.availableProperties}
                    onUpdateAvailableProperties={(properties:IComboBoxOption[])=>{
                        this.props.onUpdateAvailableProperties(properties);
                    }}></SearchManagedProperties>
            </div>
            <div className={styles.default.displayName}>
                <Label>{strings.RefinementEditor.RefinerDisplayValueField}</Label>
                <TextField required defaultValue={this.state.config.displayValue} placeholder={strings.RefinementEditor.RefinerDisplayValueField} onChange={this._onDisplayNameChanged.bind(this)}></TextField>
            </div>
            <div className={styles.default.templateType}>
                <Label>{strings.RefinementEditor.RefinerTemplateField}</Label>
                <ComboBox required options={this._getTemplates()} 
                    selectedKey={this.state.config.template}
                    onChange={this._templateChanged.bind(this)}
                    placeholder={strings.RefinementEditor.RefinerTemplateField}
                ></ComboBox>
            </div>
            <div className={styles.default.sortType}>
                <Label>{strings.RefinementEditor.Templates.RefinerSortTypeLabel}</Label>
                <ComboBox required options={this._getSortTypes()}
                    selectedKey={this.state.config.refinerSortType}
                    onChange={this._sortTypeChanged.bind(this)}
                    placeholder={strings.RefinementEditor.Templates.RefinerSortTypeLabel}>
                </ComboBox>
            </div>
            <div className={styles.default.sortDirection}>
                <Label>{strings.RefinementEditor.Templates.RefinerSortTypeSortOrderLabel}</Label>
                <ComboBox required options={this._getSortDirection()}
                    selectedKey={this.state.config.refinerSortDirection}
                    onChange={this._sortDirectionChanged.bind(this)}
                    placeholder={strings.RefinementEditor.Templates.RefinerSortTypeSortOrderLabel}>
                </ComboBox>
            </div>
            <div className={styles.default.isCollapsed}>
                <Checkbox label={strings.RefinementEditor.IsCollapsed} checked={this.state.config.showExpanded} onChange={this._onIsCollapsedChanged.bind(this)} />
            </div>
            <div className={styles.default.showValueFilter}>
                <Checkbox label={strings.RefinementEditor.ShowValueFilter} checked={this.state.config.showValueFilter} onChange={this._onShowValueFilterChanged.bind(this)} />
            </div>
            
            {this.state.config.template === RefinerTemplateOption.Custom
                ? this.renderCustomTemplate()
                : null }

            {this.state.config.template === RefinerTemplateOption.Custom
                ? this.renderCustomTemplateUrl()
                : null }

            {this.props.isNew === true
                ? <DefaultButton 
                    iconProps={this._addIcon}
                    className={styles.default.addButton}
                    onClick={this._addNewRefiner.bind(this)}>
                        {strings.RefinementEditor.SaveNewRefiner}
                    </DefaultButton>
                : null}

        </div>;

    }

    private renderCustomTemplate():JSX.Element{
        return <div className={styles.default.customTemplate}>
            <Label>{strings.RefinementEditor.Templates.CustomItemTemplateLabel}</Label>
            
            <PropertyFieldCodeEditorHost
                label={strings.RefinementEditor.Templates.CustomEditLabel}
                targetProperty={"customTemplate"}
                panelTitle={strings.RefinementEditor.Templates.CustomEditRefinerTemplate}
                language={PropertyFieldCodeEditorLanguages.Handlebars}
                initialValue={this.state.config.customTemplate}
                onDispose={null}
                onRender={this.render.bind(this)}
                onChange={this._customTemplateChanged.bind(this)}
                onPropertyChange={null}
                properties={this.state.config}
                key={this.state.config.refinerName}
                disabled={false}
                deferredValidationTime={200}>
            </PropertyFieldCodeEditorHost>
        </div>;
    }

    private renderCustomTemplateUrl():JSX.Element {
        return <div className={styles.default.customTemplateUrl}> 
            <Label>{strings.RefinementEditor.CustomItemTemplateFileLabel}</Label>
            <TextField placeholder={strings.RefinementEditor.EnterDefaultTemplate} defaultValue={this.state.config.customTemplateUrl} onGetErrorMessage={this._onTemplateUrlChange.bind(this)}></TextField>
        </div>;
    }

    private async _onTemplateUrlChange(value: string): Promise<String> {
        const msg = await this.props.templateService.isValidTemplateFile(value);
        if(this.ie(msg)) {
            const config = this.state.config;
            config.customTemplateUrl = value;
            this._updateState(config);
        }
        return msg;
    }

    private _addNewRefiner() : void {
        if(this._updateState(this.state.config)){
            this.props.onUpdate(this.state.config, this.props.isNew);
        }
    }

    private _onShowValueFilterChanged(ev: React.FormEvent<HTMLElement>, checked: boolean): void {
        const config = this.state.config;
        config.showValueFilter = checked;
        this._updateState(config);
    }

    private _onIsCollapsedChanged(ev: React.FormEvent<HTMLElement>, checked: boolean): void {
        const config = this.state.config;
        config.showExpanded = checked;
        this._updateState(config);
    }

    private _onDisplayNameChanged(event: React.FormEvent<HTMLTextAreaElement>, newValue?:string) : void {
        const config = this.state.config;
        config.displayValue = newValue;
        this._updateState(config);
    }

    private _customTemplateChanged(targetProperty?: string, newValue?: any) : void {
        const config = this.state.config;
        config.customTemplate = newValue;
        this._updateState(config);
    }

    private _sortDirectionChanged(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) : void {
        const config = this.state.config;
        config.refinerSortDirection = option.key as RefinerSortDirection;
        this._updateState(config);
    }

    private _getSortDirection():IComboBoxOption[] {
        return [
            {
                key: RefinerSortDirection.Ascending,
                text: strings.RefinementEditor.Templates.RefinerSortTypeSortDirectionAscending,
                ariaLabel: strings.RefinementEditor.Templates.RefinerSortTypeSortDirectionAscending
            },
            {
                key: RefinerSortDirection.Descending,
                text: strings.RefinementEditor.Templates.RefinerSortTypeSortDirectionDescending,
                ariaLabel: strings.RefinementEditor.Templates.RefinerSortTypeSortDirectionDescending
            }
        ];
    }

    private _sortTypeChanged(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) : void {
        const config = this.state.config;
        config.refinerSortType = option.key as RefinersSortOption;
        this._updateState(config);
    }

    private _getSortTypes():IComboBoxOption[] {
        return [
            {
                key: RefinersSortOption.Default,
                text: "--"
            },
            {
                key: RefinersSortOption.ByNumberOfResults,
                text: strings.RefinementEditor.Templates.RefinerSortTypeByNumberOfResults,
                ariaLabel: strings.RefinementEditor.Templates.RefinerSortTypeByNumberOfResults
            },
            {
                key: RefinersSortOption.Alphabetical,
                text: strings.RefinementEditor.Templates.RefinerSortTypeAlphabetical,
                ariaLabel: strings.RefinementEditor.Templates.RefinerSortTypeAlphabetical
            }
        ];
    }

    private _templateChanged(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) : void {
        const config = this.state.config;
        config.template = option.key as RefinerTemplateOption;
        this._updateState(config);
    }

    private _getTemplates():IComboBoxOption[] {
        return [
            {
              key: RefinerTemplateOption.CheckBox,
              text: strings.RefinementEditor.Templates.RefinementItemTemplateLabel
            },
            {
              key: RefinerTemplateOption.CheckBoxMulti,
              text: strings.RefinementEditor.Templates.MutliValueRefinementItemTemplateLabel
            },
            {
              key: RefinerTemplateOption.DateRange,
              text: strings.RefinementEditor.Templates.DateRangeRefinementItemLabel,
            },
            {
              key: RefinerTemplateOption.FixedDateRange,
              text: strings.RefinementEditor.Templates.FixedDateRangeRefinementItemLabel,
            },
            {
              key: RefinerTemplateOption.Persona,
              text: strings.RefinementEditor.Templates.PersonaRefinementItemLabel,
            },
            {
              key: RefinerTemplateOption.FileType,
              text: strings.RefinementEditor.Templates.FileTypeRefinementItemTemplateLabel
            },
            {
              key: RefinerTemplateOption.FileTypeMulti,
              text: strings.RefinementEditor.Templates.FileTypeMutliValueRefinementItemTemplateLabel
            },
            {
              key: RefinerTemplateOption.ContainerTree,
              text: strings.RefinementEditor.Templates.ContainerTreeRefinementItemTemplateLabel
            },
            {
              key: RefinerTemplateOption.Custom,
              text: strings.RefinementEditor.Templates.CustomItemTemplateLabel
            }
          ];
    }

    private _updateState(config:IRefinerConfiguration): boolean {

        const error = this._validateConfig(config);

        this.setState({
            config: config,
            error: error
        });

        if(this.ie(error) && !this.props.isNew) 
            this.props.onUpdate(config, this.props.isNew);
        
        return this.ie(error);

    }

    private _validateConfig(config:IRefinerConfiguration) : string {
        if(this.ie(config.displayValue)) return "Please enter a valid display name.";
        if(this.ie(config.refinerName)) return "Please select a valid refiner";
        if(config.template == RefinerTemplateOption.Custom
            && (this.ie(config.customTemplate) && this.ie(config.customTemplateUrl))) 
            return "Custom templates require a handlebars template. Please enter a handlebars template or file.";
        return null;
    }

    private ie(s:string) : boolean {
        return !s || s.trim().length == 0;
    }

}