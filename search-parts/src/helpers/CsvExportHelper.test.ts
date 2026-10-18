jest.mock('CommonStrings', () => ({
    Layouts: {
        DetailsList: {
            ExportColumnsJsonValidationError: 'Invalid mapping',
            ExportColumnsMissingPropertiesError: 'Missing selected properties: {0}'
        }
    }
}), { virtual: true });

import { collectExportItems, formatCsvField, getExportCurrentDataPageSize, validateExportColumnsJson } from './CsvExportHelper';

describe('collectExportItems', () => {
    it('collects all matching pages in export-sized batches', async () => {
        const fetchPage = jest.fn(async (pageNumber: number) => [{ Title: `Page ${pageNumber}` }]);
        expect(await collectExportItems(501, fetchPage, () => true))
            .toEqual([{ Title: 'Page 1' }, { Title: 'Page 2' }]);
        expect(fetchPage.mock.calls).toEqual([[1, 500], [2, 500]]);
    });

    it('discards an in-flight batch when the query or shared token context changes', async () => {
        let current = true;
        const fetchPage = jest.fn(async () => {
            current = false;
            return [{ Title: 'Results from the changed query' }];
        });
        await expect(collectExportItems(1000, fetchPage, () => current)).rejects.toThrow('Search context changed');
        expect(fetchPage).toHaveBeenCalledTimes(1);
    });

    it('does not query after an export has already been invalidated', async () => {
        const fetchPage = jest.fn(async () => []);
        await expect(collectExportItems(500, fetchPage, () => false)).rejects.toThrow('Search context changed');
        expect(fetchPage).not.toHaveBeenCalled();
    });

    it('uses the Microsoft Search message and event page limit for every page and offset', async () => {
        const fetchPage = jest.fn(async (pageNumber: number, pageSize: number) =>
            Array.from({ length: Math.min(pageSize, 60 - ((pageNumber - 1) * pageSize)) }, (_, index) => ({ Title: `${pageNumber}-${index}` })));
        const pageSize = getExportCurrentDataPageSize(true, ['listItem', 'message']);

        const items = await collectExportItems(60, fetchPage, () => true, pageSize);

        expect(pageSize).toBe(25);
        expect(items).toHaveLength(60);
        expect(fetchPage.mock.calls).toEqual([[1, 25], [2, 25], [3, 25]]);
    });

    it('keeps the standard batch size for other sources and Microsoft Search entities', () => {
        expect(getExportCurrentDataPageSize(false, ['message'])).toBe(500);
        expect(getExportCurrentDataPageSize(true, ['listItem'])).toBe(500);
        expect(getExportCurrentDataPageSize(true, ['event'])).toBe(25);
    });
});

describe('formatCsvField', () => {
    it.each(['=HYPERLINK("https://example.test")', '+SUM(1,2)', '-1+2', '@SUM(1,2)', '  =1+2', '\t=1+2', '\r\n+1', '\u0000=1', '\u0085@SUM(1,2)'])(
        'neutralizes spreadsheet formulas in strings: %s', value => {
            expect(formatCsvField(value)).toBe(`"'${value.replace(/"/g, '""')}"`);
        }
    );

    it('preserves actual numeric values', () => {
        expect(formatCsvField(-42)).toBe('"-42"');
        expect(formatCsvField(0)).toBe('"0"');
    });

    it('quotes delimiters, line breaks and embedded quotes', () => {
        expect(formatCsvField('one;two,three\n"four"')).toBe('"one;two,three\n""four"""');
        expect(formatCsvField(null)).toBe('');
    });
});

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