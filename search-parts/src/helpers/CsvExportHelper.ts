import * as strings from 'CommonStrings';

export const EXPORT_CURRENT_DATA_REQUEST_EVENT = 'pnpExportCurrentDataRequest';
export const EXPORT_CURRENT_DATA_PAGE_SIZE = 500;

export interface IExportCurrentDataRequest {
    resolve: (items: Record<string, unknown>[]) => void;
    reject: (error: Error) => void;
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