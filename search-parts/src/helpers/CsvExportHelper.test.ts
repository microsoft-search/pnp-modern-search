jest.mock('CommonStrings', () => ({
    Controls: {
        ExportTextOnlyColumn: '{0} [Text Only]',
        ExportSearchResultsError: 'Export failed'
    },
    Layouts: {
        DetailsList: {
            ExportColumnsJsonValidationError: 'Invalid mapping',
            ExportColumnsMissingPropertiesError: 'Missing selected properties: {0}'
        }
    }
}), { virtual: true });

import { collectExportItems, CsvExportController, formatCsvField, getExportCurrentDataPageSize, IExportColumn, validateExportColumnsJson } from './CsvExportHelper';

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

describe('CsvExportController CSV values', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const quote = (value: string): string => `"${value.replace(/"/g, '""')}"`;

    afterEach(async () => {
        await new Promise<void>(resolve => window.setTimeout(resolve, 0));
        jest.restoreAllMocks();
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    async function exportCsv(items: Record<string, unknown>[], columns: IExportColumn[]): Promise<string> {
        let csvBlob: Blob;
        URL.createObjectURL = jest.fn((blob: Blob) => {
            csvBlob = blob;
            return 'blob:test-export';
        });
        URL.revokeObjectURL = jest.fn();
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

        const controller = new CsvExportController(async () => items);
        controller.setAvailable(true);
        await controller.export(columns);
        controller.dispose();

        expect(csvBlob).toBeDefined();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Expected CSV text'));
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(csvBlob);
        });
    }

    it('removes zero fractional seconds and Z from UTC timestamp values without changing other fields or headers', async () => {
        const csv = await exportCsv([{
            Created: '2024-01-18T11:15:05.0000000Z',
            Modified: '2024-01-18T11:15:05.000Z',
            Precise: '2024-01-18T11:15:05.1230000Z',
            Offset: '2024-01-18T11:15:05.0000000+02:00',
            Text: 'Created 2024-01-18T11:15:05.0000000Z',
            Invalid: '2024-02-30T11:15:05.0000000Z',
            Object: { value: '2024-01-18T11:15:05.0000000Z' },
            Formula: '=1+2'
        }, {
            Created: '2021-12-31T23:59:59.0000000Z'
        }, {
            Created: '2000-02-29T00:00:00.0Z',
            Modified: '1900-02-29T00:00:00.0000000Z',
            Precise: '2024-01-18T24:00:00.000Z',
            Offset: '2024-01-18T11:15:05Z',
            Text: '2024-01-18T11:15:05.0000000Z '
        }], [
            { managedProperty: 'Created', csvHeader: '2024-01-18T11:15:05.0000000Z' },
            { managedProperty: 'Modified', csvHeader: 'Modified' },
            { managedProperty: 'Precise', csvHeader: 'Precise' },
            { managedProperty: 'Offset', csvHeader: 'Offset' },
            { managedProperty: 'Text', csvHeader: 'Text' },
            { managedProperty: 'Invalid', csvHeader: 'Invalid' },
            { managedProperty: 'Object', csvHeader: 'Object' },
            { managedProperty: 'Formula', csvHeader: 'Formula' }
        ]);

        expect(csv).toBe(
            '"2024-01-18T11:15:05.0000000Z";"Modified";"Precise";"Offset";"Text";"Invalid";"Object";"Formula"\r\n' +
            '"2024-01-18T11:15:05";"2024-01-18T11:15:05";"2024-01-18T11:15:05.1230000Z";"2024-01-18T11:15:05.0000000+02:00";' +
            '"Created 2024-01-18T11:15:05.0000000Z";"2024-02-30T11:15:05.0000000Z";"{""value"":""2024-01-18T11:15:05.0000000Z""}";"\'=1+2"\r\n' +
            '"2021-12-31T23:59:59";;;;;;;\r\n' +
            '"2000-02-29T00:00:00";"1900-02-29T00:00:00.0000000Z";"2024-01-18T24:00:00.000Z";' +
            '"2024-01-18T11:15:05Z";"2024-01-18T11:15:05.0000000Z ";;;'
        );
    });

    it('adds display-name columns for single and multi-value people identities while retaining the original values', async () => {
        const alice = 'alice@example.test | Alice Smith | 693A3023 i:0#.f|membership|alice@example.test';
        const bob = ' | Bob Jones | 693A3023 i:0#.f|membership|bob@example.test';
        const claire = 'claire@example.test | Claire "CJ" Tan | 693A3023 i:0#.f|membership|claire@example.test';
        const dana = 'dana@example.test | Dana; D | 693A3023 i:0#.f|membership|dana@example.test';
        const formula = 'formula@example.test | =1+2 | 693A3023 i:0#.f|membership|formula@example.test';
        const multi = `${alice};${bob}`;
        const array = [bob, claire];
        const alternateDelimiter = `${bob};#${dana}`;
        const malformed = `${bob};not-a-person`;
        const taxonomy = 'L0|#0123456789abcdef0123456789abcdef|Region';
        const plain = 'alice@example.test | Project | Not a person';
        const csv = await exportCsv([{
            Title: 'First', Owner: null, Team: multi, Tags: taxonomy, Empty: null, Plain: plain
        }, {
            Title: 'Second', Owner: alice, Team: array, Tags: taxonomy, Empty: null, Plain: plain
        }, {
            Title: 'Third', Owner: formula, Team: alternateDelimiter, Tags: taxonomy, Empty: null, Plain: plain
        }, {
            Title: 'Fourth', Owner: 'Not an identity', Team: malformed, Tags: taxonomy, Empty: null, Plain: plain
        }], [
            { managedProperty: 'Title', csvHeader: 'Title' },
            { managedProperty: 'Owner', csvHeader: 'Requested Owner' },
            { managedProperty: 'Team', csvHeader: 'Reviewers' },
            { managedProperty: 'Tags', csvHeader: 'Tags' },
            { managedProperty: 'Empty', csvHeader: 'Empty' },
            { managedProperty: 'Plain', csvHeader: 'Plain' }
        ]);
        expect(csv).toBe([
            '"Title";"Requested Owner";"Requested Owner [Text Only]";"Reviewers";"Reviewers [Text Only]";"Tags";"Tags [Text Only]";"Empty";"Plain"',
            ['"First"', '', '', quote(multi), '"Alice Smith; Bob Jones"', quote(taxonomy), '"Region"', '', quote(plain)].join(';'),
            ['"Second"', quote(alice), '"Alice Smith"', quote(JSON.stringify(array)), quote('Bob Jones; Claire "CJ" Tan'), quote(taxonomy), '"Region"', '', quote(plain)].join(';'),
            ['"Third"', quote(formula), '"\'=1+2"', quote(alternateDelimiter), '"Bob Jones; Dana; D"', quote(taxonomy), '"Region"', '', quote(plain)].join(';'),
            ['"Fourth"', '"Not an identity"', '', quote(malformed), '', quote(taxonomy), '"Region"', '', quote(plain)].join(';')
        ].join('\r\n'));
    });

    it('adds a text-only column when an identity has no display name', async () => {
        const value = 'empty@example.test |  | 693A3023 i:0#.f|membership|empty@example.test';
        const csv = await exportCsv([{ Owner: value }], [{ managedProperty: 'Owner', csvHeader: 'Owner' }]);

        expect(csv).toBe(
            '"Owner";"Owner [Text Only]"\r\n' +
            `"${value}";""`
        );
    });

    it('extracts people and taxonomy values independently within the same column', async () => {
        const person = 'alice@example.test | Alice Smith | 693A3023 i:0#.f|membership|alice@example.test';
        const emptyPerson = 'empty@example.test |  | 693A3023 i:0#.f|membership|empty@example.test';
        const taxonomy = 'L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|Region';
        const anotherTerm = 'L0|#044444444444444444444444444444444|Europe';
        const terms = [taxonomy, anotherTerm];
        const mixedArray = [person, taxonomy];
        const csv = await exportCsv([
            { Value: person },
            { Value: taxonomy },
            { Value: emptyPerson },
            { Value: 'Not recognized' },
            { Value: terms },
            { Value: mixedArray },
            { Value: null }
        ], [{ managedProperty: 'Value', csvHeader: 'Value' }]);

        expect(csv).toBe([
            '"Value";"Value [Text Only]"',
            `${quote(person)};"Alice Smith"`,
            `${quote(taxonomy)};"Region"`,
            `${quote(emptyPerson)};""`,
            '"Not recognized";',
            `${quote(JSON.stringify(terms))};"Region; Europe"`,
            `${quote(JSON.stringify(mixedArray))};`,
            ';'
        ].join('\r\n'));
    });

    it.each(['Cost $$', 'Cost $&', 'Cost $`', "Cost $'"])(
        'preserves dollar sequences in the configured header %s',
        async header => {
            const value = 'alice@example.test | Alice Smith | 693A3023 i:0#.f|membership|alice@example.test';
            const textHeader = `${header} [Text Only]`;
            const csv = await exportCsv([{ Owner: value, Other: 'Existing' }], [
                { managedProperty: 'Owner', csvHeader: header },
                { managedProperty: 'Other', csvHeader: textHeader }
            ]);

            expect(csv).toBe(
                `${quote(header)};${quote(`${textHeader} (2)`)};${quote(textHeader)}\r\n` +
                `${quote(value)};"Alice Smith";"Existing"`
            );
        }
    );

    it('avoids collisions with configured column headers', async () => {
        const value = 'alice@example.test | Alice Smith | 693A3023 i:0#.f|membership|alice@example.test';
        const csv = await exportCsv([{ Owner: value, Other: 'First', Another: 'Second' }], [
            { managedProperty: 'Owner', csvHeader: 'Owner' },
            { managedProperty: 'Other', csvHeader: 'Owner [Text Only]' },
            { managedProperty: 'Another', csvHeader: 'Owner [Text Only] (2)' }
        ]);

        expect(csv).toBe(
            '"Owner";"Owner [Text Only] (3)";"Owner [Text Only]";"Owner [Text Only] (2)"\r\n' +
            `"${value}";"Alice Smith";"First";"Second"`
        );
    });

    it.each([
        ['=Owner', "'=Owner [Text Only]", "'=Owner"],
        ['  +Owner', "'  +Owner [Text Only]", "'  +Owner"],
        ['\t-Owner', "'\t-Owner [Text Only]", "'\t-Owner"],
        ['@Owner', "'@Owner [Text Only]", "'@Owner"],
        ["'=Owner", '=Owner [Text Only]', "'=Owner"]
    ])('avoids formatted-header collisions for %s', async (header, existingHeader, formattedHeader) => {
        const value = 'alice@example.test | Alice Smith | 693A3023 i:0#.f|membership|alice@example.test';
        const csv = await exportCsv([{ Owner: value, Other: 'Existing' }], [
            { managedProperty: 'Owner', csvHeader: header },
            { managedProperty: 'Other', csvHeader: existingHeader }
        ]);

        expect(csv).toBe(
            `${quote(formattedHeader)};${quote(`${formattedHeader} [Text Only] (2)`)};${quote(`${formattedHeader} [Text Only]`)}\r\n` +
            `${quote(value)};"Alice Smith";"Existing"`
        );
    });

    it('skips all suffixes that collide after header formatting', async () => {
        const value = 'alice@example.test | Alice Smith | 693A3023 i:0#.f|membership|alice@example.test';
        const csv = await exportCsv([{ Owner: value, Other: 'First', Another: 'Second' }], [
            { managedProperty: 'Owner', csvHeader: '=Owner' },
            { managedProperty: 'Other', csvHeader: "'=Owner [Text Only]" },
            { managedProperty: 'Another', csvHeader: "'=Owner [Text Only] (2)" }
        ]);

        expect(csv).toBe(
            `"'=Owner";"'=Owner [Text Only] (3)";"'=Owner [Text Only]";"'=Owner [Text Only] (2)"\r\n` +
            `${quote(value)};"Alice Smith";"First";"Second"`
        );
    });

    it('avoids collisions between generated headers after formatting', async () => {
        const alice = 'alice@example.test | Alice Smith | 693A3023 i:0#.f|membership|alice@example.test';
        const bob = 'bob@example.test | Bob Jones | 693A3023 i:0#.f|membership|bob@example.test';
        const csv = await exportCsv([{ Owner: alice, Other: bob }], [
            { managedProperty: 'Owner', csvHeader: '=Owner' },
            { managedProperty: 'Other', csvHeader: "'=Owner" }
        ]);

        expect(csv).toBe(
            `"'=Owner";"'=Owner [Text Only]";"'=Owner";"'=Owner [Text Only] (2)"\r\n` +
            `${quote(alice)};"Alice Smith";${quote(bob)};"Bob Jones"`
        );
    });

    it('does not add people columns for values that do not contain a complete identity', async () => {
        const csv = await exportCsv([
            { Value: 'alice@example.test' },
            { Value: 'alice@example.test | Project | 693A3023' },
            { Value: 'Region | Area' },
            { Value: ['Alice', 'Bob'] },
            { Value: { displayName: 'Alice' } },
            { Value: null }
        ], [{ managedProperty: 'Value', csvHeader: 'Value' }]);

        expect(csv).toBe(
            '"Value"\r\n' +
            '"alice@example.test"\r\n' +
            '"alice@example.test | Project | 693A3023"\r\n' +
            '"Region | Area"\r\n' +
            '"[""Alice"",""Bob""]"\r\n' +
            '"{""displayName"":""Alice""}"\r\n'
        );
    });

    it('adds label columns for single and multi-value managed metadata while retaining the original values', async () => {
        const single = 'GP0|#fa7f285a-ccb0-473a-83af-6680660b14f6;L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|AB3234C;GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9';
        const multi = 'GP0|#11111111-1111-1111-1111-111111111111;L0|#011111111-1111-1111-1111-111111111111|North; South;' +
            'GP0|#22222222-2222-2222-2222-222222222222;L0|#022222222-2222-2222-2222-222222222222|=Formula;' +
            'GPP|#33333333-3333-3333-3333-333333333333;L0|#011111111-1111-1111-1111-111111111111|North; South;' +
            'GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9';
        const array = ['L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|AB3234C', 'L0|#044444444444444444444444444444444|Europe'];
        const termSetOnly = 'GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9';
        const withPlainLabel = 'GP0|#5e0a1d6a-942c-4460-bd62-c526067b57b0;L0|#05e0a1d6a-942c-4460-bd62-c526067b57b0|Virksomhed;' +
            'GTSet|#d901b888-1484-44cf-aeee-9f4d33a333a9;GPP|#884bce4c-bbda-4f56-881e-9d7fe7e3dc13;Virksomhed';
        const malformed = `${single};not-a-term`;
        const csv = await exportCsv([
            { Tags: single },
            { Tags: multi },
            { Tags: array },
            { Tags: termSetOnly },
            { Tags: withPlainLabel },
            { Tags: malformed },
            { Tags: null }
        ], [{ managedProperty: 'Tags', csvHeader: 'Tags' }]);
        expect(csv).toBe([
            '"Tags";"Tags [Text Only]"',
            `${quote(single)};"AB3234C"`,
            `${quote(multi)};"North; South; =Formula"`,
            `${quote(JSON.stringify(array))};"AB3234C; Europe"`,
            `${quote(termSetOnly)};`,
            `${quote(withPlainLabel)};"Virksomhed"`,
            `${quote(malformed)};`,
            ';'
        ].join('\r\n'));
    });

    it.each([
        [
            'a repeated label beginning with # and # token separators',
            'GP0|#fa7f285a-ccb0-473a-83af-6680660b14f6;#L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|#Finance;' +
                '#GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9;#FINANCE',
            '#Finance'
        ],
        [
            'a semicolon-containing repeated label',
            'GP0|#fa7f285a-ccb0-473a-83af-6680660b14f6;L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|North; South;' +
                'GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9;North; South',
            'North; South'
        ],
        [
            'a repeated label with a # after a semicolon',
            'L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|North; #South;' +
                'GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9;North; #South',
            'North; #South'
        ],
        [
            'overlapping labels and repeated plain values',
            'L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|A; B;' +
                'GP0|#11111111-1111-1111-1111-111111111111;L0|#011111111-1111-1111-1111-111111111111|A;' +
                'GP0|#22222222-2222-2222-2222-222222222222;L0|#022222222-2222-2222-2222-222222222222|B; C;' +
                'GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9;A; B; C',
            'A; B; A; B; C'
        ],
        [
            'a repeated plain label before taxonomy tokens',
            '#Finance;GP0|#fa7f285a-ccb0-473a-83af-6680660b14f6;' +
                'L0|#0fa7f285a-ccb0-473a-83af-6680660b14f6|#Finance;GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9',
            '#Finance'
        ]
    ])('extracts %s', async (_description, value, label) => {
        const csv = await exportCsv([{ Value: value }], [{ managedProperty: 'Value', csvHeader: 'Value' }]);

        expect(csv).toBe(`"Value";"Value [Text Only]"\r\n${quote(value)};${quote(label)}`);
    });

    it('does not add label columns for values that are not managed metadata', async () => {
        const csv = await exportCsv([
            { Value: 'Site A | Region B' },
            { Value: 'GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9' },
            { Value: 'L0|#not-a-guid|Label' },
            { Value: null }
        ], [{ managedProperty: 'Value', csvHeader: 'Value' }]);

        expect(csv).toBe(
            '"Value"\r\n' +
            '"Site A | Region B"\r\n' +
            '"GTSet|#368d9910-ab0b-4aa9-b5ac-ddd67410bec9"\r\n' +
            '"L0|#not-a-guid|Label"\r\n'
        );
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