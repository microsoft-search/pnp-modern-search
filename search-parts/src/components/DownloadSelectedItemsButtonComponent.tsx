import * as React from "react";
import * as ReactDOM from "react-dom";
import { BaseWebComponent } from "@pnp/modern-search-extensibility";
import { ActionButton, IIconProps, ITheme } from "@fluentui/react";
import { ISearchResultsTemplateContext } from "../models/common/ITemplateContext";
import { HttpClient, HttpClientResponse, IHttpClientOptions, ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { Guid, Log } from "@microsoft/sp-core-library";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import * as strings from "CommonStrings";


export interface IExportState {
    exporting: boolean;
}

interface IExportSelectedItemsButtonProps {
    /**
     * The Handlebars context to inject in columns content (ex: @root)
     */
    context?: ISearchResultsTemplateContext;

    /**
     * Current items
     */
    items?: { [key: string]: any }[];

    /**
     * The web part context
     */
    webPartContext?: any;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Columns configuration from the layout (optional)
     */
    columnsConfiguration?: Array<{name: string, value: string}>;
}

export class DownloadSelectedItemsButtonComponent extends React.Component<IExportSelectedItemsButtonProps, IExportState> {

    private _selectedItems = [];

    constructor(props: IExportSelectedItemsButtonProps) {
      super(props);
      this.state = {
          exporting: false
      };

      this._encodeFormData = this._encodeFormData.bind(this);
      this._downloadSelectedItems = this._downloadSelectedItems.bind(this);
      this._downloadSelectedItemsDocumentsOrFolder = this._downloadSelectedItemsDocumentsOrFolder.bind(this);
      this._downloadSelectedItemsListItems = this._downloadSelectedItemsListItems.bind(this);
    }

    public render() {
        const { ...buttonProps } = this.props;
        const downloadIcon: IIconProps = { iconName: "Download" };

        const currentSiteHost = new URL(this.props.context.context.web.absoluteUrl).hostname;

        const onlyDocumentsOrFoldersInCurrentHostSelected = this._selectedItems.every(item => item["SPWebUrl"] && new URL(item["SPWebUrl"]).hostname === currentSiteHost && item["ContentTypeId"] && (item["ContentTypeId"].startsWith("0x0101") || item["ContentTypeId"].startsWith("0x0120")));

        // True only if every selected item is a list item (not a document or folder) from the current host/tenant
        const onlyListItemsInCurrentHostSelected = this._selectedItems.every(item => {
          const ctid: string = item["ContentTypeId"] || "";
          const isOnCurrentHost = item["SPWebUrl"] && new URL(item["SPWebUrl"]).hostname === currentSiteHost;
          const isListItem = ctid.startsWith("0x01") && !ctid.startsWith("0x0101") && !ctid.startsWith("0x0120");
          return isOnCurrentHost && isListItem;
        });

        const requiredPropertiesAvailable = this._selectedItems.every(item => item["SPWebUrl"] && item["ContentTypeId"] && item["NormListID"] && item["NormUniqueID"]);

        // Don't render any button if no items are selected
        if (!this._selectedItems || this._selectedItems.length === 0) {
          return null;
        }

        if (onlyListItemsInCurrentHostSelected) {
          return (
            <ActionButton
              {...buttonProps}
              text={strings.Controls.DownloadCSVButtonText}
              iconProps={{ iconName: "Download" }}
              disabled={
                this.state.exporting ||
                !requiredPropertiesAvailable
              }
              onClick={this._downloadSelectedItems}
              theme={this.props.themeVariant as ITheme}
            />
          );
        }

        // Default: documents/folders 
        if (onlyDocumentsOrFoldersInCurrentHostSelected) {
          return (
            <ActionButton
              {...buttonProps}
              text={strings.Controls.DownloadButtonText}
              iconProps={downloadIcon}
              disabled={
                this.state.exporting ||
                !requiredPropertiesAvailable
              }
              onClick={this._downloadSelectedItems}
              theme={this.props.themeVariant as ITheme}
            />
          );
        }

        // Mixed or unsupported selection - don't show button
        return null;
    }

    public componentDidMount() {

      if (this.props.context && this.props.context.selectedKeys && this.props.context.selectedKeys.length > 0) {

        this._selectedItems = this.props.context.selectedKeys.filter(key => key.startsWith(this.props.context.paging.currentPageNumber.toString())).map(key => {
          return this.props.items[key.replace(this.props.context.paging.currentPageNumber.toString(), "")];
        });

        this.forceUpdate();
      }
    }

    private _downloadSelectedItems() {

      this.setState({
        exporting: true
      });

      // Determine selection types
      const hasOnlyDocumentsOrFolders = this._selectedItems.every(item => {
        const ctid: string = item["ContentTypeId"] || "";
        return ctid.startsWith("0x0101") || ctid.startsWith("0x0120");
      });

      const hasOnlyListItems = this._selectedItems.every(item => {
        const ctid: string = item["ContentTypeId"] || "";
        return ctid.startsWith("0x01") && !ctid.startsWith("0x0101") && !ctid.startsWith("0x0120");
      });

      if (hasOnlyDocumentsOrFolders) {
        this._downloadSelectedItemsDocumentsOrFolder();
        return;
      }

      if (hasOnlyListItems) {
        this._downloadSelectedItemsListItems();
        return;
      }

      const message = "The current selection contains unsupported or mixed item types.";
      Log.error("DownloadSelectedItemsButtonComponent", new Error(message));
      try { window.alert(message); } catch {}
      this.setState({ exporting: false });
    }

    private _downloadSelectedItemsDocumentsOrFolder() {
      // Safety check: ensure only documents/folders
      const hasOnlyDocumentsOrFolders = this._selectedItems.every(item => {
        const ctid: string = item["ContentTypeId"] || "";
        return ctid.startsWith("0x0101") || ctid.startsWith("0x0120");
      });

      if (!hasOnlyDocumentsOrFolders) {
        const message = "Only documents or folders can be downloaded.";
        Log.error("DownloadSelectedItemsButtonComponent", new Error(message));
        try { window.alert(message); } catch {}
        this.setState({ exporting: false });
        return;
      }

      if (this._selectedItems.length === 1 && (this._selectedItems[0]["ContentTypeId"] || "").startsWith("0x0101")) {
        window.document.location.href = `${this._selectedItems[0]["SPWebUrl"]}/_layouts/15/download.aspx?UniqueId=${this._selectedItems[0]["NormUniqueID"]}`;
        return;
      }

      const fileInfoResponses = this._selectedItems.map(item => {
        const spOptions1: ISPHttpClientOptions = {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "parameters":{
              "RenderOptions":4103,
              "ViewXml": `<View Scope="RecursiveAll"><Query><Where><Eq><FieldRef Name="UniqueId" /><Value Type="Guid">${item["NormUniqueID"]}</Value></Eq></Where></Query></View>`
            }
          })
        };

        return this.props.webPartContext.spHttpClient.post(`${item["SPWebUrl"]}/_api/web/lists/GetById('${item["NormListID"]}')/RenderListDataAsStream`, SPHttpClient.configurations.v1, spOptions1)
          .then((response: SPHttpClientResponse) => {
            return response.json()
          });
      });
      Promise.all(fileInfoResponses).then((responses: SPHttpClientResponse[]) => {
        const files = responses.map(response => {
          return {name: response["ListData"]["Row"][0]["FileLeafRef"], size: parseInt((response["ListData"]["Row"][0]["File_x0020_Size"] || "").trim(), 10), docId: `${response["ListData"]["Row"][0][".spItemUrl"]}&${response["ListSchema"][".driveAccessToken"]}`, isFolder: response["ListData"]["Row"][0]["FSObjType"] === "1" ? true : false};
        });
        const spOptions1: ISPHttpClientOptions = {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "resource":`${responses[0]["ListSchema"][".mediaBaseUrl"]}`
          })
        };

        const filename = `OneDrive_1_${new Date().toLocaleDateString().replace("/", "-")}.zip`;

        this.props.webPartContext.spHttpClient.post(`${this.props.context.context.web.absoluteUrl}/_api/SP.OAuth.Token/Acquire()`, SPHttpClient.configurations.v1, spOptions1)
          .then((response: SPHttpClientResponse) => {
            return response.json()
          }).then((response: any) => {
            const token = response["access_token"];
            const downloadParameters = {
              files: `${JSON.stringify({items: files})}`,
              guid: Guid.newGuid(),
              oAuthToken: token,
              provider: "spo",
              zipFileName: filename
            };
            const downloadOptions: IHttpClientOptions = {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: this._encodeFormData(downloadParameters)
            };

            this.props.webPartContext.httpClient.post(`${responses[0]["ListSchema"][".mediaBaseUrl"]}/transform/zip?cs=${responses[0]["ListSchema"][".callerStack"]}`, HttpClient.configurations.v1, downloadOptions)
              .then((response: HttpClientResponse) => {
                if (response.ok) {
                  return response.blob();
                }
                else {
                  throw new Error(response.statusText);
                  }
              })
              .then((blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
          
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = filename;
                anchor.click();
          
                window.URL.revokeObjectURL(url);
              })
              .catch((error: any) => {
                Log.error("DownloadSelectedItemsButtonComponent", new Error(`Error when downloading files. Details ${error}`));
              });
          });
      });
    }

    private _downloadSelectedItemsListItems() {
      try {
        // Determine which columns to export
        let columnHeaders: string[];
        let columnNames: { [key: string]: string } = {};

        if (this.props.columnsConfiguration && this.props.columnsConfiguration.length > 0) {
          // Use configured columns from the layout
          columnHeaders = this.props.columnsConfiguration
            .map(col => col.value)
            .filter(value => value && value.trim() !== "");

          // Resolve slot references to internal field names
          columnHeaders = columnHeaders.map(v => this._resolveInternalFieldName(v));
          
          // Create a mapping of field value to display name
          this.props.columnsConfiguration.forEach(col => {
            if (col.value && col.value.trim() !== "") {
              columnNames[col.value] = col.name || col.value;
            }
          });
        } else {
          // Fallback: Get all property keys from all selected items
          const allKeys = new Set<string>();
          this._selectedItems.forEach(item => {
            Object.keys(item).forEach(key => allKeys.add(key));
          });
          columnHeaders = Array.from(allKeys).sort();
          // Use field names as display names
          columnHeaders.forEach(key => {
            columnNames[key] = key;
          });
        }

        // Build CSV content
        const rows: string[] = [];

  // Add header row with internal field names
  rows.push(columnHeaders.join(";"));

        // Add data rows
        // CSV field formatter: wrap all values in double quotes and escape embedded quotes
        const toCsvField = (val: any): string => {
          if (val === null || val === undefined) {
            return "";
          }
          let text = (typeof val === "object") ? JSON.stringify(val) : String(val);
          // Escape embedded quotes by doubling them per CSV rules
          text = text.replace(/"/g, '""');
          // Wrap in quotes so delimiters and newlines are preserved
          return `"${text}"`;
        };

        this._selectedItems.forEach(item => {
          const rowValues = columnHeaders.map(header => toCsvField(item[header]));
          rows.push(rowValues.join(";"));
        });

        // Join all rows with newlines
        const csvContent = rows.join("\n");

        // Add UTF-8 BOM (Byte Order Mark) for proper encoding in Excel and other applications
        const BOM = "\uFEFF";
        const csvContentWithBOM = BOM + csvContent;

        // Create blob and download with UTF-8 encoding
        const blob = new Blob([csvContentWithBOM], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        
        const filename = `ListItems_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        
        window.URL.revokeObjectURL(url);
        
        this.setState({ exporting: false });
      } catch (error) {
        const message = `Error when downloading list items as CSV. Details: ${error}`;
        Log.error("DownloadSelectedItemsButtonComponent", new Error(message));
        try { window.alert(message); } catch {}
        this.setState({ exporting: false });
      }
    }

    /**
     * Resolve a value that may contain a slot reference to the actual internal field name using the context slots map.
     * Examples of supported inputs:
     *  - "{{slot item @root.slots.Title}}"
     *  - "slot item @root.slots.Path"
     *  - "@root.slots.FileType"
     */
    private _resolveInternalFieldName(value: string): string {
      if (!value) return value;

      // Try to extract the slot key, e.g., Title from patterns containing @root.slots.Title
      const match = value.match(/@root\.slots\.([A-Za-z0-9_]+)/);
      if (match && match[1] && this.props.context && this.props.context.slots) {
        const slotKey = match[1];
        const mapped = this.props.context.slots[slotKey];
        if (mapped && typeof mapped === "string") {
          return mapped;
        }
      }

      return value;
    }

    private _encodeFormData(data) {
      return Object.keys(data)
          .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
          .join("&");
    }
}

export class DownloadSelectedItemsButtonWebComponent extends BaseWebComponent {
    public constructor() {
      super();
    }

    public connectedCallback() {
      let props = this.resolveAttributes();

      props.webPartContext = {}
      props.webPartContext.spHttpClient = this._serviceScope.consume(SPHttpClient.serviceKey);
      props.webPartContext.httpClient = this._serviceScope.consume(HttpClient.serviceKey);  

      const exportButtonComponent = <DownloadSelectedItemsButtonComponent {...props} />;
      ReactDOM.render(exportButtonComponent, this);
    }

    protected onDispose(): void {
      ReactDOM.unmountComponentAtNode(this);
    }
}