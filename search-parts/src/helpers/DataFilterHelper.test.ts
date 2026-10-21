jest.mock("@pnp/modern-search-extensibility", () => ({
    FilterConditionOperator: {
        OR: "or",
        AND: "and"
    },
    FilterComparisonOperator: {
        Eq: 0,
        Neq: 1,
        Gt: 2,
        Lt: 3,
        Geq: 4,
        Leq: 5,
        Contains: 6
    },
    FilterType: {
        Refiner: "Refiner",
        StaticFilter: "StaticFilter"
    }
}));

jest.mock("../services/tokenService/TokenService", () => ({
    BuiltinTokenNames: {
        filters: "filters"
    }
}));

import type { IDataFilter } from '@pnp/modern-search-extensibility';
import { FilterComparisonOperator, FilterConditionOperator } from '@pnp/modern-search-extensibility';

const { DataFilterHelper } = require('./DataFilterHelper') as typeof import('./DataFilterHelper');
const dayjs = require('dayjs') as typeof import('dayjs');

// Hex encoded UTF-8 representation of 'Avancé' as returned by SharePoint as a 'RefinementToken'
const ACCENTED_HEX_TOKEN = '"ǂǂ4176616e63c3a9"';

describe('DataFilterHelper.buildFqlRefinementString', () => {
    it.each([
        ['Avancé', ACCENTED_HEX_TOKEN],
        ['Contoso', '"ǂǂ436f6e746f736f"'],
        ['Stedfæstet', '"ǂǂ5374656466c3a673746574"']
    ])('preserves the exact refinement token for %s', (name, value) => {
        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'RefinableString00',
                operator: 'or' as IDataFilter['operator'],
                values: [
                    { name, value, operator: FilterComparisonOperator.Eq }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result).toEqual([`RefinableString00:${value}`]);
    });

    it.each([FilterConditionOperator.OR, FilterConditionOperator.AND])('preserves tokens when combining multiple selections with %s', operator => {
        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'RefinableString00',
                operator,
                values: [
                    { name: 'Avancé', value: ACCENTED_HEX_TOKEN },
                    { name: 'Essentiel', value: '"ǂǂ457373656e7469656c"' }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result).toEqual([`RefinableString00:${operator}(${ACCENTED_HEX_TOKEN},"ǂǂ457373656e7469656c")`]);
    });

    it('preserves exact tokens restored from a JSON deep link rather than using the display label', () => {
        const selectedFilters: IDataFilter[] = JSON.parse('[{"filterName":"RefinableString144","operator":"or","values":[{"name":"Localized status label","value":"\\"ǂǂ5374656466c3a673746574\\"","operator":0}]}]');

        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined))
            .toEqual(['RefinableString144:"ǂǂ5374656466c3a673746574"']);
    });

    it.each([false, true])('retains optional URL encoding for tokens (multiple selections: %s)', multiple => {
        const selectedFilters: IDataFilter[] = [{
            filterName: 'RefinableString00',
            operator: 'or' as IDataFilter['operator'],
            values: [
                { name: 'Avancé', value: ACCENTED_HEX_TOKEN },
                ...(multiple ? [{ name: 'Contoso', value: '"ǂǂ436f6e746f736f"' }] : [])
            ]
        }];

        const expectedValues = selectedFilters[0].values.map(value => encodeURIComponent(value.value));
        const expected = multiple ? `or(${expectedValues.join(',')})` : expectedValues[0];
        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined, true))
            .toEqual([`RefinableString00:${expected}`]);
    });

    it('keeps literal custom filter values unchanged', () => {
        const selectedFilters: IDataFilter[] = [{
            filterName: 'RefinableString00',
            values: [{ name: 'Display label', value: '"Custom value"' }]
        }];

        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined))
            .toEqual(['RefinableString00:"Custom value"']);
    });

    it('keeps Yes/No token conversion for single and multiple selections', () => {
        const selectedFilters: IDataFilter[] = [{
            filterName: 'RefinableYesNo00',
            operator: 'or' as IDataFilter['operator'],
            values: [{ name: 'Yes', value: '"ǂǂ54727565"' }]
        }];

        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined))
            .toEqual(['RefinableYesNo00:true']);
        selectedFilters[0].values.push({ name: 'No', value: '"ǂǂ46616c7365"' });
        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined))
            .toEqual(['RefinableYesNo00:or(true,false)']);
    });

    it('keeps single-ended and bounded date ranges', () => {
        const selectedFilters: IDataFilter[] = [{
            filterName: 'Created',
            operator: 'and' as IDataFilter['operator'],
            values: [{ name: 'From', value: '2026-01-01T00:00:00Z', operator: FilterComparisonOperator.Geq }]
        }];

        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, dayjs))
            .toEqual(['Created:range(2026-01-01T00:00:00Z,max)']);
        selectedFilters[0].values.push({ name: 'To', value: '2026-02-01T00:00:00Z', operator: FilterComparisonOperator.Lt });
        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, dayjs))
            .toEqual(['Created:range(2026-01-01T00:00:00Z,2026-02-01T00:00:00Z,from="GE",to="LT")']);
    });

    it('keeps hierarchical taxonomy parent and descendant expansion', () => {
        const parentToken = '"ǂǂ4750507c2331323334353637383961626364656630313233343536373839616263646566"';
        const exactToken = '"ǂǂ4750307c2331323334353637383961626364656630313233343536373839616263646566"';
        const selectedFilters: IDataFilter[] = [{
            filterName: 'RefinableString01',
            values: [{ name: 'Parent term', value: parentToken }]
        }];

        expect(DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined))
            .toEqual([`RefinableString01:or(${parentToken},${exactToken})`]);
    });

    it('leaves taxonomy (GP0) hex-encoded tokens untouched', () => {
        // 'GP0|#a2cf1afb-44b6-4cf4-bf37-642bb2e9bff3' hex encoded
        const taxonomyToken = '"ǂǂ4750307c2361326366316166622d343462362d346366342d626633372d363432626232653962666633"';

        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'owstaxidCategory',
                operator: 'or' as IDataFilter['operator'],
                values: [
                    { name: 'Category 1', value: taxonomyToken }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result[0]).toContain(taxonomyToken);
    });

    it('quotes a taxonomy value when its label contains the word range', () => {
        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'RefinableString00',
                operator: 'or' as IDataFilter['operator'],
                values: [
                    { name: 'Strange', value: 'L0|#0123456789abcdef0123456789abcdef|Strange' }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result).toEqual(['RefinableString00:"L0|#0123456789abcdef0123456789abcdef|Strange"']);
    });

    it('quotes decimal numeric labels in hierarchical taxonomy refinements', () => {
        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'RefinableString01',
                operator: 'or' as IDataFilter['operator'],
                values: [
                    { name: '1008604.141', value: 'L0|#0123456789abcdef0123456789abcdef|Placements:Placements mobiliers:Mandats de gestion:1008604.141' },
                    { name: '1008604.141', value: '"ǂǂ4750507c2331323334353637383961626364656630313233343536373839616263646566"' },
                    { name: '1008604.141', value: '"ǂǂ4750307c2331323334353637383961626364656630313233343536373839616263646566"' },
                    { name: '1008604.141', value: '1008604.141' }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result).toEqual([
            'RefinableString01:or("L0|#0123456789abcdef0123456789abcdef|Placements:Placements mobiliers:Mandats de gestion:1008604.141","ǂǂ4750507c2331323334353637383961626364656630313233343536373839616263646566","ǂǂ4750307c2331323334353637383961626364656630313233343536373839616263646566","1008604.141")'
        ]);
    });

    it('does not quote executable FQL expressions containing taxonomy pipes', () => {
        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'RefinableString00',
                operator: 'or' as IDataFilter['operator'],
                values: [
                    { name: 'Category', value: 'or(GP0|#0123456789abcdef0123456789abcdef,L0|#0123456789abcdef0123456789abcdef|Category)' }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result).toEqual(['RefinableString00:or(GP0|#0123456789abcdef0123456789abcdef,L0|#0123456789abcdef0123456789abcdef|Category)']);
    });
});
