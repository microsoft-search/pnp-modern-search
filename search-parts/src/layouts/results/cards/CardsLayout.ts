import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneToggle, PropertyPaneSlider, PropertyPaneButton, PropertyPaneButtonType } from '@microsoft/sp-property-pane';
import { IComponentFieldsConfiguration } from '../../../models/common/IComponentFieldsConfiguration';
import * as strings from 'CommonStrings';
import { Icon, IIconProps, IComboBoxOption } from 'office-ui-fabric-react';
import * as React from "react";
import { TemplateValueFieldEditor, ITemplateValueFieldEditorProps } from "../../../controls/TemplateValueFieldEditor/TemplateValueFieldEditor";

export interface ICardsLayoutProperties {

    /**
     * The document card fields configuration
     */
    documentCardFields: IComponentFieldsConfiguration[];

    /**
     * Shows or hide the file icon in the first column
     */
    showFileIcon: boolean;

    /**
     * Show the details list as compact
     */
    isCompact: boolean;

    /**
     * Indicates of the tile should enable the preview
     */
    enablePreview: boolean;

    /**
     * The prefered number of cards per row
     */
    preferedCardNumberPerRow: number;

    /**
     * The card size in %
     */
    columnSizePercentage: number;
}

export class CardsLayout extends BaseLayout<ICardsLayoutProperties> {

    /**
     * Dynamically loaded components for property pane
     */
    private _propertyFieldCollectionData: any = null;
    private _customCollectionFieldType: any = null;
    private _propertyFieldToogleWithCallout: any = null;
    private _propertyFieldCalloutTriggers: any = null;

