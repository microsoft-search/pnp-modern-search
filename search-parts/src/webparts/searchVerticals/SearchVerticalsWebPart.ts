import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Guid, UrlQueryParameterCollection, DisplayMode, Log } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    IPropertyPanePage,
    IPropertyPaneField,
    IPropertyPaneGroup,
    PropertyPaneTextField,
    PropertyPaneSlider,
    PropertyPaneDropdown,
    PropertyPaneButton,
    PropertyPaneButtonType
} from '@microsoft/sp-property-pane';
import { PropertyFieldColorPicker, PropertyFieldColorPickerStyle } from '@pnp/spfx-property-controls/lib/PropertyFieldColorPicker';
import * as commonStrings from 'CommonStrings';
import * as webPartStrings from 'SearchVerticalsWebPartStrings';
import { ISearchVerticalsContainerProps } from './components/ISearchVerticalsContainerProps';
import { ISearchVerticalsWebPartProps } from './ISearchVerticalsWebPartProps';
import SearchVerticalsContainer from './components/SearchVerticalsContainer';
import { ComponentType } from '../../common/ComponentType';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { IDataVerticalSourceData } from '../../models/dynamicData/IDataVerticalSourceData';
import { TokenService } from '../../services/tokenService/TokenService';
import { ITokenService, IDataVertical } from '@pnp/modern-search-extensibility';
import { BaseWebPart } from '../../common/BaseWebPart';
import { PageOpenBehavior } from '../../helpers/UrlHelper';
import { IDataVerticalConfiguration } from '../../models/common/IDataVerticalConfiguration';
import { AudienceTargetingService } from '../../services/audienceTargetingService/AudienceTargetingService';
import { IPropertyFieldGroupOrPerson } from '@pnp/spfx-property-controls';
import commonStyles from '../../styles/Common.module.scss';
import PnPTelemetry from '@pnp/telemetry-js';
import type { IDynamicPerson } from '@microsoft/mgt-react';
import { loadMsGraphToolkit } from '../../helpers/GraphToolKitHelper';
import { LocalizationHelper } from "@microsoft/mgt-element/dist/es6/utils/LocalizationHelper";
import { ITextFieldProps, TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownProps } from '@fluentui/react/lib/Dropdown';
import { Checkbox } from '@fluentui/react/lib/Checkbox';

const PeoplePicker = React.lazy(() =>
    import(/* webpackChunkName: 'microsoft-graph-toolkit' */ '@microsoft/mgt-react/dist/es6/generated/people-picker')
        .then(({ PeoplePicker }) => ({ default: PeoplePicker }))
);

const LogSource = "SearchVerticalsWebPart";

export default class DataVerticalsWebPart extends BaseWebPart<ISearchVerticalsWebPartProps> implements IDynamicDataCallables {

    /**
     * Dynamically loaded components for property pane
     */
    private _propertyFieldCollectionData: any = null;
    private _propertyPanePropertyEditor = null;
    private _customCollectionFieldType: any = null;
    private _placeholderComponent: any = null;

    /**
     * The current selected vertical
     */
    private _selectedVertical: IDataVertical;

    /**
     * The token service instance
     */
    private tokenService: ITokenService;

    public constructor() {
        super();

        this.onVerticalSelected = this.onVerticalSelected.bind(this);
    }

    protected async onInit(): Promise<void> {
        try {
            // Disable PnP Telemetry
            const telemetry = PnPTelemetry.getInstance();
            telemetry.optOut();
        } catch (error) {
            Log.warn(LogSource, `Opt out for PnP Telemetry failed. Details: ${error}`, this.context.serviceScope);
        }

        loadMsGraphToolkit(this.context);

        // Initializes Web Part properties
        this.initializeProperties();

        // Initializes shared services
        await this.initializeBaseWebPart();

        // Initializes the Web Part instance services
        this.initializeWebPartServices();

        // Initializes this component as a discoverable dynamic data source
        this.context.dynamicDataSourceManager.initializeSource(this);

        if (this.displayMode === DisplayMode.Edit) {
            const { Placeholder } = await import(
                /* webpackChunkName: 'search-verticals-property-pane' */
                '@pnp/spfx-controls-react/lib/Placeholder'
            );
            this._placeholderComponent = Placeholder;
        }
    }

