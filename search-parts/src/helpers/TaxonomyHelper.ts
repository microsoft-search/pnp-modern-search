export class TaxonomyHelper {

    private static containsEncodedTokenMarker(value: string): boolean {
        return value.includes('ǂ');
    }

    private static isGuidLikeToken(value: string): boolean {
        return /^#?(?:[0-9a-fA-F]{17,}|[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12})$/.test(value);
    }

    private static isTaxonomyTokenPrefix(value: string): boolean {
        return /^(?:L0|GP0|GPP)$/i.test(value);
    }

    private static containsReadableLetter(value: string): boolean {
        return Array.from(value).some(char => char.toLocaleLowerCase() !== char.toLocaleUpperCase());
    }

    public static normalizeReadableLabelCandidate(value: string): string {
        return `${value || ''}`.trim().replace(/^"+|"+$/g, '');
    }

    public static isReadablePlainLabel(value: string): boolean {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        return !!cleanedValue
            && !this.containsEncodedTokenMarker(cleanedValue)
            && !cleanedValue.includes('|')
            && !this.isGuidLikeToken(cleanedValue);
    }

    public static extractTaxonomyLabel(value: string): string {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const getSafeExtractedLabel = (candidate?: string): string => {
            const normalizedCandidate = this.normalizeReadableLabelCandidate(candidate || '');
            if (!normalizedCandidate) {
                return '';
            }

            if (this.containsEncodedTokenMarker(normalizedCandidate) || this.isGuidLikeToken(normalizedCandidate)) {
                return '';
            }

            return normalizedCandidate;
        };

        const taxonomyLabelMatch = /(?:L0|GP0|GPP)\|#(?:0|0?[0-9a-f-]{32,36})\|(.+)$/i.exec(cleanedValue);
        const taxonomyLabel = getSafeExtractedLabel(taxonomyLabelMatch?.[1]);
        if (taxonomyLabel) {
            return taxonomyLabel;
        }

        const genericGuidLabelMatch = /\|#(?:0|0?[0-9a-f-]{32,36})\|([^|]+)$/i.exec(cleanedValue);
        const genericGuidLabel = getSafeExtractedLabel(genericGuidLabelMatch?.[1]);
        if (genericGuidLabel) {
            return genericGuidLabel;
        }

        return '';
    }

    public static extractClaimsLabel(value: string): string {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const claimsLabelMatch = /^i:0#.*\|([^|]+)$/i.exec(cleanedValue);
        return claimsLabelMatch?.[1]?.trim() || '';
    }

    public static extractPersonLikeLabel(value: string): string {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const personLikeLabelMatch = /([A-Za-z][A-Za-z'-]+(?:\s+[A-Za-z][A-Za-z'-]+)+)/.exec(cleanedValue);
        return personLikeLabelMatch?.[1]?.trim() || '';
    }

    public static extractEmailLikeLabel(value: string): string {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const emailMatch = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.exec(cleanedValue);
        return emailMatch?.[1] || '';
    }

    public static extractFirstReadablePipeSegment(value: string): string {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const parts = cleanedValue.split('|').map(part => part.trim()).filter(Boolean);
        const firstReadablePart = parts.find(part => this.containsReadableLetter(part)
            && !this.containsEncodedTokenMarker(part)
            && !this.isTaxonomyTokenPrefix(part)
            && !this.isGuidLikeToken(part));
        return firstReadablePart || '';
    }

    public static normalizeGuid(rawGuid: string): string {
        return rawGuid ? rawGuid.replace(/^#/, '').replaceAll('-', '').toLowerCase() : '';
    }

    public static extractGuidFromTermId(termId: string): string {
        if (!termId) {
            return '';
        }

        const cleaned = this.trimWrappingSlashes(termId);
        const wrappedGuidPattern = /Guid\(([0-9a-fA-F-]{36})\)/;
        const guidMatch = wrappedGuidPattern.exec(cleaned);
        if (guidMatch?.[1]) {
            return guidMatch[1];
        }

        const plainGuidPattern = /[0-9a-fA-F-]{36}/;
        const plainGuidMatch = plainGuidPattern.exec(cleaned);
        if (plainGuidMatch) {
            return plainGuidMatch[0];
        }

        return termId;
    }

    public static decodeHexString(hexStr: string): string {
        try {
            let value = (hexStr || '').trim();
            const escapedQuote = String.raw`\"`;

            // Values can come wrapped as "ǂǂ..." from deep links or as "ǂǂ..." literals.
            if (value.startsWith(escapedQuote) && value.endsWith(escapedQuote) && value.length >= 4) {
                value = value.substring(2, value.length - 2);
            }

            if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
                value = value.substring(1, value.length - 1);
            }

            // If escaped quotes remain in the middle, normalize them.
            value = value.replaceAll(escapedQuote, '"');

            value = value.replace(/^#?ǂ+/, '');

            value = this.getLongestHexSegment(value);

            if (value.length % 2 !== 0) {
                value = value.substring(0, value.length - 1);
            }

            if (!/^[0-9a-fA-F]+$/.test(value) || value.length === 0) {
                return '';
            }

            const hexPairs = value.match(/.{1,2}/g);
            if (!hexPairs) {
                return '';
            }

            const utf8Decoded = this.tryDecodeUtf8(hexPairs);
            if (utf8Decoded) {
                return utf8Decoded;
            }

            const utf16Decoded = this.tryDecodeUtf16(value);
            if (utf16Decoded) {
                return utf16Decoded;
            }

            return this.decodeHexPairsBestEffort(hexPairs);
        } catch {
            return '';
        }
    }

    private static getLongestHexSegment(value: string): string {
        if (/^[0-9a-fA-F]+$/.test(value)) {
            return value;
        }

        const hexSegments = value.match(/[0-9a-fA-F]+/g) || [];
        const longestHexSegment = hexSegments.sort((left, right) => right.length - left.length)[0];
        return longestHexSegment || '';
    }

    private static tryDecodeUtf8(hexPairs: string[]): string {
        try {
            const utf8Decoded = decodeURIComponent('%' + hexPairs.join('%'));
            return utf8Decoded ? utf8Decoded.replaceAll('\0', '') : '';
        } catch {
            return '';
        }
    }

    private static tryDecodeUtf16(value: string): string {
        if (value.length % 4 !== 0) {
            return '';
        }

        const utf16Chunks = value.match(/.{1,4}/g);
        if (!utf16Chunks) {
            return '';
        }

        return utf16Chunks
            .map(chunk => String.fromCodePoint(Number.parseInt(chunk, 16)))
            .join('')
            .replaceAll('\0', '');
    }

    private static decodeHexPairsBestEffort(hexPairs: string[]): string {
        return hexPairs
            .map(pair => String.fromCodePoint(Number.parseInt(pair, 16)))
            .join('')
            .replaceAll('\0', '');
    }

    public static extractGuidsFromFilterValue(rawValue: string): string[] {
        if (!rawValue) {
            return [];
        }

        const guids = new Set<string>();
        const addGuids = (items: string[]): void => {
            items.forEach(item => guids.add(item));
        };

        const value = this.stripWrappingQuotes(rawValue.trim());
        addGuids(this.extractGuidsFromTokenString(value));

        const decoded = this.decodeHexString(rawValue);
        if (decoded) {
            addGuids(this.extractGuidsFromTokenString(decoded));
        }

        const encodedTokenRegex = /"ǂǂ([0-9a-fA-F]+)"/g;
        let encodedMatch: RegExpExecArray | null;
        while ((encodedMatch = encodedTokenRegex.exec(rawValue)) !== null) {
            const decodedEmbedded = this.decodeHexString(`"ǂǂ${encodedMatch[1]}"`);
            if (decodedEmbedded) {
                addGuids(this.extractGuidsFromTokenString(decodedEmbedded));
            }
        }

        const fallbackGuid = this.normalizeGuid(this.extractGuidFromTermId(value));
        if (/^[0-9a-f]{32}$/.test(fallbackGuid)) {
            guids.add(fallbackGuid);
        }

        return Array.from(guids);
    }

    private static stripWrappingQuotes(value: string): string {
        if (!value) {
            return value;
        }

        if (value.startsWith('"') && value.endsWith('"')) {
            return value.substring(1, value.length - 1);
        }

        return value;
    }

    private static trimWrappingSlashes(value: string): string {
        let startIndex = 0;
        let endIndex = value.length;

        while (startIndex < endIndex && value.charAt(startIndex) === '/') {
            startIndex++;
        }

        while (endIndex > startIndex && value.charAt(endIndex - 1) === '/') {
            endIndex--;
        }

        return value.substring(startIndex, endIndex);
    }

    private static extractGuidsFromTokenString(token: string): string[] {
        if (!token) {
            return [];
        }

        const guids = new Set<string>();
        const addGuid = (rawGuid: string): void => {
            const normalized = this.normalizeGuid(rawGuid);
            if (/^[0-9a-f]{32}$/.test(normalized)) {
                guids.add(normalized);
            }
        };

        const taxonomyTokenRegex = /(?:GP0|GPP|L0)\|#0?([-0-9a-fA-F]{32,36})/g;
        let regexMatch: RegExpExecArray | null;

        while ((regexMatch = taxonomyTokenRegex.exec(token)) !== null) {
            addGuid(regexMatch[1]);
        }

        const parts = token.split('|');
        if (parts.length > 1) {
            addGuid(parts[1]);
        }

        return Array.from(guids);
    }
}