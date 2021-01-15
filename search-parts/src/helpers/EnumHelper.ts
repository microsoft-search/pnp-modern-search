export class EnumHelper {

    /**
     * Get the text associated to an enum value
     * @param myEnum the enum to lookup
     * @param enumValue the value to get
     */
    public static getEnumKeyByEnumValue(myEnum: any, enumValue: any): string {
        let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
        return keys.length > 0 ? keys[0] : null;
    }
}