    public async render(): Promise<void> {

        // Check audience targeting - if user is not in audience, don't render
        const isInAudience = await this.isInAudience();
        if (!isInAudience) {
            this.domElement.innerHTML = '';
            return;
        }

        let renderRootElement: JSX.Element = null;

        let defaultSelectedKey: string = undefined;

        // Check if we can find a default vertical to set
        if (this.properties.defaultVerticalQueryStringParam) {
            const queryParms: UrlQueryParameterCollection = new UrlQueryParameterCollection(window.location.href.toLowerCase());
            const defaultQueryVal: string = queryParms.getValue(this.properties.defaultVerticalQueryStringParam.toLowerCase());

            if (defaultQueryVal) {
                const defaultSelected: IDataVerticalConfiguration[] = this.properties.verticals.filter(v => v.tabName.toLowerCase() === decodeURIComponent(defaultQueryVal));
                if (defaultSelected.length === 1) {
                    defaultSelectedKey = defaultSelected[0].key;
                }
            }
        } else {
            const pagename = window.location.pathname.toLowerCase();
            const defaultSelected: IDataVerticalConfiguration[] = this.properties.verticals.filter(v => v.isLink && v.linkUrl.toLowerCase().indexOf(pagename) > -1);
            if (defaultSelected.length === 1) {
                defaultSelectedKey = defaultSelected[0].key;
            }
        }

        if (this.displayMode === DisplayMode.Edit && this.properties.verticals.length === 0) {

            const placeholder: React.ReactElement<any> = React.createElement(
                this._placeholderComponent,
                {
                    iconName: 'Sections',
                    iconText: webPartStrings.General.PlaceHolder.IconText,
                    description: webPartStrings.General.PlaceHolder.Description,
                    buttonLabel: webPartStrings.General.PlaceHolder.ConfigureBtnLabel,
                    onConfigure: () => { this.context.propertyPane.open(); }
                }
            );
            renderRootElement = placeholder;

        } else {

            let verticalsToBeDisplayed = this.properties.verticals;
            // if not in edit mode, filter for verticals without audiences or with audiences based on the current user's group memberships
            if (this.displayMode !== DisplayMode.Edit) {
                verticalsToBeDisplayed = await this._filterVerticalsByAudience(verticalsToBeDisplayed);
            }
            renderRootElement = React.createElement(
                SearchVerticalsContainer,
                {
                    verticals: verticalsToBeDisplayed,
                    webPartTitleProps: {
                        displayMode: this.displayMode,
                        title: this.properties.title,
                        updateProperty: (value: string) => {
                            this.properties.title = value;
                            this.render();
                        },
                        themeVariant: this._themeVariant,
                        className: commonStyles.wpTitle
                    },
                    tokenService: this.tokenService,
                    themeVariant: this._themeVariant,
                    onVerticalSelected: this.onVerticalSelected.bind(this),
                    defaultSelectedKey: defaultSelectedKey,
                    verticalBackgroundColor: this.properties.verticalBackgroundColor,
                    verticalBorderColor: this.properties.verticalBorderColor,
                    verticalBorderThickness: this.properties.verticalBorderThickness,
                    verticalFontSize: this.properties.verticalFontSize,
                    verticalMouseOverColor: this.properties.verticalMouseOverColor,
                    titleFont: this.properties.titleFont,
                    titleFontSize: this.properties.titleFontSize,
                    titleFontColor: this.properties.titleFontColor,
                    instanceId: this.instanceId
                } as ISearchVerticalsContainerProps
            );
        }


        ReactDom.render(renderRootElement, this.domElement);
    }

