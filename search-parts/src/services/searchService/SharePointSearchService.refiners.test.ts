jest.mock('@microsoft/sp-core-library', () => ({
    ServiceKey: { create: () => 'search' },
    Log: { error: jest.fn() }
}));
jest.mock('@microsoft/sp-http', () => ({ SPHttpClient: { configurations: { v1: {} } } }));
jest.mock('@microsoft/sp-page-context', () => ({}));
jest.mock('@microsoft/sp-lodash-subset', () => ({
    cloneDeep: (value: object) => JSON.parse(JSON.stringify(value)),
    isEmpty: (value: unknown) => !value
}));
jest.mock('@pnp/common/storage', () => ({}));
jest.mock('@pnp/common/util', () => ({}));
jest.mock('@pnp/modern-search-extensibility', () => ({}));
jest.mock('../../helpers/LocalizationHelper', () => ({}));
jest.mock('../../common/Constants', () => ({ Constants: { X_CLIENTSERVICE_CLIENTTAG: 'test' } }));

import { SharePointSearchService } from './SharePointSearchService';

describe('SharePoint refiner checks', () => {
    const createService = (post: jest.Mock): SharePointSearchService => {
        const service: SharePointSearchService = Object.create(SharePointSearchService.prototype);
        Object.defineProperty(service, 'spHttpClient', { value: { post } });
        Object.defineProperty(service, 'searchEndpointUrl', { value: 'https://example.test/_api/search/postquery' });
        return service;
    };

    it('returns only requested refiners with values and leaves empty, invalid and missing properties unverified', async () => {
        const post = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                PrimaryQueryResult: {
                    RefinementResults: {
                        Refiners: [
                            { Name: 'filetype', Entries: [{ RefinementValue: 'pdf' }] },
                            { Name: 'RefinableString199', Entries: [] },
                            { Name: 'Unexpected', Entries: [{ RefinementValue: 'value' }] }
                        ]
                    }
                }
            })
        });
        const result = await createService(post).getRefinersWithValues([
            'FileType', 'FileType', 'RefinableString199', 'Missing', 'bad,name'
        ]);
        expect(result).toEqual(['filetype']);
        const payload = JSON.parse(post.mock.calls[0][2].body);
        expect(payload.request).toMatchObject({
            Querytext: '*', RowLimit: 1, Refiners: 'FileType,RefinableString199,Missing'
        });
    });

    it('batches requests and surfaces failures rather than treating them as empty refiners', async () => {
        const post = jest.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ PrimaryQueryResult: {} }) })
            .mockResolvedValueOnce({ ok: false, status: 403, statusText: 'Forbidden' });
        await expect(createService(post).getRefinersWithValues(Array.from({ length: 21 }, (_, i) => `Field${i}`)))
            .rejects.toThrow('HTTP 403');
        expect(post).toHaveBeenCalledTimes(2);
    });
});
