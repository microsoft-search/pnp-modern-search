export class TaxonomyHelper {

    public static normalizeGuid(rawGuid: string): string {
        return rawGuid ? rawGuid.replace(/^#/, '').replaceAll('-', '').toLowerCase() : '';
    }

    public static extractGuidFromTermId(termId: string): string {
        if (!termId) {
            return '';
        }

        const cleaned = termId.replace(/^\/+|\/+$/g, '');
        const guidMatch = cleaned.match(/Guid\(([0-9a-fA-F-]{36})\)/);
        if (guidMatch && guidMatch[1]) {
            return guidMatch[1];
        }

        const plainGuidMatch = cleaned.match(/[0-9a-fA-F-]{36}/);
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
            return decodeURIComponent('%' + value.match(/.{1,2}/g)!.join('%'));
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