    /**
     * Filter verticals based on audience targeting configuration.
     * Backwards compatible: supports legacy string[] format (AAD group IDs only)
     * @param verticals Array of vertical configurations to filter
     * @returns Filtered array of verticals the user has access to
     */
    private async _filterVerticalsByAudience(verticals: IDataVerticalConfiguration[]): Promise<IDataVerticalConfiguration[]> {
        const filteredVerticals: IDataVerticalConfiguration[] = [];
        
        for (const vertical of verticals) {
            // If no audience configured, show to everyone
            if (!vertical.audience || vertical.audience.length === 0) {
                filteredVerticals.push(vertical);
                continue;
            }

            // Convert legacy string[] (AAD group IDs) to IPropertyFieldGroupOrPerson[] format
            // This maintains backwards compatibility with existing configurations
            const audienceConfig: IPropertyFieldGroupOrPerson[] = vertical.audience.map((groupId: string) => ({
                id: `c:0o.c|federateddirectoryclaimprovider|${groupId}`,
                login: 'FederatedDirectoryClaimProvider',
                fullName: groupId // We only have the ID in legacy format
            } as IPropertyFieldGroupOrPerson));

            const audienceService = new AudienceTargetingService(
                audienceConfig,
                this.properties.audienceCacheDuration || 1,
                this.context
            );

            const isInAudience = await audienceService.checkAudiences();
            if (isInAudience) {
                filteredVerticals.push(vertical);
            }
        }

        return filteredVerticals;
    }

    public getPropertyDefinitions(): IDynamicDataPropertyDefinition[] {
        // Use the Web Part title as property title since we don't expose sub properties
        return [
            {
                id: ComponentType.SearchVerticals,
                title: this.properties.title ? `${this.properties.title} - ${this.instanceId}` : `${webPartStrings.General.WebPartDefaultTitle} - ${this.instanceId}`
            }
        ];
    }

    public getPropertyValue(propertyId: string) {
        switch (propertyId) {

            case ComponentType.SearchVerticals:
                return {
                    selectedVertical: this._selectedVertical,
                    verticalsConfiguration: this.properties.verticals,
                } as IDataVerticalSourceData;

            default:
                throw new Error('Bad property id');
        }
    }

    protected onPropertyPaneFieldChanged(propertyPath: string) {

        if (propertyPath.localeCompare('verticals') === 0) {

            // Generate an unique key for verticals to be able to identify them precisely in sub components instead using the vertical display name (can be duplicated).
            this.properties.verticals = this.properties.verticals.map(vertical => {
                vertical.key = vertical.key ? vertical.key : Guid.newGuid().toString();
                return vertical;
            });
        }
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

        let propertyPanePages: IPropertyPanePage[] = [];

        propertyPanePages.push(
            {
                groups: [
                    {
                        groupName: webPartStrings.PropertyPane.SearchVerticalsGroupName,
                        groupFields: this._getVerticalsConfguration()
                    },
                    this._getContentStylingGroup(),
                    this._getTitleStylingGroup()
                ],
                displayGroupsAsAccordion: true
            }
        );

        // 'About' infos
        propertyPanePages.push(
            {
                displayGroupsAsAccordion: true,
                groups: [
                    ...this.getPropertyPaneWebPartInfoGroups(),
                    this.getAudienceTargetingPropertyPaneGroup(),
                    {
                        groupName: commonStrings.PropertyPane.InformationPage.ImportExport,
                        groupFields: [
                            this._propertyPanePropertyEditor({
                                webpart: this,
                                key: 'propertyEditor'
                            })
                        ]
                    }
                ]
            }
        );

        return {
            pages: propertyPanePages
        };
    }

    protected async onPropertyPaneConfigurationStart() {
        await this.loadPropertyPaneResources();
    }

    protected async loadPropertyPaneResources(): Promise<void> {

        // tslint:disable-next-line:no-shadowed-variable
        const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
        );

        this._propertyFieldCollectionData = PropertyFieldCollectionData;
        this._customCollectionFieldType = CustomCollectionFieldType;

