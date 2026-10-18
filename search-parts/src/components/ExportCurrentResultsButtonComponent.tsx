import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ActionButton, getTheme, IIconProps, ITheme, MessageBar, MessageBarType } from '@fluentui/react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { EXPORT_CURRENT_DATA_REQUEST_EVENT, formatCsvField, IExportCurrentDataRequest } from '../helpers/CsvExportHelper';
import * as strings from 'CommonStrings';

interface IExportCurrentResultsButtonProps {
    items?: Record<string, unknown>[];
    exportColumns?: string | Record<string, string>;
    themeVariant?: IReadonlyTheme;
}

interface IExportColumn {
    managedProperty: string;
    csvHeader: string;
}

interface IExportCurrentResultsButtonState {
    isExporting: boolean;
    errorMessage: string;
}

export class ExportCurrentResultsButtonComponent extends React.Component<IExportCurrentResultsButtonProps, IExportCurrentResultsButtonState> {

    private _rootRef = React.createRef<HTMLDivElement>();
    private _isDisposed = false;

    public constructor(props: IExportCurrentResultsButtonProps) {
        super(props);
        this.state = { isExporting: false, errorMessage: '' };
    }

    public componentWillUnmount(): void {
        this._isDisposed = true;
    }

    private _getExportColumns(): IExportColumn[] {
        let mapping: Record<string, string>;
        try {
            mapping = typeof this.props.exportColumns === 'string'
                ? JSON.parse(this.props.exportColumns)
                : this.props.exportColumns;
        } catch {
            return [];
        }

        if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
            return [];
        }

        return Object.entries(mapping)
            .filter(([managedProperty, csvHeader]) => managedProperty.trim().length > 0 && typeof csvHeader === 'string')
            .map(([managedProperty, csvHeader]) => ({ managedProperty, csvHeader }));
    }

    private _requestCurrentData(): Promise<Record<string, unknown>[]> {
        return new Promise((resolve, reject) => {
            const root = this._rootRef.current;
            if (!root) {
                reject(new Error('Export action is not attached to the Results web part.'));
                return;
            }

            root.dispatchEvent(new CustomEvent<IExportCurrentDataRequest>(EXPORT_CURRENT_DATA_REQUEST_EVENT, {
                bubbles: true,
                detail: { resolve, reject }
            }));
        });
    }

    private _downloadCurrentData = async (): Promise<void> => {
        const columns = this._getExportColumns();
        if (columns.length === 0 || !this.props.items?.length || this.state.isExporting) {
            return;
        }

        this.setState({ isExporting: true, errorMessage: '' });
        let objectUrl: string | undefined;

        try {
            const items = await this._requestCurrentData();
            if (this._isDisposed) {
                return;
            }
            const rows = [
                columns.map(column => formatCsvField(column.csvHeader)).join(';'),
                ...items.map(item => columns
                    .map(column => formatCsvField(item[column.managedProperty]))
                    .join(';'))
            ];
            const blob = new Blob(['\uFEFF', rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `SearchResults_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            try {
                link.click();
            } finally {
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('ExportCurrentResultsButton: failed to retrieve current results', error);
            if (!this._isDisposed) {
                this.setState({ errorMessage: strings.Controls.ExportSearchResultsError });
            }
        } finally {
            if (objectUrl) {
                window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
            }
            if (!this._isDisposed) {
                this.setState({ isExporting: false });
            }
        }
    };

    public render(): React.ReactElement {
        const columns = this._getExportColumns();
        const downloadIcon: IIconProps = { iconName: 'Download' };

        const theme = (this.props.themeVariant as ITheme) || getTheme();

        return (
            <div ref={this._rootRef} style={{ display: 'inline-block' }}>
                <ActionButton
                    text={strings.Controls.DownloadCurrentDataAsCSVButtonText}
                    iconProps={downloadIcon}
                    disabled={this.state.isExporting || !this.props.items?.length || columns.length === 0}
                    onClick={this._downloadCurrentData}
                    theme={theme}
                />
                {this.state.errorMessage && (
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        role="alert"
                        theme={theme}
                        onDismiss={() => this.setState({ errorMessage: '' })}
                        dismissButtonAriaLabel={strings.Controls.ExportSearchResultsDismissError}
                    >
                        {this.state.errorMessage}
                    </MessageBar>
                )}
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