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
        return /\p{L}/u.test(value);
    }

    private static isNonPrintableCodePoint(codePoint: number): boolean {
        return codePoint < 0x20
            || (codePoint >= 0x7f && codePoint <= 0x9f)
            || (codePoint >= 0xd800 && codePoint <= 0xdfff);
    }

    private static isHexCharacter(value: string, index: number): boolean {
        const codePoint = value.codePointAt(index) ?? 0;
        return (codePoint >= 0x30 && codePoint <= 0x39)
            || (codePoint >= 0x41 && codePoint <= 0x46)
            || (codePoint >= 0x61 && codePoint <= 0x66);
    }

    private static containsNonPrintableCharacter(value: string): boolean {
        for (let index = 0; index < value.length; index++) {
            const codePoint = value.codePointAt(index) ?? 0;
            if (this.isNonPrintableCodePoint(codePoint)) {
                return true;
            }

            if (codePoint > 0xffff) {
                index++;
            }
        }

        return false;
    }

    public static normalizeReadableLabelCandidate(value: string): string {
        let normalizedValue = `${value || ''}`.trim();

        while (normalizedValue.startsWith('"')) {
            normalizedValue = normalizedValue.substring(1);
        }

        while (normalizedValue.endsWith('"')) {
            normalizedValue = normalizedValue.substring(0, normalizedValue.length - 1);
        }

        return normalizedValue;
    }

    public static isReadablePlainLabel(value: string): boolean {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        return !!cleanedValue
            && !this.containsNonPrintableCharacter(cleanedValue)
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

        const wordSegment = "[\\p{L}\\p{M}][\\p{L}\\p{M}.'’-]*";
        const displayNamePattern = new RegExp(`^(${wordSegment}(?:\\s+${wordSegment})+)$`, 'u');
        const displayNameMatch = displayNamePattern.exec(cleanedValue);
        if (displayNameMatch?.[1]) {
            return displayNameMatch[1].trim();
        }

        const commaNamePattern = new RegExp(`^(${wordSegment}(?:\\s+${wordSegment})*,\\s*${wordSegment}(?:\\s+${wordSegment})*)$`, 'u');
        const commaNameMatch = commaNamePattern.exec(cleanedValue);
        return commaNameMatch?.[1]?.trim() || '';
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

    public static extractPreferredPeopleDisplayLabel(value: string): string {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const getPreferredPipeSegment = (candidateValue: string): string => {
            const normalizedCandidate = this.normalizeReadableLabelCandidate(candidateValue);
            if (!normalizedCandidate) {
                return '';
            }

            const preferredSegment = normalizedCandidate
                .split('|')
                .map(part => part.trim())
                .filter(Boolean)
                .find(part => !!this.extractPersonLikeLabel(part));

            return preferredSegment || this.extractFirstReadablePipeSegment(normalizedCandidate);
        };

        const preferredRawSegment = getPreferredPipeSegment(cleanedValue);
        if (preferredRawSegment) {
            return preferredRawSegment;
        }

        const decodedValue = this.decodeHexString(cleanedValue);
        return getPreferredPipeSegment(decodedValue);
    }

    /**
     * Resolves the human readable label for a raw refiner value. Falls back to the decoded
     * value (and eventually to the raw value) when no readable label can be extracted.
     */
    public static resolveDisplayLabel(rawValue: string): string {
        const readableRawLabel = this.extractReadableLabel(rawValue);
        if (readableRawLabel) {
            return readableRawLabel;
        }

        const decodedValue = this.decodeHexString(rawValue);
        if (decodedValue) {
            const readableDecodedLabel = this.extractReadableLabel(decodedValue);
            if (readableDecodedLabel) {
                return readableDecodedLabel;
            }

            return decodedValue;
        }

        return rawValue;
    }

    private static extractReadableLabel(value: string): string {
        const cleanedValue = this.normalizeReadableLabelCandidate(value);
        if (!cleanedValue) {
            return '';
        }

        const taxonomyLabel = this.extractTaxonomyLabel(cleanedValue);
        if (taxonomyLabel) {
            return taxonomyLabel;
        }

        const claimsLabel = this.extractClaimsLabel(cleanedValue);
        if (claimsLabel) {
            return claimsLabel;
        }

        if (this.isReadablePlainLabel(cleanedValue)) {
            return cleanedValue;
        }

        const personLikeLabel = this.extractPersonLikeLabel(cleanedValue);
        if (personLikeLabel) {
            return personLikeLabel;
        }

        return this.extractFirstReadablePipeSegment(cleanedValue);
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

            value = this.extractEncodedHexPayload(value);

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

    private static extractEncodedHexPayload(value: string): string {
        const markerIndex = value.indexOf('ǂ');
        if (markerIndex >= 0) {
            let payloadStart = markerIndex;

            while (value.charAt(payloadStart) === 'ǂ') {
                payloadStart++;
            }

            const payloadChars: string[] = [];

            while (payloadStart < value.length && this.isHexCharacter(value, payloadStart)) {
                payloadChars.push(value.charAt(payloadStart));
                payloadStart++;
            }

            if (payloadChars.length > 0) {
                return payloadChars.join('');
            }
        }

        return '';
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