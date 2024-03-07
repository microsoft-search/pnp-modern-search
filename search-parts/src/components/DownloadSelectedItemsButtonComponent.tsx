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
    }

    public render() {
        const { ...buttonProps } = this.props;
        const downloadIcon: IIconProps = { iconName: "Download" };

        const currentSiteHost = new URL(this.props.context.context.web.absoluteUrl).hostname;

        const onlyDocumentsOrFoldersInCurrentHostSelected = this._selectedItems.every(item => item["SPWebUrl"] && new URL(item["SPWebUrl"]).hostname === currentSiteHost && item["ContentTypeId"] && (item["ContentTypeId"].startsWith("0x0101") || item["ContentTypeId"].startsWith("0x0120")));

        const requiredPropertiesAvailable = this._selectedItems.every(item => item["SPWebUrl"] && item["ContentTypeId"] && item["NormListID"] && item["NormUniqueID"]);

        return <ActionButton {...buttonProps} 
                  text={strings.Controls.DownloadButtonText}
                  iconProps={downloadIcon}
                  disabled={this.state.exporting || !this.props.context.selectedKeys || this.props.context.selectedKeys.length === 0 || !onlyDocumentsOrFoldersInCurrentHostSelected || !requiredPropertiesAvailable}
                  onClick={this._downloadSelectedItems}
                  theme={this.props.themeVariant as ITheme}
                />;
    }

    public componentDidMount() {

      if (this.props.context && this.props.context.selectedKeys && this.props.context.selectedKeys.length > 0) {

        this._selectedItems = this.props.context.selectedKeys.map(key => {
          return this.props.items[key.replace(this.props.context.paging.currentPageNumber.toString(), "")];
        });

        this.forceUpdate();
      }
    }

    private _downloadSelectedItems() {

      this.setState({
        exporting: true
      });
      if (this._selectedItems.length === 1 && this._selectedItems[0]["ContentTypeId"].startsWith("0x0101")) {
        window.document.location.href = `${this._selectedItems[0]["SPWebUrl"]}/_layouts/15/download.aspx?UniqueId=${this._selectedItems[0]["NormUniqueID"]}`;
      }
      else {
        const fileInfoResponses = this._selectedItems.map(item => {
          const spOptions1: ISPHttpClientOptions = {
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "parameters":{"RenderOptions":4103}
            })
          };

          return this.props.webPartContext.spHttpClient.post(`${item["SPWebUrl"]}/_api/web/lists/GetById('${item["NormListID"]}')/RenderListDataAsStream?FilterField1=UniqueId&FilterValue1=${item["NormUniqueID"]}`, SPHttpClient.configurations.v1, spOptions1)
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