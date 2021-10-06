import * as React from "react";
import { ChoiceGroup, DefaultButton, Dialog, DialogFooter, DialogType, ITheme, PrimaryButton, ProgressIndicator, TextField } from 'office-ui-fabric-react';
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
import * as strings from "CommonStrings";

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

enum ExportType {
    CurrentPage,
    All
}

export interface IExportComponentState {
    hideSettingsDialog: boolean
    isExporting: boolean
    fileName: string,
    exportType: ExportType,
    exportProgress: number
}

export class ExportComponent extends React.Component<IExportComponentProps, IExportComponentState> {

    private dataSourceContext: { dataSource: IDataSource, tokenService: ITokenService };
    private readonly maxhits = 10000;
    private readonly pagesize = 500;
    private readonly extension = ".csv";

    constructor(props: IExportComponentProps) {
        super(props);

        this.state = {
            hideSettingsDialog: true,
            isExporting: false,
            fileName: "",
            exportType: ExportType.CurrentPage,
            exportProgress: 1.0,
        };

        this.toggleExportDialog = this.toggleExportDialog.bind(this);
        this.onChangeFilename = this.onChangeFilename.bind(this);
        this.exportTrigger = this.exportTrigger.bind(this);
    }

    public componentDidMount() {
        const { title, dataSourceKey } = this.props.context?.properties;
        this.onChangeFilename(null, (title ?? dataSourceKey ?? "csvExport") + " " + new Date().toLocaleDateString())
    }

    private toggleExportDialog(): void {
        this.setState(p => ({ hideSettingsDialog: !p.hideSettingsDialog }));
    }

