import * as React from "react";
import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneChoiceGroup, PropertyPaneButtonType, PropertyPaneButton } from "@microsoft/sp-property-pane";
import { TemplateValueFieldEditor, ITemplateValueFieldEditorProps } from "../../../controls/TemplateValueFieldEditor/TemplateValueFieldEditor";
import { IComboBoxOption, Icon, IIconProps } from "office-ui-fabric-react";
import { IComponentFieldsConfiguration } from "../../../models/common/IComponentFieldsConfiguration";
import * as strings from 'CommonStrings';

export interface IPeopleLayoutProperties {

    /**
     * The people field layouts
     */
    peopleFields: IComponentFieldsConfiguration[];

    /**
     * The persona image size
     */
    personaSize: number;

    /**
     * Flag indicating if the persona card should be displayed on hover
     */
    showPersonaCard: boolean;
}

export class PeopleLayout extends BaseLayout<IPeopleLayoutProperties> {

    /**
     * Dynamically loaded components for property pane
     */
    private _propertyFieldCollectionData: any = null;
    private _customCollectionFieldType: any = null;
    private _propertyFieldToogleWithCallout: any = null;
    private _propertyFieldCalloutTriggers: any = null;

    public async onInit(): Promise<void> {

        // Setup default values
        if (!this.properties.peopleFields) {

            this.properties.peopleFields = [
                { name: strings.Layouts.People.Fields.ImageUrl, field: 'imageUrl', value: "/_layouts/15/userphoto.aspx?size=L&username={{getUserEmail (slot item @root.slots.UserEmail)}}", useHandlebarsExpr: true, supportHtml: false },
                { name: strings.Layouts.People.Fields.PrimaryText, field: 'primaryText', value: "{{slot item @root.slots.UserDisplayName}}", useHandlebarsExpr: true, supportHtml: true },
                { name: strings.Layouts.People.Fields.SecondaryText, field: 'secondaryText', value: "JobTitle", useHandlebarsExpr: false, supportHtml: true },
                { name: strings.Layouts.People.Fields.TertiaryText, field: 'tertiaryText',  value: "{{getUserEmail (slot item @root.slots.UserEmail)}}", useHandlebarsExpr: true, supportHtml: true },
                { name: strings.Layouts.People.Fields.OptionalText, field: 'optionalText' , value: "WorkPhone", useHandlebarsExpr: false, supportHtml: true },
            ] as IComponentFieldsConfiguration[];
        }

        if (!this.properties.personaSize) {
            this.properties.personaSize = 14;
        }

        const { PropertyFieldCollectionData, CustomCollectionFieldType  } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
        );

