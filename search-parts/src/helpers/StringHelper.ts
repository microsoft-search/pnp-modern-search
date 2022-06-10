export class StringHelper {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
    public static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    public static _bytesToHex(bytes) {
        return Array.from(
            bytes,
            byte => (byte as any).toString(16).padStart(2, "0")
        ).join("");
    }
    
    public static _stringToUTF8Bytes(string) {
        return new TextEncoder().encode(string);
    }
}