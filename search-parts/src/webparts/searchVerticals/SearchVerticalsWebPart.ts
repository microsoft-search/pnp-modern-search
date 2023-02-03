import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Guid, UrlQueryParameterCollection, DisplayMode, Log } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    IPropertyPanePage,
    IPropertyPaneField,
    PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import * as commonStrings from 'CommonStrings';
import * as webPartStrings from 'SearchVerticalsWebPartStrings';
import { ISearchVerticalsContainerProps } from './components/ISearchVerticalsContainerProps';
import { ISearchVerticalsWebPartProps } from './ISearchVerticalsWebPartProps';
import { TextField, ITextFieldProps, Dropdown, IDropdownProps, Checkbox } from 'office-ui-fabric-react';
import SearchVerticalsContainer from './components/SearchVerticalsContainer';
import { ComponentType } from '../../common/ComponentType';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { IDataVerticalSourceData } from '../../models/dynamicData/IDataVerticalSourceData';
import { TokenService } from '../../services/tokenService/TokenService';
import { ITokenService, IDataVertical } from '@pnp/modern-search-extensibility';
import { BaseWebPart } from '../../common/BaseWebPart';
import { PageOpenBehavior } from '../../helpers/UrlHelper';
import { IDataVerticalConfiguration } from '../../models/common/IDataVerticalConfiguration';
import commonStyles from '../../styles/Common.module.scss';
import PnPTelemetry from '@pnp/telemetry-js';

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

    public render(): void {

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

            renderRootElement = React.createElement(
                SearchVerticalsContainer,
                {
                    verticals: this.properties.verticals,
                    webPartTitleProps: {
                        displayMode: this.displayMode,
                        title: this.properties.title,
                        updateProperty: (value: string) => {
                            this.properties.title = value;
                        },
                        className: commonStyles.wpTitle
                    },
                    tokenService: this.tokenService,
                    themeVariant: this._themeVariant,
                    onVerticalSelected: this.onVerticalSelected.bind(this),
                    defaultSelectedKey: defaultSelectedKey
                } as ISearchVerticalsContainerProps
            );
        }


        ReactDom.render(renderRootElement, this.domElement);
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
                    }
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
                ]
            }),
            PropertyPaneTextField('defaultVerticalQueryStringParam', {
                label: webPartStrings.PropertyPane.Verticals.DefaultVerticalQueryStringParamLabel,
                description: webPartStrings.PropertyPane.Verticals.DefaultVerticalQueryStringParamDescription
            })
        ];

        return settingFields;
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
