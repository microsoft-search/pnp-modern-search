jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseWebComponent: class extends HTMLElement {},
    BuiltinTemplateSlots: {}
}));
jest.mock('@fluentui/react', () => ({
    getTheme: () => ({ semanticColors: {}, palette: {} })
}));
jest.mock('@microsoft/sp-page-context', () => ({ PageContext: class {} }));
jest.mock('@microsoft/sp-http', () => ({ SPHttpClient: class {} }));
jest.mock('@microsoft/sp-core-library', () => ({ Log: { warn: jest.fn() }, Text: {} }));
jest.mock('CommonStrings', () => ({}), { virtual: true });
jest.mock('../services/selectedItemsEditService/SelectedItemsEditService', () => ({
    SelectedItemsEditService: class {}
}));
jest.mock('../services/taxonomyService/TaxonomyService', () => ({
    TaxonomyService: class {}
}));

import { DetailsSelectedItemButtonComponent } from './DetailsSelectedItemButtonComponent';
import { Log } from '@microsoft/sp-core-library';

describe('document details pane URL', () => {
    const component = new DetailsSelectedItemButtonComponent({});
    const baseUrl = new URL('https://example.sharepoint.com/sites/My%20Site');

    it.each([
        {
            path: '/sites/My%20Site/Shared%20Documents/Folder%20One/Report%20One.pdf',
            list: '/sites/My Site/Shared Documents',
            parent: '/sites/My Site/Shared Documents/Folder One',
            item: '/sites/My Site/Shared Documents/Folder One/Report One.pdf'
        },
        {
            path: '/sites/My%20Site/Shared%20Documents/100%25%20%23caf%C3%A9.pdf',
            list: '/sites/My Site/Shared Documents',
            parent: '/sites/My Site/Shared Documents',
            item: '/sites/My Site/Shared Documents/100% #café.pdf'
        }
    ])('encodes decoded SharePoint paths exactly once: $path', ({ path, list, parent, item }) => {
        const url = component['_buildDocumentDetailsPaneUrl']({
            DefaultEncodingURL: `${baseUrl.origin}${path}`,
            ListItemID: 6
        }, baseUrl);

        expect(url).not.toBeNull();
        const detailsUrl = new URL(url!);
        const options = JSON.parse(detailsUrl.searchParams.get('options')!);

        expect(detailsUrl.pathname).toBe('/sites/My%20Site/_layouts/15/modernFrame.aspx');
        expect(detailsUrl.searchParams.get('listUrl')).toBe(list);
        expect(detailsUrl.searchParams.get('parent')).toBe(parent);
        expect(options.itemIds).toEqual([`id=${encodeURIComponent(item)}`]);
        expect(options.selectedItemIds).toEqual(['6']);
    });

    it('does not alter paths without encoded characters', () => {
        const url = component['_buildDocumentDetailsPaneUrl']({
            Path: 'https://example.sharepoint.com/sites/MySite/Documents/Report.pdf'
        }, new URL('https://example.sharepoint.com/sites/MySite'));

        const detailsUrl = new URL(url!);
        expect(detailsUrl.searchParams.get('listUrl')).toBe('/sites/MySite/Documents');
        expect(JSON.parse(detailsUrl.searchParams.get('options')!).itemIds)
            .toEqual(['id=%2Fsites%2FMySite%2FDocuments%2FReport.pdf']);
    });

    it('uses the encoded URL instead of an ambiguous raw search path', () => {
        const url = component['_buildDocumentDetailsPaneUrl']({
            Path: 'https://example.sharepoint.com/sites/My Site/Shared Documents/100% #report%20.pdf',
            DefaultEncodingURL: 'https://example.sharepoint.com/sites/My%20Site/Shared%20Documents/100%25%20%23report%2520.pdf',
            ListItemID: 6
        }, baseUrl);

        const detailsUrl = new URL(url!);
        const options = JSON.parse(detailsUrl.searchParams.get('options')!);
        expect(detailsUrl.searchParams.get('listUrl')).toBe('/sites/My Site/Shared Documents');
        expect(options.itemIds).toEqual([
            `id=${encodeURIComponent('/sites/My Site/Shared Documents/100% #report%20.pdf')}`
        ]);
    });

    it.each([
        '100% ready.pdf',
        'report#1.pdf',
        'report%20final.pdf',
        'report.pdf?version=1'
    ])('falls back rather than guessing an ambiguous path: %s', fileName => {
        expect(component['_buildDocumentDetailsPaneUrl']({
            Path: `https://example.sharepoint.com/sites/My Site/Shared Documents/${fileName}`
        }, baseUrl)).toBeNull();
    });

    it('opens the document viewer when an ambiguous path has a unique ID', () => {
        const url = component['_buildDetailsFormUrl']({
            SPWebUrl: `${window.location.origin}/sites/MySite`,
            Path: `${window.location.origin}/sites/MySite/Documents/100% ready.pdf`,
            FileExtension: 'pdf',
            UniqueID: '73b2a1e4-6599-452a-8bb3-56f93214523a'
        });

        const viewerUrl = new URL(url!);
        expect(viewerUrl.pathname).toBe('/sites/MySite/_layouts/15/viewer.aspx');
        expect(viewerUrl.searchParams.get('sourcedoc')).toBe('{73b2a1e4-6599-452a-8bb3-56f93214523a}');
    });

    it('rejects a document URL from a different origin', () => {
        expect(component['_buildDocumentDetailsPaneUrl']({
            DefaultEncodingURL: 'https://other.example.com/sites/My%20Site/Shared%20Documents/file.pdf'
        }, baseUrl)).toBeNull();
    });

    it('reports an invalid document URL', () => {
        expect(component['_buildDetailsFormUrl']({
            SPWebUrl: `${window.location.origin}/sites/MySite`,
            DefaultEncodingURL: 'http://[',
            FileExtension: 'pdf'
        })).toBeNull();
        expect(Log.warn).toHaveBeenCalledWith(
            'DetailsSelectedItemButtonComponent',
            expect.stringContaining('Cannot construct the details form URL')
        );
    });

    it('does not fall back to a cross-origin viewer', () => {
        expect(component['_buildDocumentViewerUrl']({
            AutoPreviewUrl: 'https://other.example.com/viewer.aspx'
        }, baseUrl)).toBeNull();
    });

    it('uses the document ID when the preview URL is cross-origin', () => {
        const url = component['_buildDocumentViewerUrl']({
            AutoPreviewUrl: 'https://other.example.com/viewer.aspx',
            UniqueID: '73b2a1e4-6599-452a-8bb3-56f93214523a'
        }, baseUrl);

        expect(new URL(url!).origin).toBe(baseUrl.origin);
        expect(new URL(url!).searchParams.get('sourcedoc')).toBe('{73b2a1e4-6599-452a-8bb3-56f93214523a}');
    });
});
