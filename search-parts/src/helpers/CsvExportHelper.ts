import * as strings from 'CommonStrings';

export const EXPORT_CURRENT_DATA_REQUEST_EVENT = 'pnpExportCurrentDataRequest';
export const EXPORT_CURRENT_DATA_PAGE_SIZE = 500;

export interface IExportCurrentDataRequest {
    resolve: (items: Record<string, unknown>[]) => void;
    reject: (error: Error) => void;
}

export function validateExportColumnsJson(value: string): string {
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
    } catch {
        return errorMessage;
    }

    return '';
}