        const { PropertyPanePropertyEditor } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyPanePropertyEditor'
        );

        this._propertyPanePropertyEditor = PropertyPanePropertyEditor;
    }

    private _getVerticalsConfguration(): IPropertyPaneField<any>[] {

        let settingFields: IPropertyPaneField<any>[] = [
            this._propertyFieldCollectionData('verticals', {
                manageBtnLabel: webPartStrings.PropertyPane.Verticals.ButtonLabel,
                key: 'verticals',
                panelHeader: webPartStrings.PropertyPane.Verticals.PanelHeader,
                panelDescription: webPartStrings.PropertyPane.Verticals.PanelDescription,
                enableSorting: true,
                label: webPartStrings.PropertyPane.Verticals.PropertyLabel,
                value: this.properties.verticals,
                fields: [
                    {
                        id: 'tabName',
                        title: webPartStrings.PropertyPane.Verticals.Fields.TabName,
                        type: this._customCollectionFieldType.string,
                        placeholder: "ex: 'SharePoint'",
                        required: true
                    },
                    {
                        id: 'iconName',
                        title: webPartStrings.PropertyPane.Verticals.Fields.IconName,
                        type: this._customCollectionFieldType.string,
                        placeholder: "ex: 'Document'",
                        required: false
                    },
                    {
                        id: 'tabValue',
                        title: webPartStrings.PropertyPane.Verticals.Fields.TabValue,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(TextField, {
                                        defaultValue: value,
                                        disabled: !item.isLink ? false : true,
                                        onChange: (ev, newValue) => {
                                            onUpdate(field.id, newValue);
                                        }
                                    } as ITextFieldProps)
                                )
                            );
                        }
                    },
                    {
                        id: 'isLink',
                        title: webPartStrings.PropertyPane.Verticals.Fields.IsLink,
                        type: this._customCollectionFieldType.boolean,
                        required: false
                    },
                    {
                        id: 'linkUrl',
                        title: webPartStrings.PropertyPane.Verticals.Fields.LinkUrl,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(TextField, {
                                        defaultValue: value,
                                        disabled: item.isLink ? false : true,
                                        placeholder: 'https://...',
                                        onChange: (ev, newValue) => {
                                            onUpdate(field.id, newValue);
                                        }
                                    } as ITextFieldProps)
                                )
                            );
                        }
                    },
                    {
                        id: 'openBehavior',
                        title: webPartStrings.PropertyPane.Verticals.Fields.OpenBehavior,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Dropdown, {
                                        options: [
                                            {
                                                key: PageOpenBehavior.NewTab,
                                                text: commonStrings.General.NewTabOpenBehavior
                                            },
                                            {
                                                key: PageOpenBehavior.Self,
                                                text: commonStrings.General.SameTabOpenBehavior
                                            },
                                        ],
                                        disabled: item.isLink ? false : true,
                                        defaultSelectedKey: item.openBehavior,
                                        onChange: (ev, option) => onUpdate(field.id, option.key),
                                    } as IDropdownProps)
                                )
                            );
                        }
                    },
                    {
                        id: 'showLinkIcon',
                        title: webPartStrings.PropertyPane.Verticals.Fields.ShowLinkIcon,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Checkbox, {
                                        key: itemId,
                                        checked: value,
                                        disabled: item.isLink ? false : true,
                                        onChange: (evt, checked) => {
                                            onUpdate(field.id, checked);
                                        }
                                    })
                                )
                            );
                        },
                        required: false
                    },
                    {
                        id: 'audience',
                        title: webPartStrings.PropertyPane.Verticals.Fields.Audience,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            const onSelectionChanged = (e: CustomEvent<IDynamicPerson[]>) => {
                                console.log(e.detail);
                                onUpdate(field.id, e.detail.map(p => p.id));
                            };
                            LocalizationHelper.strings = {
                                _components: {
                                    "pnp-modern-search-people-picker": {
                                        inputPlaceholderText: webPartStrings.PropertyPane.Verticals.AudienceInputPlaceholderText,
                                        noResultsFound: webPartStrings.PropertyPane.Verticals.AudienceNoResultsFound,
                                        loading: webPartStrings.PropertyPane.Verticals.AudienceLoading
                                    }
                                }
                            };
                            return (
                                React.createElement("div", null,
                                    React.createElement(React.Suspense, { fallback: React.createElement("div", null, webPartStrings.PropertyPane.Verticals.AudienceLoading) },
                                        React.createElement(PeoplePicker, {
                                            defaultSelectedGroupIds: item.audience || [],
                                            selectionMode: "multiple",
                                            type: "group",
                                            selectionChanged: onSelectionChanged,
                                        })
                                    )
                                )
                            )
                        }
                    }
                ]
            }),
            PropertyPaneTextField('defaultVerticalQueryStringParam', {
                label: webPartStrings.PropertyPane.Verticals.DefaultVerticalQueryStringParamLabel,
                description: webPartStrings.PropertyPane.Verticals.DefaultVerticalQueryStringParamDescription
            })
        ];

        return settingFields;
    }

    private _getContentStylingGroup(): IPropertyPaneGroup {
        return {
            groupName: webPartStrings.PropertyPane.Styling.WebPartContentStylingGroupName,
            isCollapsed: true,
            groupFields: [
                PropertyFieldColorPicker('verticalBackgroundColor', {
                    label: webPartStrings.PropertyPane.Styling.VerticalBackgroundColorLabel,
                    selectedColor: this.properties.verticalBackgroundColor,
                    onPropertyChange: this.onPropertyPaneFieldChanged,
                    properties: this.properties,
                    disabled: false,
                    debounce: 1000,
                    isHidden: false,
                    alphaSliderHidden: false,
                    style: PropertyFieldColorPickerStyle.Inline,
                    key: 'verticalBackgroundColorFieldId'
                }),
                PropertyFieldColorPicker('verticalMouseOverColor', {
                    label: webPartStrings.PropertyPane.Styling.MouseOverColorLabel,
                    selectedColor: this.properties.verticalMouseOverColor,
                    onPropertyChange: this.onPropertyPaneFieldChanged,
                    properties: this.properties,
                    disabled: false,
                    debounce: 1000,
                    isHidden: false,
                    alphaSliderHidden: false,
                    style: PropertyFieldColorPickerStyle.Inline,
                    key: 'verticalMouseOverColorFieldId'
                }),
                PropertyFieldColorPicker('verticalBorderColor', {
                    label: webPartStrings.PropertyPane.Styling.VerticalBorderColorLabel,
                    selectedColor: this.properties.verticalBorderColor,
                    onPropertyChange: this.onPropertyPaneFieldChanged,
                    properties: this.properties,
                    disabled: false,
                    debounce: 1000,
                    isHidden: false,
                    alphaSliderHidden: false,
                    style: PropertyFieldColorPickerStyle.Inline,
                    key: 'verticalBorderColorFieldId'
                }),
                PropertyPaneSlider('verticalBorderThickness', {
                    label: webPartStrings.PropertyPane.Styling.VerticalBorderThicknessLabel,
                    min: 0,
                    max: 10,
                    step: 1,
                    showValue: true,
                    value: this.properties.verticalBorderThickness || 0
                }),
                PropertyPaneSlider('verticalFontSize', {
                    label: webPartStrings.PropertyPane.Styling.VerticalFontSizeLabel,
                    min: 10,
                    max: 32,
                    step: 1,
                    showValue: true,
                    value: this.properties.verticalFontSize || 14
                }),
                PropertyPaneButton('resetContentStylingButton', {
                    text: webPartStrings.PropertyPane.Styling.ResetToDefaultLabel,
                    buttonType: PropertyPaneButtonType.Command,
                    icon: 'Refresh',
                    onClick: this._resetContentStylingToDefault.bind(this)
                })
            ]
        };
    }

    private _getTitleStylingGroup(): IPropertyPaneGroup {
        return {
            groupName: webPartStrings.PropertyPane.Styling.WebPartTitleStylingGroupName,
            isCollapsed: true,
            groupFields: [
                PropertyPaneDropdown('titleFont', {
                    label: webPartStrings.PropertyPane.Styling.TitleFontFamilyLabel,
                    selectedKey: this.properties.titleFont || '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
                    options: [
                        { key: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif', text: 'Segoe UI' },
                        { key: 'Arial, Helvetica, sans-serif', text: 'Arial' },
                        { key: 'Georgia, serif', text: 'Georgia' },
                        { key: '"Times New Roman", Times, serif', text: 'Times New Roman' },
                        { key: 'Verdana, Geneva, sans-serif', text: 'Verdana' },
                        { key: 'Calibri, sans-serif', text: 'Calibri' },
                        { key: '"Trebuchet MS", sans-serif', text: 'Trebuchet MS' },
                        { key: 'Consolas, Monaco, monospace', text: 'Consolas' }
                    ]
                }),
                PropertyPaneSlider('titleFontSize', {
                    label: webPartStrings.PropertyPane.Styling.TitleFontSizeLabel,
                    min: 10,
                    max: 32,
                    step: 1,
                    showValue: true,
                    value: this.properties.titleFontSize || 16
                }),
                PropertyFieldColorPicker('titleFontColor', {
                    label: webPartStrings.PropertyPane.Styling.TitleFontColorLabel,
                    selectedColor: this.properties.titleFontColor,
                    onPropertyChange: this.onPropertyPaneFieldChanged,
                    properties: this.properties,
                    disabled: false,
                    debounce: 1000,
                    isHidden: false,
                    alphaSliderHidden: false,
                    style: PropertyFieldColorPickerStyle.Inline,
                    key: 'titleFontColorFieldId'
                }),
                PropertyPaneButton('resetTitleStylingButton', {
                    text: webPartStrings.PropertyPane.Styling.ResetTitleStylingLabel,
                    buttonType: PropertyPaneButtonType.Command,
                    icon: 'Refresh',
                    onClick: this._resetTitleStylingToDefault.bind(this)
                })
            ]
        };
    }

    private _resetContentStylingToDefault(): void {
        // Reset all content styling properties to their default values
        this.properties.verticalBackgroundColor = undefined;
        this.properties.verticalMouseOverColor = undefined;
        this.properties.verticalBorderColor = undefined;
        this.properties.verticalBorderThickness = undefined;
        this.properties.verticalFontSize = undefined;
        
        // Refresh the property pane to show the reset values
        this.context.propertyPane.refresh();
        
        // Re-render the web part to apply changes
        this.render();
    }
    
    private _resetTitleStylingToDefault(): void {
        // Reset all title styling properties to their default values
        this.properties.titleFont = undefined;
        this.properties.titleFontSize = undefined;
        this.properties.titleFontColor = undefined;
        
        // Refresh the property pane to show the reset values
        this.context.propertyPane.refresh();
        
        // Re-render the web part to apply changes
        this.render();
    }

    private initializeWebPartServices(): void {
        this.tokenService = this.context.serviceScope.consume<ITokenService>(TokenService.ServiceKey);
    }

    /**
     * Initializes required Web Part properties
     */
    private initializeProperties() {

        this.properties.verticals = this.properties.verticals ? this.properties.verticals : [];

        if (this.properties.defaultVerticalQueryStringParam === undefined) {
            this.properties.defaultVerticalQueryStringParam = 'v';
        }

    }

    private async onVerticalSelected(itemKey: string): Promise<void> {

        // Retrieve the search vertical using this id
        const verticals = this.properties.verticals.filter(vertical => {
            return vertical.key === itemKey;
        });

        if (verticals.length > 0) {

            // Resolve tokens for value
            const tabValue = await this.tokenService.resolveTokens(verticals[0].tabValue);

            // Build the selected vertical object without configuration infos
            this._selectedVertical = {
                key: verticals[0].key,
                name: verticals[0].tabName,
                value: tabValue
            };

        } else {
            this._selectedVertical = undefined;
        }

        // Notify subscriber a new vertical has been selected
        this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchVerticals);
    }
}