        const { PropertyFieldToggleWithCallout } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldToggleWithCallout'
        );

        const { CalloutTriggers } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/common/callout/Callout'
        );

        this._propertyFieldCollectionData = PropertyFieldCollectionData;
        this._customCollectionFieldType = CustomCollectionFieldType;
        this._propertyFieldToogleWithCallout = PropertyFieldToggleWithCallout;
        this._propertyFieldCalloutTriggers = CalloutTriggers;

        if (this.properties.showPersonaCard) {
            // Load Microsoft Graph Toolkit to get the persona card
            await this.loadMsGraphToolkit();
        }
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        const availableOptions: IComboBoxOption[] = availableFields.map((fieldName) => { return  { key: fieldName, text: fieldName } as IComboBoxOption; });

        return [
            
            this._propertyFieldCollectionData('layoutProperties.peopleFields', {
                manageBtnLabel: strings.Layouts.People.ManagePeopleFieldsLabel,
                key: 'layoutProperties.peopleFields',
                panelHeader: strings.Layouts.People.ManagePeopleFieldsLabel,
                panelDescription: strings.Layouts.People.ManagePeopleFieldsPanelDescriptionLabel,
                enableSorting: false,
                disableItemCreation: true,
                disableItemDeletion: true,
                label: strings.Layouts.People.ManagePeopleFieldsLabel,
                value: this.properties.peopleFields,
                fields: [
                    {
                        id: 'name',
                        type:  this._customCollectionFieldType.string,
                        disableEdit: true,
                        title: strings.Layouts.People.PlaceholderNameFieldLabel
                    },
                    {
                        id: 'supportHtml',
                        type: this._customCollectionFieldType.custom,
                        disableEdit: true,
                        title: strings.Layouts.People.SupportHTMLColumnLabel,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                            if (item.supportHtml) {
                                return React.createElement(Icon, { iconName: 'CheckMark' } as IIconProps);
                            }
                        }
                    },
                    {
                        id: 'value',
                        type:  this._customCollectionFieldType.custom,
                        title: strings.Layouts.People.PlaceholderValueFieldLabel,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                            return React.createElement("div", { key: `${field.id}-${itemId}` }, 
                                React.createElement(TemplateValueFieldEditor, {
                                    currentItem: item,
                                    field: field,
                                    useHandlebarsExpr: item.useHandlebarsExpr,
                                    onUpdate: onUpdate,
                                    value: value,
                                    availableProperties: availableOptions,
                                } as ITemplateValueFieldEditorProps)
                            );
                        }
                    },
                    {
                        id: 'useHandlebarsExpr',
                        type:  this._customCollectionFieldType.boolean,
                        title: strings.Layouts.People.UseHandlebarsExpressionLabel
                    }
                ]
            }),
            PropertyPaneButton('layoutProperties.resetFields', {
                buttonType: PropertyPaneButtonType.Command,
                icon: 'Refresh',
                text: strings.Layouts.People.ResetFieldsBtnLabel,
                onClick: ()=> {
                    // Just reset the fields
                    this.properties.peopleFields = null;
                    this.onInit();
                }
            }),
            this._propertyFieldToogleWithCallout('layoutProperties.showPersonaCard', {
                label: strings.Layouts.People.ShowPersonaCardOnHover,
                calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
                key: 'layoutProperties.showPersonaCard',
                calloutContent: React.createElement('p', { style:{ maxWidth: 250, wordBreak: 'break-word' }}, strings.Layouts.People.ShowPersonaCardOnHoverCalloutMsg),
                onText: strings.General.OnTextLabel,
                offText: strings.General.OffTextLabel,
                checked: this.properties.showPersonaCard
            }),
            PropertyPaneChoiceGroup('layoutProperties.personaSize', {
                label: strings.Layouts.People.PersonaSizeOptionsLabel,
                options: [
                    {
                        key: 11,
                        text: strings.Layouts.People.PersonaSizeExtraSmall
                    },
                    {
                        key: 12,
                        text: strings.Layouts.People.PersonaSizeSmall
                    },
                    {
                        key: 13,
                        text: strings.Layouts.People.PersonaSizeRegular
                    },
                    {
                        key: 14,
                        text: strings.Layouts.People.PersonaSizeLarge
                    },
                    {
                        key: 15,
                        text: strings.Layouts.People.PersonaSizeExtraLarge
                    }
                ]
            }),      
        ];
    }

    public async onPropertyUpdate(propertyPath: string, newValue: any, oldValue: any) {

        if (propertyPath.localeCompare('layoutProperties.showPersonaCard') === 0  && this.properties.showPersonaCard) {
            // Load Microsoft Graph Toolkit to get the persona card
            await this.loadMsGraphToolkit();
        }
    }

    /**
     * Loads the Microsoft Graph Toolkit library dynamically
     */
    private async loadMsGraphToolkit() {

        // Load Microsoft Graph Toolkit dynamically
        const { Providers, SharePointProvider } = await import(
            /* webpackChunkName: 'microsoft-graph-toolkit' */
            '@microsoft/mgt/dist/es6'
        );

        Providers.globalProvider = new SharePointProvider(this.context);
    }
}