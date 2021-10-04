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
    private readonly maxhits = 5000;
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
        this.setState({ fileName: value})
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
            if(exportAll === true || exportType == ExportType.All) {
                if (!this.dataSourceContext) {
                    
                    const filteredProperties = ExportHelper.getReferencedProperties(columnsConfiguration, context);

                    this.dataSourceContext = await DataSourceHelper.getDataSourceInstance(dataSourceKey, serviceScope,
                        { ...dataSourceProperties, selectedProperties: filteredProperties });
                    this.dataSourceContext.dataSource.editMode = false;
                    await this.dataSourceContext.dataSource.onInit();
                }

                const filtersSourceData: IDataFilterSourceData = { instanceId: instanceId, filterOperator: filterOperator, filterConfiguration: filtersConfiguration, selectedFilters: selectedFilters }
                DataSourceHelper.setTokens(this.dataSourceContext.tokenService, context.inputQueryText, filtersSourceData)

                try {
                    let currentPageNumber = 0;
                    let lastItems: any[] = [1];
                    const totalItems = context.data.totalItemsCount || this.maxhits;
                    const progressMax = totalItems < this.maxhits ? totalItems : this.maxhits;
                    while(items.length < this.maxhits && lastItems) {
                        const data = await this.dataSourceContext.dataSource.getData({ 
                            inputQueryText: context.inputQueryText, itemsCountPerPage: 500, pageNumber: ++currentPageNumber, filters: context.filters })
                        lastItems = data.items;
                        if(lastItems) {
                            items = items.concat(lastItems);
                            this.setState({ exportProgress: items.length / progressMax });
                            console.log(`Processed page ${currentPageNumber} with a total of ${items.length} fetched`);
                        }
                    }
                }
                catch {
                    errorOccured = true;
                }
            }
            else {
                items = context.data.items;
            }

            if (items) {
                var result = items.map(item => {
                    return columnsConfiguration.map(column => {
                        const { value, hasError } = HandlebarsHelper.getColumnValue(column, item, context, handlebars);
                        errorColumnValue = errorColumnValue || hasError;
                        return value;
                    });
                });

                ExportHelper.exportToCsv(fileName + this.extension, result, columnsConfiguration.map(c => c.name));
            }
        }
        finally {
            this.setState({ isExporting: false  });
        }
    }

    public render() {
        const { columnsConfiguration, serviceScope, context } = this.props;
        if (!columnsConfiguration || !serviceScope || !context) return null;
        const { isExporting, hideSettingsDialog, fileName, exportType, exportProgress } = this.state;
        const { items, totalItemsCount } = context.data;
        return <>
            <DefaultButton text={strings.Controls.ExportButtonText} split onClick={() => this.exportTrigger()} disabled={isExporting || !totalItemsCount} theme={context.theme as ITheme}
                menuProps={{ items: [ 
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
                  ]}} />
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