    private onChangeFilename = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        const value = newValue && newValue.replace(/[#%&{}\\<>*?/$!'":@+`|=\t_]/g, "").trim();
        this.setState({ fileName: value })
    };

    private async exportTrigger(exportAll?: boolean): Promise<void> {
        const { columnsConfiguration, context, serviceScope, handlebars } = this.props;
        const { dataSourceKey, dataSourceProperties } = context.properties;
        const { instanceId, filterOperator, filtersConfiguration, selectedFilters } = context.filters;
        const { fileName, exportType } = this.state;
        this.setState({ isExporting: true, hideSettingsDialog: true, exportProgress: 0 });
        try {
            let items: any[] = [];
            let errorOccured = false;
            let errorColumnValue = false;
            const totalItems = context.data.totalItemsCount || this.maxhits;
            const progressMax = totalItems < this.maxhits ? totalItems : this.maxhits;
            if (exportAll === true || exportType == ExportType.All) {
                if (!this.dataSourceContext) {

                    const filteredProperties = ExportHelper.getReferencedProperties(columnsConfiguration, context);

                    this.dataSourceContext = await DataSourceHelper.getDataSourceInstance(dataSourceKey, serviceScope,
                        { ...dataSourceProperties, selectedProperties: filteredProperties });
                    this.dataSourceContext.dataSource.editMode = false;
                    await this.dataSourceContext.dataSource.onInit();
                }

                const filtersSourceData: IDataFilterSourceData = { instanceId: instanceId, filterOperator: filterOperator, filterConfiguration: filtersConfiguration, selectedFilters: selectedFilters }
                DataSourceHelper.setTokens(this.dataSourceContext.tokenService, context.inputQueryText, filtersSourceData)

                console.time("fetching");
                try {
                    let currentPageNumber = 0;
                    let fetchMore = true;
                    let itemsFetched = 0;
                    while (items.length < this.maxhits && fetchMore) {
                        const pagesToProcess = [++currentPageNumber, ++currentPageNumber, ++currentPageNumber, ++currentPageNumber];
                        const itemResults = await Promise.all(pagesToProcess.map(async page => {
                            const data = await this.dataSourceContext.dataSource.getData({
                                inputQueryText: context.inputQueryText, itemsCountPerPage: this.pagesize, pageNumber: page, filters: context.filters
                            })
                            itemsFetched += data.items?.length || 0;
                            this.setState({ exportProgress: itemsFetched / (progressMax * 2) });
                            return data.items || [];
                        }));

                        itemResults.forEach(i => {
                            fetchMore = fetchMore && i.length == this.pagesize;
                            if (i.length > 0) { items = items.concat(i); }
                        });
                        this.setState({ exportProgress: items.length / (progressMax * 2) });
                        console.log(`Processed '${pagesToProcess.join(", ")}', items total fetched ${items.length}`);
                    }
                }
                catch (error) {
                    errorOccured = true;
                    console.log(`Error occurred while fetching result for csv export. ${error}`);
                }
                finally {
                    console.timeEnd("fetching")
                }
            }
            else {
                items = context.data.items;
            }

            if (items) {
                console.time("mapvalues");
                const columnWithHandler = columnsConfiguration.map(c => {
                    return {
                        column: c,
                        template: c.useHandlebarsExpr && c.value ? HandlebarsHelper.getHandleBarsTemplate(c.value, handlebars) : null
                    }
                });
                var result = items.map((item, index) => {
                    return columnWithHandler.map(({column, template}) => {
                        const { value, hasError } = HandlebarsHelper.getColumnValueWithHandler(column, item, 
                            () => HandlebarsHelper.getHandleBarsContentValue(item, context, template))
                        errorColumnValue = errorColumnValue || hasError;
                        if(index % 100 == 0) this.setState({ exportProgress: items.length + index / (progressMax * 2) });
                        return value;
                    });
                });
                console.timeEnd("mapvalues")

                
                console.time("exporttocsv");
                const emptyRows = result.filter(r => r.every(c => !c)).length;
                ExportHelper.exportToCsv(fileName + this.extension, result, columnsConfiguration.map(c => c.name));
                console.log(`Processed '${fileName + this.extension}', items total exported ${result.length}, has error column value: ${errorColumnValue}, empty rows: ${emptyRows}`);
                console.timeEnd("exporttocsv")
            }
        }
        finally {
            this.setState({ isExporting: false });
        }
    }

    public render() {
        const { columnsConfiguration, serviceScope, context } = this.props;
        if (!columnsConfiguration || !serviceScope || !context) return null;
        const { isExporting, hideSettingsDialog, fileName, exportType, exportProgress } = this.state;
        const { items, totalItemsCount } = context.data;
        return <>
            <DefaultButton text={strings.Controls.ExportButtonText} split onClick={() => this.exportTrigger()} disabled={isExporting || !totalItemsCount} theme={context.theme as ITheme}
                menuProps={{
                    items: [
                        {
                            key: 'exportAll',
                            text: strings.Controls.ExportAllLabel?.replace("{maxhits}", this.maxhits.toString()),
                            onClick: () => { this.exportTrigger(true) }
                        },
                        {
                            key: 'exportSettings',
                            text: strings.Controls.ExportSettingsText,
                            iconProps: { iconName: 'Settings' },
                            onClick: this.toggleExportDialog
                        }
                    ]
                }} />
            {!hideSettingsDialog && <Dialog
                hidden={hideSettingsDialog}
                onDismiss={this.toggleExportDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: strings.Controls.ExportSettingsText,
                    showCloseButton: false,
                    subText: strings.Controls.ExportDialogHelpText?.replace("{maxhits}", this.maxhits.toString()),
                }}
                modalProps={{ isBlocking: true }}
                theme={context.theme as ITheme}>
                <ChoiceGroup defaultSelectedKey={ExportType[exportType]} options={[
                    { key: ExportType[ExportType.CurrentPage], text: strings.Controls.ExportCurrentPageLabel },
                    { key: ExportType[ExportType.All], text: strings.Controls.ExportAllLabel?.replace("{maxhits}", this.maxhits.toString()), disabled: totalItemsCount <= (items && items.length) }
                ]} onChange={(e, option) => this.setState({ exportType: ExportType[option.key] }, () => console.log(this.state.exportType))} />
                <TextField label={strings.Controls.ExportFilenameLabel} title={fileName + this.extension}
                    ariaLabel={strings.Controls.ExportFilenameAriaLabel} required={true}
                    suffix=".csv" onChange={this.onChangeFilename} value={fileName} />
                <DialogFooter>
                    <PrimaryButton onClick={this.toggleExportDialog} text={strings.Controls.ExportDialogOKButtonText} />
                </DialogFooter>
            </Dialog>}
            {isExporting && <ProgressIndicator percentComplete={exportProgress} />}
        </>
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