    public async onInit(): Promise<void> {

        // Setup default values
        this.properties.documentCardFields = this.properties.documentCardFields ? this.properties.documentCardFields :
                                                [
                                                    { name: strings.Layouts.Cards.Fields.Title, field: 'title', value: '{{slot item @root.slots.Title}}', useHandlebarsExpr: true, supportHtml: false },
                                                    { name: strings.Layouts.Cards.Fields.Location, field: 'location', value: `<a style="color:{{@root.theme.palette.themePrimary}};font-weight:600;font-family:'{{@root.theme.fonts.small.fontFamily}}'" href="{{SPSiteUrl}}">{{SiteTitle}}</a>`, useHandlebarsExpr: true, supportHtml: true },
                                                    { name: strings.Layouts.Cards.Fields.Tags, field: 'tags', value: `{{#if (slot item @root.slots.Tags)}}\n\t<div style="display:flex;align-items:center">\n\t\t<pnp-icon name="Tag" aria-hidden="true"></pnp-icon>\n\t\t{{#each (split (slot item @root.slots.Tags) ',') as |tag| }}\n\t\t\t<a style="margin-left:2px" href="#{{slot item @root.slots.Tags}}:'{{trim tag}}'">{{tag}}</a>\n\t{{/each}}\n\t</div>\n{{/if}}`, useHandlebarsExpr: true, supportHtml: true },
                                                    { name: strings.Layouts.Cards.Fields.PreviewImage, field: 'previewImage',  value: "{{slot item @root.slots.PreviewImageUrl}}", useHandlebarsExpr: true, supportHtml: false },
                                                    { name: strings.Layouts.Cards.Fields.PreviewUrl, field: 'previewUrl' , value: "{{slot item @root.slots.PreviewUrl}}", useHandlebarsExpr: true, supportHtml: false },
                                                    { name: strings.Layouts.Cards.Fields.Date, field: 'date', value: "{{getDate (slot item @root.slots.Date) 'LL'}}", useHandlebarsExpr: true, supportHtml: false },
                                                    { name: strings.Layouts.Cards.Fields.Url, field: 'href', value: '{{slot item @root.slots.PreviewUrl}}', useHandlebarsExpr: true, supportHtml: false },
                                                    { name: strings.Layouts.Cards.Fields.Author, field: 'author', value: "{{slot item @root.slots.Author}}", useHandlebarsExpr: true, supportHtml: false },
                                                    { name: strings.Layouts.Cards.Fields.ProfileImage, field: 'profileImage', value: "/_layouts/15/userphoto.aspx?size=L&username={{getUserEmail (slot item @root.slots.UserEmail)}}", useHandlebarsExpr: true, supportHtml: false  },
                                                    { name: strings.Layouts.Cards.Fields.FileExtension, field: 'fileExtension', value: "{{slot item @root.slots.FileType}}", useHandlebarsExpr: true, supportHtml: false },
                                                    { name: strings.Layouts.Cards.Fields.IsContainer, field: 'isContainer', value: "{{slot item @root.slots.IsFolder}}", useHandlebarsExpr: true, supportHtml: false }
                                                ] as IComponentFieldsConfiguration[];
            
        this.properties.isCompact = this.properties.isCompact !== null && this.properties.isCompact !== undefined ?  this.properties.isCompact: false;
        this.properties.showFileIcon = this.properties.showFileIcon !== null && this.properties.showFileIcon !== undefined ?  this.properties.showFileIcon: true;
        this.properties.enablePreview = this.properties.enablePreview !== null && this.properties.enablePreview !== undefined ?  this.properties.enablePreview: false; // Watch out performance issues if too many items displayed
        this.properties.preferedCardNumberPerRow = this.properties.preferedCardNumberPerRow ? this.properties.preferedCardNumberPerRow : 3;
        this.properties.columnSizePercentage = this.properties.columnSizePercentage ? this.properties.columnSizePercentage : 33;

        const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
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
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        const availableOptions: IComboBoxOption[] = availableFields.map((fieldName) => { return  { key: fieldName, text: fieldName } as IComboBoxOption; });

        return [
            
            // Careful, the property names should match the React components props. These will be injected in the Handlebars template context and passed as web component attributes
            this._propertyFieldCollectionData('layoutProperties.documentCardFields', {
                manageBtnLabel: strings.Layouts.Cards.ManageTilesFieldsLabel,
                key: 'layoutProperties.documentCardFields',
                panelHeader: strings.Layouts.Cards.ManageTilesFieldsLabel,
                panelDescription: strings.Layouts.Cards.ManageTilesFieldsPanelDescriptionLabel,
                enableSorting: false,
                disableItemCreation: true,
                disableItemDeletion: true,
                label: strings.Layouts.Cards.ManageTilesFieldsLabel,
                value: this.properties.documentCardFields,
                fields: [
                    {
                        id: 'name',
                        type: this._customCollectionFieldType.string,
                        disableEdit: true,
                        title: strings.Layouts.Cards.PlaceholderNameFieldLabel
                    },
                    {
                        id: 'supportHtml',
                        type: this._customCollectionFieldType.custom,
                        disableEdit: true,
                        title: strings.Layouts.Cards.SupportHTMLColumnLabel,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                            if (item.supportHtml) {
                                return React.createElement(Icon, { iconName: 'CheckMark' } as IIconProps);
                            }
                        }
                    },
                    {
                        id: 'value',
                        title: strings.Layouts.Cards.PlaceholderValueFieldLabel,
                        type: this._customCollectionFieldType.custom,
                        required: true,
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
                        title: strings.Layouts.Cards.UseHandlebarsExpressionLabel
                    }
                ]
            }),
            PropertyPaneButton('layoutProperties.resetFields', {
                buttonType: PropertyPaneButtonType.Command,
                icon: 'Refresh',
                text: strings.Layouts.Cards.ResetFieldsBtnLabel,
                onClick: ()=> {
                    // Just reset the fields
                    this.properties.documentCardFields = null;
                    this.onInit();
                }
            }),
            this._propertyFieldToogleWithCallout('layoutProperties.enablePreview', {
                label: strings.Layouts.Cards.EnableItemPreview,
                calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
                key: 'layoutProperties.enablePreview',
                calloutContent: React.createElement('p', { style:{ maxWidth: 250, wordBreak: 'break-word' }}, strings.Layouts.Cards.EnableItemPreviewHoverMessage),
                onText: strings.General.OnTextLabel,
                offText: strings.General.OffTextLabel,
                checked: this.properties.enablePreview
            }),
            PropertyPaneToggle('layoutProperties.showFileIcon', {
                label: strings.Layouts.Cards.ShowFileIcon,                        
                checked: this.properties.showFileIcon
            }),
            PropertyPaneToggle('layoutProperties.isCompact', {
                label: strings.Layouts.Cards.CompactModeLabel,               
                checked: this.properties.isCompact
            }),
            PropertyPaneSlider('layoutProperties.preferedCardNumberPerRow', {
                label: strings.Layouts.Cards.PreferedCardNumberPerRow,
                min: 1,
                max: 6,
                step: 1,
                showValue: true,
                value: this.properties.preferedCardNumberPerRow,                
            })              
        ];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any) {
        
        if (propertyPath.localeCompare('layoutProperties.preferedCardNumberPerRow') === 0) {
            // Calculate the correct % for card flex-basis
            this.properties.columnSizePercentage = Math.floor(100 /newValue)-1;
        }
    }
}