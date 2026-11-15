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
import { Log } from '@microsoft/sp-core-library';

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
        expect(result).toEqual({ verified: ['filetype'], failed: [] });
        const payload = JSON.parse(post.mock.calls[0][2].body);
        expect(payload.request).toMatchObject({
            Querytext: '*', RowLimit: 1, Refiners: 'FileType,RefinableString199,Missing'
        });
    });

    it('preserves successful results before and after a failed batch', async () => {
        const post = jest.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({
                PrimaryQueryResult: { RefinementResults: { Refiners: [{ Name: 'Field0', Entries: [{}] }] } }
            }) })
            .mockResolvedValueOnce({ ok: false, status: 403, statusText: 'Forbidden' })
            .mockResolvedValueOnce({ ok: true, json: async () => ({
                PrimaryQueryResult: { RefinementResults: { Refiners: [{ Name: 'Field40', Entries: [{}] }] } }
            }) });
        const fields = Array.from({ length: 41 }, (_, i) => `Field${i}`);
        const result = await createService(post).getRefinersWithValues(fields);
        expect(result).toEqual({ verified: ['Field0', 'Field40'], failed: fields.slice(20, 40) });
        expect(post).toHaveBeenCalledTimes(3);
        expect(Log.error).toHaveBeenCalledWith(
            '[SharePointSearchService.getRefinersWithValues()]',
            expect.objectContaining({ message: expect.stringContaining('HTTP 403') }), undefined
        );
    });

    it('isolates a property rejected with HTTP 400 without losing other checks', async () => {
        const post = jest.fn().mockImplementation(async (_url, _config, options) => {
            const names: string[] = JSON.parse(options.body).request.Refiners.split(',');
            if (names.includes('Bad')) {
                return { ok: false, status: 400, statusText: 'Bad Request' };
            }
            return { ok: true, json: async () => ({
                PrimaryQueryResult: { RefinementResults: {
                    Refiners: names.map(name => ({ Name: name, Entries: [{}] }))
                } }
            }) };
        });
        const result = await createService(post).getRefinersWithValues(['One', 'Bad', 'Two', 'Three']);
        expect(result).toEqual({ verified: ['One', 'Two', 'Three'], failed: ['Bad'] });
        expect(post).toHaveBeenCalledTimes(5);
    });

    it('bounds HTTP 400 retries and reports unresolved fields as failed', async () => {
        const post = jest.fn().mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request' });
        const fields = Array.from({ length: 20 }, (_, i) => `Field${i}`);
        const result = await createService(post).getRefinersWithValues(fields);
        expect(result.verified).toEqual([]);
        expect(result.failed).toEqual(fields);
        expect(post.mock.calls.length).toBeLessThanOrEqual(11);
    });
});
