import { isEmpty } from '@microsoft/sp-lodash-subset';
import { IComboBoxOption } from '@fluentui/react';

/**
 * Helper class for common data source utilities
 */
export class DataSourceHelper {

    /**
     * Extract a GUID from a string using regex pattern matching
     * @param value - The string to extract GUID from
     * @returns The extracted GUID or the original value if no GUID found
     */
    public static getGuidFromString(value: string): string {
        if (value) {
            const matches = value.match(/(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/);
            if (matches) {
                return matches[0];
            }
        }
        return value;
    }

    /**
     * Check if a URL is from the current online domain
     * @param url - The URL to check
     * @returns True if the URL matches the current domain
     */
    public static isOnlineDomain(url: string): boolean {
        return !isEmpty(url) && url.toLocaleLowerCase().indexOf(window.location.hostname.split('.').slice(-2).join('.').toLocaleLowerCase()) !== -1;
    }

    /**
     * Check if a URL is from a Microsoft 365 CDN source
     * @param url - The URL to check
     * @returns True if the URL matches any M365 CDN domain pattern
     */
    public static isM365Source(url: string): boolean {
        const cdnDomains: RegExp[] = [
            /^https?:\/\/(?:[A-Za-z0-9,-]+\.)+office\.net.*/,
            /^https?:\/\/(?:[A-Za-z0-9,-]+\.)+sharepointonline\.com.*/,
            /^https?:\/\/(?:[A-Za-z0-9,-]+\.)+sharepoint\.us.*/,
            /^https?:\/\/(?:[A-Za-z0-9,-]+\.)+sharepoint-mil\.us.*/,
        ];
        return cdnDomains.some(regex => regex.test(url));
    }

    /**
     * Get the list of valid file extensions for preview
     * @returns Array of file extensions that support preview
     */
    public static getValidPreviewExtensions(): string[] {
        return ["SVG", "MOVIE", "PAGES", "PICT", "SKETCH", "AI", "PDF", "PSB", "PSD", "3G2", "3GP", "ASF", "BMP", "HEVC", "M2TS", "M4V", "MOV", "MP3", "MP4", "MP4V", "MTS", "TS", "WMV", "DWG", "FBX", "ERF", "ZIP", "ZIP", "DCM", "DCM30", "DICM", "DICOM", "PLY", "HCP", "GIF", "HEIC", "HEIF", "JPEG", "JPG", "JPE", "MEF", "MRW", "NEF", "NRW", "ORF", "PANO", "PEF", "PNG", "SPM", "TIF", "TIFF", "XBM", "XCF", "KEY", "LOG", "CSV", "DIC", "DOC", "DOCM", "DOCX", "DOTM", "DOTX", "POT", "POTM", "POTX", "PPS", "PPSM", "PPSX", "PPT", "PPTM", "PPTX", "XD", "XLS", "XLSB", "XLSX", "SLTX", "EML", "MSG", "VSD", "VSDX", "CUR", "ICO", "ICON", "EPUB", "ODP", "ODS", "ODT", "ARW", "CR2", "CRW", "DNG", "RTF", "ABAP", "ADA", "ADP", "AHK", "AS", "AS3", "ASC", "ASCX", "ASM", "ASP", "ASPX", "AWK", "BAS", "BASH", "BASH_LOGIN", "BASH_LOGOUT", "BASH_PROFILE", "BASHRC", "BAT", "BIB", "BSH", "BUILD", "BUILDER", "C", "CAPFILE", "CBK", "CC", "CFC", "CFM", "CFML", "CL", "CLJ", "CMAKE", "CMD", "COFFEE", "CPP", "CPT", "CPY", "CS", "CSHTML", "CSON", "CSPROJ", "CSS", "CTP", "CXX", "D", "DDL", "DI.DIF", "DIFF", "DISCO", "DML", "DTD", "DTML", "EL", "EMAKE", "ERB", "ERL", "F90", "F95", "FS", "FSI", "FSSCRIPT", "FSX", "GEMFILE", "GEMSPEC", "GITCONFIG", "GO", "GROOVY", "GVY", "H", "HAML", "HANDLEBARS", "HBS", "HRL", "HS", "HTC", "HTML", "HXX", "IDL", "IIM", "INC", "INF", "INI", "INL", "IPP", "IRBRC", "JADE", "JAV", "JAVA", "JS", "JSON", "JSP", "JSX", "L", "LESS", "LHS", "LISP", "LOG", "LST", "LTX", "LUA", "M", "MAKE", "MARKDN", "MARKDOWN", "MD", "MDOWN", "MKDN", "ML", "MLI", "MLL", "MLY", "MM", "MUD", "NFO", "OPML", "OSASCRIPT", "OUT", "P", "PAS", "PATCH", "PHP", "PHP2", "PHP3", "PHP4", "PHP5", "PL", "PLIST", "PM", "POD", "PP", "PROFILE", "PROPERTIES", "PS", "PS1", "PT", "PY", "PYW", "R", "RAKE", "RB", "RBX", "RC", "RE", "README", "REG", "REST", "RESW", "RESX", "RHTML", "RJS", "RPROFILE", "RPY", "RSS", "RST", "RXML", "S", "SASS", "SCALA", "SCM", "SCONSCRIPT", "SCONSTRUCT", "SCRIPT", "SCSS", "SGML", "SH", "SHTML", "SML", "SQL", "STY", "TCL", "TEX", "TEXT", "TEXTILE", "TLD", "TLI", "TMPL", "TPL", "TXT", "VB", "VI", "VIM", "WSDL", "XAML", "XHTML", "XOML", "XML", "XSD", "XSL", "XSLT", "YAML", "YAWS", "YML", "ZSH", "HTM", "HTML", "Markdown", "MD", "URL"];
    }

    /**
     * Parse and clean combo box options, handling comma-separated values
     * @param options - The combo box options to parse
     * @returns The cleaned combo box options
     */
    public static parseAndCleanOptions(options: IComboBoxOption[]): IComboBoxOption[] {
        const optionWithComma = options.find(o => (o.key as string).indexOf(",") > 0);
        if (optionWithComma) {
            return (optionWithComma.key as string).split(",").map(k => { 
                return { key: k.trim(), text: k.trim(), selected: true }; 
            });
        }
        return options;
    }
}
