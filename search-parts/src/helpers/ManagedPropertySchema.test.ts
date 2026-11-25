import { checkRefinerSchemaOptions, checkSortSchemaOptions } from './ManagedPropertySchema';

describe('refiner schema checks', () => {
    it('shows only refinable properties, matching names case-insensitively', () => {
        const options = [
            { key: 'refinablestring00', text: 'RefinableString00' },
            { key: 'Author', text: 'Author' },
            { key: 'AuthorOWSUSER', text: 'AuthorOWSUSER' },
            { key: 'UnknownAlias', text: 'UnknownAlias' }
        ];

        expect(checkRefinerSchemaOptions(options)).toEqual([
            { ...options[0], data: 'verified' }
        ]);
        expect(options[0]).not.toHaveProperty('data');
    });

    describe('sort schema checks', () => {
        it('shows only sortable properties, excluding unchecked expressions and matching names case-insensitively', () => {
            const options = [
                { key: 'aUtHoR', text: 'Author' },
                { key: 'FileType', text: 'FileType' },
                { key: 'AuthorOWSUSER', text: 'AuthorOWSUSER' },
                { key: '{QueryString.sort}', text: '{QueryString.sort}' },
                { key: '[rank]', text: '[rank]' }
            ];
            expect(checkSortSchemaOptions(options)).toEqual([
                { ...options[0], data: 'verified' }
            ]);
            expect(options[0]).not.toHaveProperty('data');
        });

        it('checks properties beyond 100 and excludes disabled options', () => {
            const options = [
                ...Array.from({ length: 100 }, (_, index) => ({ key: `Unknown${index}`, text: `Unknown${index}` })),
                { key: 'Created', text: 'Created', disabled: true },
                { key: 'Author', text: 'Author' }
            ];
            expect(checkSortSchemaOptions(options)).toEqual([{ key: 'Author', text: 'Author', data: 'verified' }]);
        });
    });

    it('excludes a previously disabled refinable option', () => {
        const options = [{ key: 'FileType', text: 'FileType', disabled: true }];
        expect(checkRefinerSchemaOptions(options)).toEqual([]);
    });

    it('checks options beyond the former 100-field limit', () => {
        const options = [
            ...Array.from({ length: 100 }, (_, index) => ({ key: `Unknown${index}`, text: `Unknown${index}` })),
            { key: 'FileType', text: 'FileType' }
        ];

        expect(checkRefinerSchemaOptions(options)).toEqual([{ key: 'FileType', text: 'FileType', data: 'verified' }]);
    });
});
