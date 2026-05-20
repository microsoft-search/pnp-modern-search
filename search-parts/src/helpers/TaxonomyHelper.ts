export class TaxonomyHelper {

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
            let value = hexStr;

            if (value.startsWith('"')) {
                value = value.substring(1);
            }

            if (value.endsWith('"')) {
                value = value.substring(0, value.length - 1);
            }

            value = value.replace(/^ǂǂ/, '');

            if (!/^[0-9a-fA-F]+$/.test(value) || value.length % 2 !== 0) {
                return '';
            }

            const hexPairs = value.match(/.{1,2}/g);
            if (!hexPairs) {
                return '';
            }

            return decodeURIComponent('%' + hexPairs.join('%'));
        } catch {
            return '';
        }
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