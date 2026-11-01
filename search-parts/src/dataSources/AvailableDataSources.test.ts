jest.mock('CommonStrings', () => ({
    DataSources: {
        SharePointSearch: { SourceName: 'SharePoint Search' },
        MicrosoftSearch: { SourceName: 'Microsoft Search' }
    }
}), { virtual: true });

import {
    BuiltinDataSourceProviderKeys,
    DEFAULT_MICROSOFT_SEARCH_MAX_BUCKETS,
    DEFAULT_SHAREPOINT_SEARCH_MAX_BUCKETS,
    getCommonDefaultMaxBuckets,
    getDataSourceDefaultMaxBuckets
} from './AvailableDataSources';

describe('data source default filter limits', () => {
    it('returns the built-in source defaults', () => {
        expect(getDataSourceDefaultMaxBuckets(BuiltinDataSourceProviderKeys.SharePointSearch))
            .toBe(DEFAULT_SHAREPOINT_SEARCH_MAX_BUCKETS);
        expect(DEFAULT_SHAREPOINT_SEARCH_MAX_BUCKETS).toBe(100);
        expect(getDataSourceDefaultMaxBuckets(BuiltinDataSourceProviderKeys.MicrosoftSearch))
            .toBe(DEFAULT_MICROSOFT_SEARCH_MAX_BUCKETS);
        expect(DEFAULT_MICROSOFT_SEARCH_MAX_BUCKETS).toBe(10);
    });

    it('does not assume a default for an unknown or missing source', () => {
        expect(getDataSourceDefaultMaxBuckets('custom-source')).toBeUndefined();
        expect(getDataSourceDefaultMaxBuckets()).toBeUndefined();
    });

    it('returns a hint only when all connected sources have the same known default', () => {
        expect(getCommonDefaultMaxBuckets([100])).toBe(100);
        expect(getCommonDefaultMaxBuckets([10, 10])).toBe(10);
        expect(getCommonDefaultMaxBuckets([])).toBeUndefined();
        expect(getCommonDefaultMaxBuckets([100, 10])).toBeUndefined();
        expect(getCommonDefaultMaxBuckets([100, undefined])).toBeUndefined();
        expect(getCommonDefaultMaxBuckets([undefined, 100])).toBeUndefined();
        expect(getCommonDefaultMaxBuckets([0])).toBeUndefined();
        expect(getCommonDefaultMaxBuckets([NaN])).toBeUndefined();
    });
});
