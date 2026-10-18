import * as strings from 'CommonStrings';

export const EXPORT_CURRENT_DATA_REQUEST_EVENT = 'pnpExportCurrentDataRequest';
export const EXPORT_CURRENT_DATA_PAGE_SIZE = 500;

export interface IExportCurrentDataRequest {
    resolve: (controller: CsvExportController) => void;
}

export interface IExportColumn {
    managedProperty: string;
    csvHeader: string;
}

export interface ICsvExportState {
    isExporting: boolean;
    errorMessage: string;
}

export class CsvExportController {
    private _state: ICsvExportState = { isExporting: false, errorMessage: '' };
    private _listeners = new Set<(state: ICsvExportState) => void>();
    private _isDisposed = false;

    public constructor(private readonly _loadItems: () => Promise<Record<string, unknown>[]>) {}

    public subscribe(listener: (state: ICsvExportState) => void): () => void {
        this._listeners.add(listener);
        listener(this._state);
        return () => { this._listeners.delete(listener); };
    }

    public dismissError(): void {
        this._setState({ ...this._state, errorMessage: '' });
    }

    public dispose(): void {
        this._isDisposed = true;
        this._listeners.clear();
    }

    private _setState(state: ICsvExportState): void {
        this._state = state;
        this._listeners.forEach(listener => listener(state));
    }

    public async export(columns: IExportColumn[]): Promise<void> {
        if (this._isDisposed || this._state.isExporting || columns.length === 0) {
            return;
        }

        this._setState({ isExporting: true, errorMessage: '' });
        let objectUrl: string | undefined;
        try {
            const items = await this._loadItems();
            if (this._isDisposed) {
                return;
            }
            const rows = [
                columns.map(column => formatCsvField(column.csvHeader)).join(';'),
                ...items.map(item => columns.map(column => formatCsvField(item[column.managedProperty])).join(';'))
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
                this._setState({ isExporting: true, errorMessage: strings.Controls.ExportSearchResultsError });
            }
        } finally {
            if (objectUrl) {
                window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
            }
            if (!this._isDisposed) {
                this._setState({ ...this._state, isExporting: false });
            }
        }
    }
}

export async function collectExportItems(
    totalItemsCount: number,
    fetchPage: (pageNumber: number, pageSize: number) => Promise<Record<string, unknown>[]>,
    isCurrent: () => boolean
): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    const pageCount = Math.ceil(totalItemsCount / EXPORT_CURRENT_DATA_PAGE_SIZE);
    const assertCurrent = (): void => {
        if (!isCurrent()) {
            throw new Error('Search context changed during export.');
        }
    };

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        assertCurrent();
        const pageItems = await fetchPage(pageNumber, EXPORT_CURRENT_DATA_PAGE_SIZE);
        assertCurrent();
        items.push(...pageItems);
    }

    assertCurrent();
    return items;
}

export function formatCsvField(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (typeof value === 'string') {
        let firstContentIndex = 0;
        while (firstContentIndex < text.length) {
            const codePoint = text.charCodeAt(firstContentIndex);
            if (codePoint > 0x1f && (codePoint < 0x7f || codePoint > 0x9f)
                && !/\s/.test(text.charAt(firstContentIndex))) {
                break;
            }
            firstContentIndex++;
        }
        if (['=', '+', '-', '@'].includes(text.charAt(firstContentIndex))) {
            text = `'${text}`;
        }
    }

    return `"${text.replace(/"/g, '""')}"`;
}

export function validateExportColumnsJson(value: string, selectedProperties?: string[]): string {
    const errorMessage = strings.Layouts.DetailsList.ExportColumnsJsonValidationError;

    try {
        const mapping: unknown = JSON.parse(value);
        if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
            return errorMessage;
        }

        const entries = Object.entries(mapping as Record<string, unknown>);
        if (entries.length === 0 || entries.some(([managedProperty, csvHeader]) =>
            !managedProperty.trim() || typeof csvHeader !== 'string' || !csvHeader.trim())) {
            return errorMessage;
        }

        if (selectedProperties !== undefined) {
            const selectedFields = new Set(selectedProperties);
            const missingFields = entries.map(([managedProperty]) => managedProperty)
                .filter(managedProperty => !selectedFields.has(managedProperty));
            if (missingFields.length > 0) {
                return strings.Layouts.DetailsList.ExportColumnsMissingPropertiesError.replace('{0}', missingFields.join(', '));
            }
        }
    } catch {
        return errorMessage;
    }

    return '';
}