import { TaxonomyHelper } from './TaxonomyHelper';

describe('TaxonomyHelper display labels', () => {
    it('preserves a readable plain label containing a pipe', () => {
        expect(TaxonomyHelper.resolveDisplayLabel('Site A | Region B')).toBe('Site A | Region B');
    });

    it('still extracts labels from taxonomy values containing pipe separators', () => {
        expect(TaxonomyHelper.resolveDisplayLabel('L0|#0123456789abcdef0123456789abcdef|Site A')).toBe('Site A');
    });

    it('extracts the display name from a people identity value', () => {
        expect(TaxonomyHelper.resolveDisplayLabel('| Alejandro Ahmed | identity i:0#.f|membership|alejandro.ahmed@example.com'))
            .toBe('Alejandro Ahmed');
    });
});