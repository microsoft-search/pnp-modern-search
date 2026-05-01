export class StringHelper {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
    public static escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    public static _bytesToHex(bytes: Uint8Array) {
        return Array.from(
            bytes,
            byte => (byte as any).toString(16).padStart(2, "0")
        ).join("");
    }
    
    public static _stringToUTF8Bytes(string: string) {
        return new TextEncoder().encode(string);
    }

    public static _hexToBytes(hex: string) {
        if (!hex) {
            return new Uint8Array();
        }

        const normalizedHex = hex
            .trim()
            .replace(/^"/, "")
            .replace(/"$/, "")
            .replace(/^ǂǂ/, "")
            .replaceAll(/\s+/g, "");

        const bytePairs = normalizedHex.match(/[0-9a-fA-F]{2}/g) || [];
        return new Uint8Array(bytePairs.map((bytePair) => Number.parseInt(bytePair, 16)));
    }

    public static _utf8BytesToString(bytes: Uint8Array) {
        return new TextDecoder().decode(bytes);
    }

    public static hexToString(hex: string) {
        return StringHelper._utf8BytesToString(StringHelper._hexToBytes(hex));
    }
}