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

const { DataFilterHelper } = require('./DataFilterHelper') as typeof import('./DataFilterHelper');

// Hex encoded UTF-8 representation of 'Avancé' as returned by SharePoint as a 'RefinementToken'
const ACCENTED_HEX_TOKEN = '"ǂǂ4176616e63c3a9"';

describe('DataFilterHelper.buildFqlRefinementString', () => {
    it('decodes a single hex-encoded refinement token containing accented characters into a plain quoted string', () => {
        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'RefinableString00',
                operator: 'or' as IDataFilter['operator'],
                values: [
                    { name: 'Avancé', value: ACCENTED_HEX_TOKEN }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result).toEqual(['RefinableString00:"Avancé"']);
    });

    it('decodes multiple hex-encoded refinement tokens containing accented characters into plain quoted strings', () => {
        const selectedFilters: IDataFilter[] = [
            {
                filterName: 'RefinableString00',
                operator: 'or' as IDataFilter['operator'],
                values: [
                    { name: 'Avancé', value: ACCENTED_HEX_TOKEN },
                    { name: 'Essentiel', value: '"ǂǂ457373656e7469656c"' }
                ]
            }
        ];

        const result = DataFilterHelper.buildFqlRefinementString(selectedFilters, undefined);

        expect(result).toEqual(['RefinableString00:or("Avancé","Essentiel")']);
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
});
