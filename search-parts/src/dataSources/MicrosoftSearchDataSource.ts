import { BaseDataSource, IDataSourceData, ITemplateSlot, BuiltinTemplateSlots, IDataContext, ITokenService, FilterBehavior, PagingBehavior } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup, PropertyPaneLabel } from "@microsoft/sp-property-pane";
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import { MSGraphClientFactory } from "@microsoft/sp-http";
import { TokenService } from "../services/tokenService/TokenService";
import { ServiceScope } from '@microsoft/sp-core-library';
import { IComboBoxOption } from 'office-ui-fabric-react';
import { PropertyPaneAsyncCombo } from "../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo";
import * as commonStrings from 'CommonStrings';

const MICROSOFT_SEARCH_URL = "https://graph.microsoft.com/beta/search/query";

export interface IMicrosoftSearchDataSourceProperties {
    entityTypes: string[];
}

export class MicrosoftSearchDataSource extends BaseDataSource<IMicrosoftSearchDataSourceProperties> {

    private _tokenService: ITokenService;
    private _propertyPaneWebPartInformation: any = null;


    private _availableEntityTypeOptions: IComboBoxOption[] = [
        {
            key: "microsoft.graph.message",
            text: "Messages"
        },
        {
            key: "microsoft.graph.event",
            text: "Events"
        },
        {
            key: "microsoft.graph.driveItem",
            text: "Drive Items"
        },
        {
            key: "microsoft.graph.externalItem",
            text: "External Items"
        },
        {
            key: "microsoft.graph.listItem",
            text: "List Items"
        }
    ];

    /**
     * The data source items count
     */
    private _itemsCount: number = 0;

    public constructor(serviceScope: ServiceScope) {
        super(serviceScope);

        serviceScope.whenFinished(() => {
            this._tokenService = serviceScope.consume<ITokenService>(TokenService.ServiceKey);
        });
    }

    public async onInit(): Promise<void> {

        const { PropertyPaneWebPartInformation } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyPaneWebPartInformation'
        );

        this._propertyPaneWebPartInformation = PropertyPaneWebPartInformation;

        this.initProperties();
    }

    public getItemCount(): number {
        return this._itemsCount;
    }

    public getFilterBehavior(): FilterBehavior {
        return FilterBehavior.Static;
    }

    public getPagingBehavior(): PagingBehavior {
        return PagingBehavior.Dynamic;
    }

    public async getData(dataContext: IDataContext): Promise<IDataSourceData> {

        let results: IDataSourceData = {
            items: []
        };

        if (dataContext.inputQueryText) {

            const queryText = await this._tokenService.resolveTokens(dataContext.inputQueryText);
            let startRow = 0;

            if (dataContext.pageNumber > 1) {
                startRow = (dataContext.pageNumber-1) * dataContext.itemsCountPerPage;
            }

            results = await this.search(queryText, this.properties.entityTypes, startRow, dataContext.itemsCountPerPage);
        }
       
        return results;
    }

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        return  [
            {
              groupName: commonStrings.DataSources.MicrosoftSearch.SourceConfigurationGroupName,
              groupFields: [
                    PropertyPaneLabel('', {
                        text: commonStrings.DataSources.SharePointSearch.QueryTextFieldLabel
                    }),
                    this._propertyPaneWebPartInformation({
                        description: `<em>${commonStrings.DataSources.MicrosoftSearch.QueryTextFieldInfoMessage}</em>`,
                        key: 'queryText'
                    }),
                    new PropertyPaneAsyncCombo('dataSourceProperties.entityTypes', {
                        availableOptions: this._availableEntityTypeOptions,
                        allowMultiSelect: true,
                        allowFreeform: false,
                        description: "",
                        label: commonStrings.DataSources.MicrosoftSearch.EntityTypesField,
                        placeholder: "",
                        searchAsYouType: false,
                        defaultSelectedKeys: this.properties.entityTypes,
                        onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                    })
              ]
            }
        ];
    }

    public onCustomPropertyUpdate(propertyPath: string, newValue: any): void {
    
        if (propertyPath.localeCompare('dataSourceProperties.entityTypes') === 0) {
            this.properties.entityTypes = (cloneDeep(newValue) as IComboBoxOption[]).map(v => {return v.key as string;});
            this.context.propertyPane.refresh();
            this.render();
        }
    }

    public getTemplateSlots(): ITemplateSlot[] {
        return [
            {
                slotName: BuiltinTemplateSlots.Title,
                slotField: '_source.name'
            },
            {
                slotName: BuiltinTemplateSlots.Path,
                slotField: '_source.webUrl'
            },
            {
                slotName: BuiltinTemplateSlots.Summary,
                slotField: '_source.description'
            },
            {
                slotName: BuiltinTemplateSlots.FileType,
                slotField: '_source.webUrl'
            },
            {
                slotName: BuiltinTemplateSlots.PreviewImageUrl,
                slotField: 'AutoPreviewImageUrl' // Field added automatically
            },
            {
                slotName: BuiltinTemplateSlots.PreviewUrl,
                slotField: 'AutoPreviewUrl' // Field added automatically
            }
        ];
    }

    private initProperties(): void {
        this.properties.entityTypes = this.properties.entityTypes !== undefined ? this.properties.entityTypes : ["microsoft.graph.driveItem"];
    }

    /**
     * Retrieves data from Microsoft Graph API
     * @param url the graph REST URL
     */
    private async search(queryText: string, entityTypes: string[], from?: number, size?: number): Promise<IDataSourceData> {

        let itemsCount = 0;
        let response: IDataSourceData = {
            items: []
        };

        // Get an instance to the MSGraphClient
        const msGraphClientFactory = this.serviceScope.consume<MSGraphClientFactory>(MSGraphClientFactory.serviceKey);
        const msGraphClient = await msGraphClientFactory.getClient();
        const request = await msGraphClient.api(MICROSOFT_SEARCH_URL);     
            
        const graphBody = {
            "requests": [
                {
                    "entityTypes": entityTypes,
                    "query": {
                        "query_string": {
                            "query": queryText
                        }
                    },
                    "from": from,
                    "size": size
                }
            ]
        };

        const jsonResponse = await request.post(graphBody);

        if (jsonResponse.value && Array.isArray(jsonResponse.value)) {

            jsonResponse.value.forEach(value => {
                value.hitsContainers.forEach(hitContainer => {
                    itemsCount += hitContainer.total;
                    response.items = response.items.concat(hitContainer.hits);
                });
            });
        }

        this._itemsCount = itemsCount;

        return response;
    }
}