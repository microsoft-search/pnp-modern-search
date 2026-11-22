import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ActionButton, getTheme, IIconProps, ITheme, MessageBar, MessageBarType } from '@fluentui/react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { CsvExportController, EXPORT_CURRENT_DATA_REQUEST_EVENT, ICsvExportState, IExportColumn, IExportCurrentDataRequest } from '../helpers/CsvExportHelper';
import * as strings from 'CommonStrings';

interface IExportCurrentResultsButtonProps {
    items?: Record<string, unknown>[];
    exportColumns?: string | Record<string, string>;
    themeVariant?: IReadonlyTheme;
}

export class ExportCurrentResultsButtonComponent extends React.Component<IExportCurrentResultsButtonProps, ICsvExportState> {

    private _rootRef = React.createRef<HTMLDivElement>();
    private _controller: CsvExportController;
    private _unsubscribe: (() => void) | undefined;

    public constructor(props: IExportCurrentResultsButtonProps) {
        super(props);
        this.state = { isAvailable: false, isExporting: false, errorMessage: '' };
    }

    public componentDidMount(): void {
        this._rootRef.current?.dispatchEvent(new CustomEvent<IExportCurrentDataRequest>(EXPORT_CURRENT_DATA_REQUEST_EVENT, {
            bubbles: true,
            detail: {
                resolve: controller => {
                    this._controller = controller;
                    this._unsubscribe = controller.subscribe(state => this.setState(state));
                }
            }
        }));
    }

    public componentWillUnmount(): void {
        this._unsubscribe?.();
    }

    private _getExportConfiguration(): { columns: IExportColumn[]; warning?: string } {
        const value = this.props.exportColumns;
        if (value === undefined || typeof value === 'string' && !value.trim()) {
            return { columns: [], warning: strings.Controls.ExportSearchResultsMissingColumnsWarning };
        }

        let mapping: unknown;
        try {
            mapping = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
            return { columns: [], warning: strings.Controls.ExportSearchResultsInvalidColumnsWarning };
        }

        if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
            return { columns: [], warning: strings.Controls.ExportSearchResultsInvalidColumnsWarning };
        }

        const entries = Object.entries(mapping);
        const columns = entries.flatMap(([managedProperty, csvHeader]) =>
            managedProperty.trim().length > 0 && typeof csvHeader === 'string'
                ? [{ managedProperty, csvHeader }] : []);
        return {
            columns,
            warning: columns.length > 0 ? undefined
                : entries.length === 0 ? strings.Controls.ExportSearchResultsMissingColumnsWarning
                    : strings.Controls.ExportSearchResultsInvalidColumnsWarning
        };
    }

    private _downloadCurrentData = async (): Promise<void> => {
        const { columns } = this._getExportConfiguration();
        if (columns.length === 0 || !this.props.items?.length || this.state.isExporting) {
            return;
        }

        await this._controller?.export(columns);
    };

    public render(): React.ReactElement {
        const { columns, warning } = this._getExportConfiguration();
        const downloadIcon: IIconProps = { iconName: 'Download' };

        const theme = (this.props.themeVariant as ITheme) || getTheme();

        return (
            <div ref={this._rootRef} style={{ display: 'inline-block', maxWidth: warning ? 320 : undefined, whiteSpace: warning ? 'normal' : undefined }}>
                <ActionButton
                    text={strings.Controls.DownloadCurrentDataAsCSVButtonText}
                    iconProps={downloadIcon}
                    disabled={!this._controller || !this.state.isAvailable || this.state.isExporting || !this.props.items?.length || columns.length === 0}
                    onClick={this._downloadCurrentData}
                    theme={theme}
                />
                {this.state.errorMessage && (
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        role="alert"
                        theme={theme}
                        onDismiss={() => this._controller?.dismissError()}
                        dismissButtonAriaLabel={strings.Controls.ExportSearchResultsDismissError}
                    >
                        {this.state.errorMessage}
                    </MessageBar>
                )}
                {warning && <MessageBar
                    messageBarType={MessageBarType.warning}
                    role="status"
                    theme={theme}
                    styles={{ root: { marginTop: 4 } }}
                >
                    {warning}
                </MessageBar>}
            </div>
        );
    }
}

export class ExportCurrentResultsButtonWebComponent extends BaseWebComponent {

    public connectedCallback(): void {
        const props = this.resolveAttributes();
        ReactDOM.render(<ExportCurrentResultsButtonComponent {...props} />, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}