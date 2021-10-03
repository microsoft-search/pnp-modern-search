import * as React from "react";
import { DefaultButton, ITheme } from 'office-ui-fabric-react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent, IDataSource, ITokenService } from '@pnp/modern-search-extensibility';
import { IExportColumnConfiguration } from "../models/common/IExportColumnConfiguration";
import { DataSourceHelper } from "../helpers/DataSourceHelper";
import { TemplateService } from "../services/templateService/TemplateService";
import { ITemplateService } from "../services/templateService/ITemplateService";
import { ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { IDataFilterSourceData } from "../models/dynamicData/IDataFilterSourceData";
import { HandlebarsHelper } from "../helpers/HandlebarsHelper";
import { IDataResultsTemplateContext } from "../models/common/ITemplateContext";
import { ExportHelper } from "../helpers/ExportHelper";
import { accentFill } from "@fluentui/web-components";

export interface IExportComponentProps {
    /**
     * The columns configuration
     */
    columnsConfiguration?: IExportColumnConfiguration[];

    /**
     * The Handlebars context to inject in columns content (ex: @root)
     */
    context?: IDataResultsTemplateContext;

    /**
     * The isolated Handlebars namespace 
     */
    handlebars: typeof Handlebars;

    /**
     * The service scope
     */
    serviceScope: ServiceScope;
}

export interface IExportComponentState {

    /**
     * Currently exporting
     */
    exporting: boolean
}


export class ExportComponent extends React.Component<IExportComponentProps, IExportComponentState> {

    private dataSourceContext: { dataSource: IDataSource, tokenService: ITokenService };

    constructor(props: IExportComponentProps) {
        super(props);

        this.state = {
            exporting: false
        };

        this.exportClicked = this.exportClicked.bind(this);
    }

    public render() {
        const { columnsConfiguration, serviceScope, context } = this.props;
        if (!columnsConfiguration || !serviceScope ||!context) return null;
        return <DefaultButton text="Export" onClick={this.exportClicked} disabled={this.state.exporting} theme={context.theme as ITheme}  />
    }

    private exportClicked(): void {
        const { columnsConfiguration, context, serviceScope, handlebars } = this.props;
        const { dataSourceKey, dataSourceProperties } = context.properties;
        const { instanceId, filterOperator, filtersConfiguration, selectedFilters } = context.filters;
        this.setState({ exporting: true },
            async () => {
                try {
                    if (!this.dataSourceContext) {
                        const regexpItem = new RegExp(/item\.(\w+)/gm);
                        const regexpSlots = new RegExp(/slots\.(\w+)/gm);
                        const filteredProperties = columnsConfiguration.map(column => {
                            const result = []
                            if(!column.useHandlebarsExpr && column.value) result.push(column.value);
                            else if(column.value) {
                                let match: RegExpExecArray;
                                while ((match = regexpItem.exec(column.value)) !== null) {
                                    result.push(match[1]);
                                }
                                while ((match = regexpSlots.exec(column.value)) !== null) {
                                    result.push(context.slots[match[1]]);
                                }
                            }
                            return result;
                        })
                        .reduce((pv, cv) => pv.concat(cv))
                        .filter((value, index, self) => value && self.indexOf(value) === index);

                        this.dataSourceContext = await DataSourceHelper.getDataSourceInstance(dataSourceKey, serviceScope, 
                            { ...dataSourceProperties, selectedProperties: filteredProperties });
                        this.dataSourceContext.dataSource.editMode = false;
                        await this.dataSourceContext.dataSource.onInit();
                    }

                    const filtersSourceData: IDataFilterSourceData =  { instanceId: instanceId, filterOperator: filterOperator, filterConfiguration: filtersConfiguration, selectedFilters: selectedFilters }
                    DataSourceHelper.setTokens(this.dataSourceContext.tokenService, context.inputQueryText, filtersSourceData)

                    const data = await this.dataSourceContext.dataSource.getData({ inputQueryText: context.inputQueryText, itemsCountPerPage: 100, pageNumber: 1, filters: context.filters })

                    if (data && data.items) {
                        var result = data.items.map(item => {
                            return columnsConfiguration.map(column => {
                                const { value, hasError } = HandlebarsHelper.getColumnValue(column, item, context, handlebars);
                                return value;
                            });
                        });

                        ExportHelper.exportToCsv("test.csv", result, columnsConfiguration.map(c => c.name));
                    }
                }
                finally {
                    this.setState({ exporting: false });
                }
            });
    }
}

export class ExportWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {
        let props = this.resolveAttributes();

        if (!props.columnsConfiguration || !props.dataSourceKey || !props.dataSourceProperties || !props.context) return;

        let serviceScope: ServiceScope = this._serviceScope; // Default is the root shared service scope regardless the current Web Part 
        let templateServiceKey: ServiceKey<any> = TemplateService.ServiceKey; // Defaut service key for TemplateService

        if (props.context && props.context.instanceId) {

            const instanceId = props.instanceId;
            // Get the service scope and keys associated to the current Web Part displaying the component
            serviceScope = this._webPartServiceScopes.get(instanceId) ? this._webPartServiceScopes.get(instanceId) : serviceScope;
            templateServiceKey = this._webPartServiceKeys.get(instanceId) ? this._webPartServiceKeys.get(instanceId).TemplateService : templateServiceKey;
        }

        const templateService = serviceScope.consume<ITemplateService>(templateServiceKey);

        const parsedProps =
        {
            dataSourceKey: props.dataSourceKey,
            columnsConfiguration: props.columnsConfiguration ? props.columnsConfiguration as IExportColumnConfiguration[] : []
        }

        const exportComponent = <ExportComponent {...props} {...parsedProps} handlebars={templateService.Handlebars} serviceScope={serviceScope} />;
        ReactDOM.render(exportComponent, this);
    }
}