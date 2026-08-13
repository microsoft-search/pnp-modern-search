import { Constants } from "../common/Constants";
import { IExtensibilityConfiguration } from "../models/common/IExtensibilityConfiguration";
import { ExtensibilityConfigurationHelper } from "./ExtensibilityConfigurationHelper";

const configuration = (id: string, enabled: boolean, name: string = id): IExtensibilityConfiguration => ({
    id,
    enabled,
    name
});

const defaultFiltersConfiguration = (): IExtensibilityConfiguration[] => [
    configuration(Constants.DEFAULT_EXTENSIBILITY_LIBRARY_COMPONENT_ID, false, "Default")
];

describe("ExtensibilityConfigurationHelper", () => {
    it("inherits enabled Search Results libraries for an untouched Filters configuration", () => {
        const inherited = [
            configuration("11111111-1111-1111-1111-111111111111", true),
            configuration("22222222-2222-2222-2222-222222222222", false)
        ];

        expect(ExtensibilityConfigurationHelper.resolveFiltersConfiguration(
            defaultFiltersConfiguration(),
            inherited
        )).toEqual([inherited[0]]);
    });

    it("keeps an explicit Filters configuration instead of inheriting", () => {
        const own = [configuration("33333333-3333-3333-3333-333333333333", true)];
        const inherited = [configuration("11111111-1111-1111-1111-111111111111", true)];

        expect(ExtensibilityConfigurationHelper.resolveFiltersConfiguration(own, inherited)).toBe(own);
    });

    it("treats a disabled custom Filters entry as explicit", () => {
        const own = [configuration("33333333-3333-3333-3333-333333333333", false)];

        expect(ExtensibilityConfigurationHelper.resolveFiltersConfiguration(
            own,
            [configuration("11111111-1111-1111-1111-111111111111", true)]
        )).toBe(own);
    });

    it("treats an empty Filters configuration as explicitly loading no libraries", () => {
        const own: IExtensibilityConfiguration[] = [];

        expect(ExtensibilityConfigurationHelper.resolveFiltersConfiguration(
            own,
            [configuration("11111111-1111-1111-1111-111111111111", true)]
        )).toBe(own);
    });

    it("deduplicates inherited IDs case-insensitively and ignores braces", () => {
        const first = configuration("{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}", true, "First");
        const duplicate = configuration("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", true, "Duplicate");

        expect(ExtensibilityConfigurationHelper.resolveFiltersConfiguration(defaultFiltersConfiguration(), [first, duplicate])).toEqual([first]);
    });

    it("retains the default placeholder when no enabled library can be inherited", () => {
        const own = defaultFiltersConfiguration();

        expect(ExtensibilityConfigurationHelper.resolveFiltersConfiguration(
            own,
            [configuration("11111111-1111-1111-1111-111111111111", false)]
        )).toBe(own);
    });
});