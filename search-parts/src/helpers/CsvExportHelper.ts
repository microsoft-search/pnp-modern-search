import * as strings from 'CommonStrings';

export const EXPORT_CURRENT_DATA_REQUEST_EVENT = 'pnpExportCurrentDataRequest';
export const EXPORT_CURRENT_DATA_PAGE_SIZE = 500;

export interface IExportCurrentDataRequest {
    resolve: (items: Record<string, unknown>[]) => void;
    reject: (error: Error) => void;
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