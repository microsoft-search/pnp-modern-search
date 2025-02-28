/**
 * This class help you to translate the current culture name into LCID and vice versa
 * The class logic is directly inspired from the official SPFx documentation https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/localize-web-parts
 */
class LocalizationHelper {

    // Locales to match with this.context.pageContext.cultureInfo.currentUICultureName for SPFx
    public static locales = {
        1025: 'ar-SA',
        1026: 'bg-BG',
        1027: 'ca-ES',
        1028: 'zh-TW',
        1029: 'cs-CZ',
        1030: 'da-DK',
        1031: 'de-DE',
        1032: 'el-GR',
        1033: 'en-US',
        1035: 'fi-FI',
        1036: 'fr-FR',
        1037: 'he-IL',
        1038: 'hu-HU',
        1040: 'it-IT',
        1041: 'ja-JP',
        1042: 'ko-KR',
        1043: 'nl-NL',
        1044: 'nb-NO',
        1045: 'pl-PL',
        1046: 'pt-BR',
        1048: 'ro-RO',
        1049: 'ru-RU',
        1050: 'hr-HR',
        1051: 'sk-SK',
        1053: 'sv-SE',
        1054: 'th-TH',
        1055: 'tr-TR',
        1057: 'id-ID',
        1058: 'uk-UA',
        1060: 'sl-SI',
        1061: 'et-EE',
        1062: 'lv-LV',
        1063: 'lt-LT',
        1066: 'vi-VN',
        1068: 'az-Latn-AZ',
        1069: 'eu-ES',
        1071: 'mk-MK',
        1081: 'hi-IN',
        1086: 'ms-MY',
        1087: 'kk-KZ',
        1106: 'cy-GB',
        1110: 'gl-ES',
        1164: 'prs-AF',
        2052: 'zh-CN',
        2070: 'pt-PT',
        2074: 'sr-Latn-CS',
        2108: 'ga-IE',
        3082: 'es-ES',
        5146: 'bs-Latn-BA',
        9242: 'sr-Latn-RS',
        10266: 'sr-Cyrl-RS',
    };

    public static getLocaleId(localeName: string): number {
        if (this.isInt(localeName)) {
            return parseInt(localeName);
        }

        const lcid = Object.keys(LocalizationHelper.locales).filter(elt => {
            return LocalizationHelper.locales[elt].toLocaleLowerCase().indexOf(localeName.toLocaleLowerCase()) === 0;
        });

        if (lcid.length > 0) {
            return parseInt(lcid[0]);
        }
        else {
            return 0;
        }
    }

    private static isInt(value: any): boolean {
        const x = Number(value);
        return Number.isInteger(x);
    }

    /**
    * Pick culture from url in translated pages as they are folder names like: "en", "no", "de"
    */
    public static getTranslatedCultureFromUrl(): string {
        const pathParts = window.location.pathname.toLocaleLowerCase().split('/');
        const cultureFolderCandidate = pathParts[pathParts.length - 2];
        if (cultureFolderCandidate.length == 2) return cultureFolderCandidate; //ISO-639-1 uses two letter codes
        return null;
    }
    public static getTranslatedBooleanValue(displayvalue:string, lcid: number): string
    {
        if(displayvalue.toUpperCase() === "TRUE") 
        {
            let localizedValue = "Yes";
            if (lcid == 1030) return "Ja";
            if (lcid == 1031) return "Ja";
            if (lcid == 1033) return "Yes";
            if (lcid == 1035) return "Kyllä";
            if (lcid == 1036) return "Oui";
            if (lcid == 1040) return "Si";
            if (lcid == 1043) return "Ja";
            if (lcid == 1044) return "Ja";
            if (lcid == 1045) return "Tak";
            if (lcid == 1046) return "Sim";
            if (lcid == 1053) return "Ja";
            if (lcid == 3082) return "Sí";
            return localizedValue;
        }
        else
        {
            let localizedValue = "No";
            if (lcid == 1030) return "Nej";
            if (lcid == 1033) return "No";
            if (lcid == 1035) return "Ei";
            if (lcid == 1036) return "Non";
            if (lcid == 1040) return "No";
            if (lcid == 1043) return "Nee";
            if (lcid == 1044) return "Nei";
            if (lcid == 1045) return "Nie";
            if (lcid == 1046) return "Não";
            if (lcid == 1053) return "Nej";
            if (lcid == 3082) return "No";
            return localizedValue;
        }
        
    }
}

export default LocalizationHelper;
