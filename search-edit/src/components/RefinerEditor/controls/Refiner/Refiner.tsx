import * as React from 'react';
import { IRefinerConfiguration, ISearchContext, RefinerTemplateOption, RefinersSortOption, RefinerSortDirection } from 'search-extensibility';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ComboBox, IComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import { SearchManagedProperties } from '../../../../controls/SearchManagedProperties/SearchManagedProperties';
import PropertyFieldCodeEditorHost  from '@pnp/spfx-property-controls/lib/propertyFields/codeEditor/PropertyFieldCodeEditorHost';
import { PropertyFieldCodeEditorLanguages } from '@pnp/spfx-property-controls/lib/propertyFields/codeEditor/IPropertyFieldCodeEditor';
import * as styles from './Refiner.module.scss';
import * as strings from 'SearchEditComponentsLibraryStrings';

export interface IRefinerProps {
    searchService: ISearchContext;
    config: IRefinerConfiguration; 
    onUpdate : (config:IRefinerConfiguration) => Promise<void>;
    onUpdateAvailableProperties: (properties:IComboBoxOption[])=>void;
    availableProperties: IComboBoxOption[];
}

export interface IRefinerState {
    config: IRefinerConfiguration;
}

export class Refiner extends React.Component<IRefinerProps, IRefinerState> {

    constructor(props:IRefinerProps) {
        super(props);
        this.state = { config: this.props.config };
    }

    public render() {

        return <div className={styles.default.refiner}>
            <div className={styles.default.property}>
                <SearchManagedProperties
                    defaultSelectedKey={this.props.config.refinerName}
                    onUpdate={(newValue: string, isSortable: boolean)=>{
                        const config = this.state.config;
                        config.refinerName = newValue;
                        this.setState({
                            config: config
                        });
                    }}
                    searchService={this.props.searchService}
                    validateSortable={false}
                    availableProperties={this.props.availableProperties}
                    onUpdateAvailableProperties={(properties:IComboBoxOption[])=>{
                        this.props.onUpdateAvailableProperties(properties);
                    }}></SearchManagedProperties>
            </div>
            <div className={styles.default.displayName}>
                <TextField value={this.props.config.displayValue}></TextField>
            </div>
            <div className={styles.default.templateType}>
                <ComboBox options={this._getTemplates()} 
                    selectedKey={this.props.config.template}
                    onChange={this._templateChanged.bind(this)}
                ></ComboBox>
            </div>
            <div className={styles.default.sortType}>
                <ComboBox options={this._getSortTypes()}
                    selectedKey={this.props.config.refinerSortType}
                    onChange={this._sortTypeChanged.bind(this)}>
                </ComboBox>
            </div>
            <div className={styles.default.sortDirection}>
                <ComboBox options={this._getSortDirection()}
                    selectedKey={this.props.config.refinerSortDirection}
                    onChange={this._sortDirectionChanged.bind(this)}>
                </ComboBox>
            </div>
            {this.props.config.template === RefinerTemplateOption.Custom
                ? <div className={styles.default.customTemplate}>
                   <PropertyFieldCodeEditorHost
                        label={strings.RefinementEditor.Templates.CustomEditLabel}
                        targetProperty={"customTemplate"}
                        panelTitle={strings.RefinementEditor.Templates.CustomEditRefinerTemplate}
                        language={PropertyFieldCodeEditorLanguages.Handlebars}
                        initialValue={this.props.config.customTemplate}
                        onDispose={null}
                        onRender={this.render.bind(this)}
                        onChange={this._customTemplateChanged.bind(this)}
                        onPropertyChange={null}
                        properties={this.state.config}
                        key={this.props.config.refinerName}
                        disabled={false}
                        deferredValidationTime={200}>
                   </PropertyFieldCodeEditorHost>
                </div>
            : null}
        </div>;

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

    private _updateState(config:IRefinerConfiguration): void {
        this.setState({
            config: config
        });
        this.props.onUpdate(config);
    }

}