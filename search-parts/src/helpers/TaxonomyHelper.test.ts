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

    it('does not classify a localized taxonomy refinement expression as a plain pipe label', () => {
        // Issue #4981: the localized filter value must not outrank the term label
        expect(TaxonomyHelper.isReadablePlainLabelWithPipe('or(GP0|#16a764e9-ab0f-47de-8edc-76abd9d54881,L0|#016a764e9-ab0f-47de-8edc-76abd9d54881)'))
            .toBe(false);
    });

    it('does not classify a people identity value as a plain pipe label', () => {
        expect(TaxonomyHelper.isReadablePlainLabelWithPipe('| Alejandro Ahmed | identity i:0#.f|membership|alejandro.ahmed@example.com'))
            .toBe(false);
    });
});