jest.mock('@microsoft/sp-core-library', () => ({
    ServiceKey: { create: () => 'search' },
    Log: { error: jest.fn(), warn: jest.fn() }
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

    it('verifies sorting with a minimal SortList request, including an empty valid result', async () => {
        const post = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ PrimaryQueryResult: { RelevantResults: { RowCount: 0 } } })
        });
        await expect(createService(post).validateSortableProperty('CustomAlias')).resolves.toBe(true);
        expect(JSON.parse(post.mock.calls[0][2].body).request).toMatchObject({
            Querytext: '*',
            RowLimit: 1,
            SelectProperties: { results: ['Path'] },
            SortList: { results: [{ Property: 'CustomAlias', Direction: 0 }] }
        });
    });

    it.each([400, 403, 429])('reports a failed sort request without claiming the field is invalid (HTTP %s)', async status => {
        const post = jest.fn().mockResolvedValue({ ok: false, status, statusText: 'Rejected' });
        await expect(createService(post).validateSortableProperty('Title')).rejects.toThrow(`HTTP ${status}`);
        expect(Log.error).toHaveBeenCalledWith(
            '[SharePointSearchService.validateSortableProperty()]',
            expect.objectContaining({ message: expect.stringContaining(`HTTP ${status}`) }), undefined
        );
    });

    it('distinguishes rejected sort fields from failed checks and shares the unsorted baseline', async () => {
        const post = jest.fn().mockImplementation(async (_url, _config, options) => {
            const query = JSON.parse(options.body).request;
            if (query.SortList.results.length > 0) {
                return { ok: false, status: 400, statusText: 'Bad Request' };
            }
            return { ok: true, json: async () => ({ PrimaryQueryResult: {} }) };
        });
        const service = createService(post);
        await expect(Promise.all([
            service.validateSortableProperty('AuthorOWSUSER'),
            service.validateSortableProperty('AnotherField')
        ])).resolves.toEqual([false, false]);
        expect(post).toHaveBeenCalledTimes(3);
        const baseline = post.mock.calls.map(call => JSON.parse(call[2].body).request).find(query => query.SortList.results.length === 0);
        expect(baseline).toMatchObject({
            Querytext: '*', RowLimit: 1, SelectProperties: { results: ['Path'] }, SortList: { results: [] }
        });
        expect(Log.warn).toHaveBeenCalledWith(
            '[SharePointSearchService.validateSortableProperty()]',
            expect.stringContaining('without sorting succeeded'), undefined
        );
    });

    it('does not label a field non-sortable when the baseline response is invalid', async () => {
        const post = jest.fn()
            .mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' })
            .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        await expect(createService(post).validateSortableProperty('Title')).rejects.toThrow('baseline returned an invalid response');
    });

    it('does not verify malformed successful responses or swallow network failures', async () => {
        const post = jest.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
            .mockRejectedValueOnce(new Error('Network failure'));
        const service = createService(post);
        await expect(service.validateSortableProperty('Title')).rejects.toThrow('invalid response');
        await expect(service.validateSortableProperty('Title')).rejects.toThrow('Network failure');
    });

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
