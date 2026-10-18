jest.mock('CommonStrings', () => ({
    Layouts: {
        DetailsList: {
            ExportColumnsJsonValidationError: 'Invalid mapping',
            ExportColumnsMissingPropertiesError: 'Missing selected properties: {0}'
        }
    }
}), { virtual: true });

import { validateExportColumnsJson } from './CsvExportHelper';

describe('validateExportColumnsJson', () => {
    it('accepts a subset of selected properties', () => {
        expect(validateExportColumnsJson('{"Title":"Title"}', ['Title', 'Path'])).toBe('');
    });

    it('lists all properties missing from the selected properties', () => {
        expect(validateExportColumnsJson('{"Title":"Title","Author":"Author","Missing":"Other"}', ['Title']))
            .toBe('Missing selected properties: Author, Missing');
    });

    it('reports missing fields when no properties are selected', () => {
        expect(validateExportColumnsJson('{"Title":"Title"}', []))
            .toBe('Missing selected properties: Title');
    });

    it('matches the exact field names used by the exporter', () => {
        expect(validateExportColumnsJson('{"title":"Title"}', ['Title']))
            .toBe('Missing selected properties: title');
    });

    it.each(['{', '[]', '{}', 'null', '{"Title":1}', '{"Title":""}'])(
        'validates JSON syntax and shape before selected properties: %s', value => {
            expect(validateExportColumnsJson(value, [])).toBe('Invalid mapping');
        }
    );
});