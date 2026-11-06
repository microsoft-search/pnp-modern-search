import * as strings from 'CommonStrings';

export const EXPORT_CURRENT_DATA_REQUEST_EVENT = 'pnpExportCurrentDataRequest';
export const EXPORT_CURRENT_DATA_PAGE_SIZE = 500;
export const EXPORT_CURRENT_DATA_SMALL_PAGE_SIZE = 25;

export interface IExportCurrentDataRequest {
    resolve: (controller: CsvExportController) => void;
}

export interface IExportColumn {
    managedProperty: string;
    csvHeader: string;
}

export interface ICsvExportState {
    isAvailable: boolean;
    isExporting: boolean;
    errorMessage: string;
}

export class CsvExportController {
    private _state: ICsvExportState = { isAvailable: false, isExporting: false, errorMessage: '' };
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

    public setAvailable(isAvailable: boolean): void {
        if (this._state.isAvailable !== isAvailable) {
            this._setState({ ...this._state, isAvailable });
        }
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
        if (this._isDisposed || !this._state.isAvailable || this._state.isExporting || columns.length === 0) {
            return;
        }

        this._setState({ ...this._state, isExporting: true, errorMessage: '' });
        let objectUrl: string | undefined;
        try {
            const items = await this._loadItems();
            if (this._isDisposed) {
                return;
            }
            const usedHeaders = new Set(columns.map(column => formatCsvField(column.csvHeader)));
            const exportColumns = columns.flatMap(column => {
                const resolved = [{
                    csvHeader: column.csvHeader,
                    getValue: (item: Record<string, unknown>): unknown => normalizeExportDateValue(item[column.managedProperty])
                }];
                if (items.some(item => getTextOnlyValue(item[column.managedProperty]) !== undefined)) {
                    const baseHeader = strings.Controls.ExportTextOnlyColumn.replace('{0}', () => column.csvHeader);
                    let textHeader = baseHeader;
                    let suffix = 2;
                    while (usedHeaders.has(formatCsvField(textHeader))) {
                        textHeader = `${baseHeader} (${suffix++})`;
                    }
                    usedHeaders.add(formatCsvField(textHeader));
                    resolved.push({
                        csvHeader: textHeader,
                        getValue: (item: Record<string, unknown>): unknown => getTextOnlyValue(item[column.managedProperty])
                    });
                }
                return resolved;
            });
            const rows = [
                exportColumns.map(column => formatCsvField(column.csvHeader)).join(';'),
                ...items.map(item => exportColumns.map(column => formatCsvField(column.getValue(item))).join(';'))
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
                this._setState({ ...this._state, isExporting: true, errorMessage: strings.Controls.ExportSearchResultsError });
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
    isCurrent: () => boolean,
    pageSize: number = EXPORT_CURRENT_DATA_PAGE_SIZE
): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    const pageCount = Math.ceil(totalItemsCount / pageSize);
    const assertCurrent = (): void => {
        if (!isCurrent()) {
            throw new Error('Search context changed during export.');
        }
    };

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        assertCurrent();
        const pageItems = await fetchPage(pageNumber, pageSize);
        assertCurrent();
        items.push(...pageItems);
    }

    assertCurrent();
    return items;
}

export function getExportCurrentDataPageSize(isMicrosoftSearch: boolean, entityTypes: string[] = []): number {
    return isMicrosoftSearch && entityTypes.some(entityType => entityType === 'message' || entityType === 'event')
        ? EXPORT_CURRENT_DATA_SMALL_PAGE_SIZE
        : EXPORT_CURRENT_DATA_PAGE_SIZE;
}

function normalizeExportDateValue(value: unknown): unknown {
    if (typeof value !== 'string') {
        return value;
    }

    const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.0+Z$/.exec(value);
    if (!match) {
        return value;
    }

    const dateTime = match[1];
    const timestamp = Date.parse(`${dateTime}.000Z`);
    // Date.parse can normalize invalid dates, so compare the parsed result with the input.
    return !Number.isNaN(timestamp) && new Date(timestamp).toISOString().slice(0, 19) === dateTime
        ? dateTime
        : value;
}

function getTextOnlyValue(value: unknown): string | undefined {
    return getParsedValues(value, parseSharePointPeopleNames)
        ?? getParsedValues(value, parseSharePointTaxonomyLabels, true);
}

function getParsedValues(
    value: unknown,
    parse: (entry: string) => string[] | undefined,
    deduplicate: boolean = false
): string | undefined {
    const values: unknown[] = Array.isArray(value) ? value : [value];
    const parsedValues: string[] = [];
    let hasRecognizedValue = false;

    for (const entry of values) {
        if (entry === null || entry === undefined || (typeof entry === 'string' && !entry.trim())) {
            continue;
        }
        if (typeof entry !== 'string') {
            return undefined;
        }
        const parts = parse(entry);
        if (!parts) {
            return undefined;
        }
        hasRecognizedValue = true;
        parts.forEach(part => {
            if (part && (!deduplicate || !parsedValues.includes(part))) {
                parsedValues.push(part);
            }
        });
    }

    return hasRecognizedValue ? parsedValues.join('; ') : undefined;
}

const TAXONOMY_GUID = '0?[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}';
const TAXONOMY_LABEL_TOKEN = new RegExp(`^L0\\|#${TAXONOMY_GUID}\\|(.*)$`, 'i');
const TAXONOMY_ID_TOKEN = new RegExp(`^[A-Z][A-Za-z0-9]*\\|#${TAXONOMY_GUID}$`, 'i');

const TAXONOMY_TOKEN_PREFIX = /^[A-Z][A-Za-z0-9]*\|#/i;

// Parses taxid values such as "GP0|#<guid>;L0|#0<guid>|Label;GTSet|#<guid>".
// Managed properties mapped to both the taxid and the plain crawled property also
// contain the plain label text (e.g. "...;GPP|#<guid>;Label"); such repeats are ignored.
function parseSharePointTaxonomyLabels(value: string): string[] | undefined {
    const pieces = value.split(';').map(piece => piece.trim().replace(/^#\s*(?=[A-Z][A-Za-z0-9]*\|#)/i, ''));
    const labels: string[] = [];
    const plainGroups: string[][] = [];
    let labelParts: string[] | undefined;
    let plainParts: string[] = [];

    for (const piece of pieces) {
        if (!piece) {
            continue;
        }
        if (TAXONOMY_TOKEN_PREFIX.test(piece)) {
            if (labelParts) {
                labels.push(labelParts.join('; '));
                labelParts = undefined;
            }
            if (plainParts.length) {
                plainGroups.push(plainParts);
                plainParts = [];
            }

            const labelMatch = TAXONOMY_LABEL_TOKEN.exec(piece);
            if (labelMatch) {
                labelParts = [labelMatch[1].trim()];
            } else if (!TAXONOMY_ID_TOKEN.test(piece)) {
                return undefined;
            }
        } else if (labelParts) {
            labelParts.push(piece);
        } else {
            plainParts.push(piece);
        }
    }

    if (labelParts) {
        labels.push(labelParts.join('; '));
    }
    if (plainParts.length) {
        plainGroups.push(plainParts);
    }
    if (labels.length === 0) {
        return undefined;
    }

    const knownLabels = labels.filter(label => label).map(label => label.toLowerCase().split(';').map(part => part.trim()));
    return plainGroups.every(group => containsOnlyTaxonomyLabels(group, knownLabels)) ? labels : undefined;
}

function containsOnlyTaxonomyLabels(parts: string[], knownLabels: string[][]): boolean {
    const normalized = parts.map(part => part.toLowerCase());
    const reachable = new Set<number>([0]);

    for (let index = 0; index < normalized.length; index++) {
        if (!reachable.has(index)) {
            continue;
        }
        for (const label of knownLabels) {
            if (label.every((part, offset) => part === normalized[index + offset])) {
                reachable.add(index + label.length);
            }
        }
    }

    return reachable.has(normalized.length);
}

function parseSharePointPeopleNames(value: string): string[] | undefined {
    const names: string[] = [];
    let start = 0;

    while (start < value.length) {
        const firstPipe = value.indexOf('|', start);
        const secondPipe = firstPipe === -1 ? -1 : value.indexOf('|', firstPipe + 1);
        const thirdPipe = secondPipe === -1 ? -1 : value.indexOf('|', secondPipe + 1);
        const fourthPipe = thirdPipe === -1 ? -1 : value.indexOf('|', thirdPipe + 1);
        if (fourthPipe === -1) {
            return undefined;
        }

        const identifier = value.slice(start, firstPipe).trim();
        const name = value.slice(firstPipe + 1, secondPipe).trim();
        const claim = value.slice(secondPipe + 1, thirdPipe).trim();
        const provider = value.slice(thirdPipe + 1, fourthPipe).trim();
        const separator = value.indexOf(';', fourthPipe + 1);
        const account = value.slice(fourthPipe + 1, separator === -1 ? value.length : separator).trim();
        if (identifier.includes(';') || claim.includes(';') || provider.includes(';')
            || !/(?:^|\s)[ic]:0[^|]*$/i.test(claim) || !provider || !account || account.includes('|')) {
            return undefined;
        }
        names.push(name);

        if (separator === -1) {
            return names;
        }
        start = separator + 1;
        while (start < value.length && /\s/.test(value.charAt(start))) {
            start++;
        }
        if (value.charAt(start) === '#') {
            start++;
        }
        while (start < value.length && /\s/.test(value.charAt(start))) {
            start++;
        }
        if (start === value.length) {
            return names;
        }
    }

    return undefined;
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