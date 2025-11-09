import * as React from "react";
import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneChoiceGroup, PropertyPaneButtonType, PropertyPaneButton } from "@microsoft/sp-property-pane";
import { TemplateValueFieldEditor, ITemplateValueFieldEditorProps } from "../../../controls/TemplateValueFieldEditor/TemplateValueFieldEditor";
import { IComboBoxOption, Icon, IIconProps } from '@fluentui/react';
import { IComponentFieldsConfiguration } from "../../../models/common/IComponentFieldsConfiguration";
import * as strings from 'CommonStrings';
import { loadMsGraphToolkit } from "../../../helpers/GraphToolKitHelper";

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

    /**
     * Flag indicating if the persona card should be displayed on hover using native LPC
     */
    showPersonaCardNative: boolean;

    /**
     * Flag indicating whether to show presence-information or not
     */
    showPersonaPresenceInfo: boolean;

    /**
     * When true, the hover card (native LPC or Graph Toolkit card) should only trigger when hovering the persona image (coin) instead of the whole row.
     */
    showHoverOnPictureOnly: boolean;
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
                { name: strings.Layouts.People.Fields.TertiaryText, field: 'tertiaryText', value: "{{getUserEmail (slot item @root.slots.UserEmail)}}", useHandlebarsExpr: true, supportHtml: true },
                { name: strings.Layouts.People.Fields.OptionalText, field: 'optionalText', value: "WorkPhone", useHandlebarsExpr: false, supportHtml: true },
                { name: strings.Layouts.People.Fields.UPN, field: 'upn', value: "{{getUserEmail (slot item @root.slots.UserEmail)}}", useHandlebarsExpr: true, supportHtml: false },
            ] as IComponentFieldsConfiguration[];
        }
        
        // for backwards-compatibility reasons, add the UPN field if it's not there
        if (!this.properties.peopleFields.some(f => f.field === 'upn')) {
            this.properties.peopleFields.push({ name: strings.Layouts.People.Fields.UPN, field: 'upn', value: "{{getUserEmail (slot item @root.slots.UserEmail)}}", useHandlebarsExpr: true, supportHtml: false } as IComponentFieldsConfiguration);
        }

        if (!this.properties.personaSize) {
            this.properties.personaSize = 14;
        }

        if (this.properties.showHoverOnPictureOnly === undefined) {
            // default value is false
            this.properties.showHoverOnPictureOnly = false;
        }

        const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
            /* webpackChunkName: 'pnp-modern-search-results-people-layout' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
        );

        const { PropertyFieldToggleWithCallout } = await import(
            /* webpackChunkName: 'pnp-modern-search-results-people-layout' */
            '@pnp/spfx-property-controls/lib/PropertyFieldToggleWithCallout'
        );

        const { CalloutTriggers } = await import(
            /* webpackChunkName: 'pnp-modern-search-results-people-layout' */
            '@pnp/spfx-property-controls/lib/common/callout/Callout'
        );

        this._propertyFieldCollectionData = PropertyFieldCollectionData;
        this._customCollectionFieldType = CustomCollectionFieldType;
        this._propertyFieldToogleWithCallout = PropertyFieldToggleWithCallout;
        this._propertyFieldCalloutTriggers = CalloutTriggers;

        if (this.properties.showPersonaCard) {
            // Load Microsoft Graph Toolkit to get the persona card
            await loadMsGraphToolkit(this.context);
        }
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        const availableOptions: IComboBoxOption[] = availableFields.map((fieldName) => { return { key: fieldName, text: fieldName } as IComboBoxOption; });

        const fields: IPropertyPaneField<any>[] = [];

        fields.push(
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
                        type: this._customCollectionFieldType.string,
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
                        type: this._customCollectionFieldType.custom,
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
                        type: this._customCollectionFieldType.boolean,
                        title: strings.Layouts.People.UseHandlebarsExpressionLabel
                    }
                ]
            })
        );

        fields.push(
            PropertyPaneButton('layoutProperties.resetFields', {
                buttonType: PropertyPaneButtonType.Command,
                icon: 'Refresh',
                text: strings.Layouts.People.ResetFieldsBtnLabel,
                onClick: () => {
                    // Just reset the fields
                    this.properties.peopleFields = null;
                    this.onInit();
                }
            })
        );

        // Mutually exclusive persona card toggles with better UX:
        // Instead of silently clearing the opposing toggle after selection, we disable it and show a helper label.
        const nativeEnabled: boolean = this.properties.showPersonaCardNative === true;
        const nonNativeEnabled: boolean = this.properties.showPersonaCard === true;

        // Ensure only one stored value can be true (data integrity) while still providing a disabled opposing toggle.
        if (nativeEnabled && nonNativeEnabled) {
            // If both somehow ended up true (legacy config), prefer native and disable non-native.
            this.properties.showPersonaCard = false;
        }

        fields.push(
            this._propertyFieldToogleWithCallout('layoutProperties.showPersonaCardNative', {
                label: strings.Layouts.People.ShowPersonaCardOnHoverNative,
                calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
                key: 'layoutProperties.showPersonaCardNative',
                calloutContent: React.createElement('p', { style: { maxWidth: 250, wordBreak: 'break-word' } }, strings.Layouts.People.ShowPersonaCardOnHoverCalloutMsgNative),
                onText: strings.General.OnTextLabel,
                offText: strings.General.OffTextLabel,
                checked: nativeEnabled,
                disabled: nonNativeEnabled // disable if the other is active
            })
        );

        fields.push(
            this._propertyFieldToogleWithCallout('layoutProperties.showPersonaCard', {
                label: strings.Layouts.People.ShowPersonaCardOnHover,
                calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
                key: 'layoutProperties.showPersonaCard',
                calloutContent: React.createElement('p', { style: { maxWidth: 250, wordBreak: 'break-word' } }, strings.Layouts.People.ShowPersonaCardOnHoverCalloutMsg),
                onText: strings.General.OnTextLabel,
                offText: strings.General.OffTextLabel,
                checked: nonNativeEnabled,
                disabled: nativeEnabled // disable if native is active
            })
        );

        // Removed helper label to keep the pane clean; exclusivity is enforced via disabled state only.

        fields.push(
            this._propertyFieldToogleWithCallout('layoutProperties.showPersonaPresenceInfo', {
                label: strings.Layouts.People.ShowPersonaPresenceInfo,
                calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
                key: 'layoutProperties.showPersonaPresenceInfo',
                calloutContent: React.createElement('p', { style: { maxWidth: 250, wordBreak: 'break-word' } }, strings.Layouts.People.ShowPersonaPresenceInfoCalloutMsg),
                onText: strings.General.OnTextLabel,
                offText: strings.General.OffTextLabel,
                checked: this.properties.showPersonaPresenceInfo
            })
        );

        fields.push(
            this._propertyFieldToogleWithCallout('layoutProperties.showHoverOnPictureOnly', {
                label: strings.Layouts.People.ShowHoverOnPictureOnly,
                calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
                key: 'layoutProperties.showHoverOnPictureOnly',
                calloutContent: React.createElement('p', { style: { maxWidth: 250, wordBreak: 'break-word' } }, strings.Layouts.People.ShowHoverOnPictureOnlyCalloutMsg),
                onText: strings.General.OnTextLabel,
                offText: strings.General.OffTextLabel,
                checked: this.properties.showHoverOnPictureOnly,
                disabled: !this.properties.showPersonaCardNative && !this.properties.showPersonaCard
            })
        );

        fields.push(
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
            })
        );

        return fields;
    }

    public async onPropertyUpdate(propertyPath: string, newValue: any, oldValue: any) {

        if (propertyPath.localeCompare('layoutProperties.showPersonaCard') === 0 && this.properties.showPersonaCard) {
            // Load Microsoft Graph Toolkit to get the persona card
            await loadMsGraphToolkit(this.context);
        }

        // Auto-reset 'showHoverOnPictureOnly' if both persona card options are now disabled
        if ((propertyPath === 'layoutProperties.showPersonaCard' || propertyPath === 'layoutProperties.showPersonaCardNative') ) {
            const personaCardEnabled = this.properties.showPersonaCard || this.properties.showPersonaCardNative;
            if (!personaCardEnabled && this.properties.showHoverOnPictureOnly) {
                this.properties.showHoverOnPictureOnly = false;
            }
        }
    }
}