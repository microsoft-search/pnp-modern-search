jest.mock("@pnp/modern-search-extensibility", () => ({
    LayoutRenderType: {
        Handlebars: "Handlebars",
        AdaptiveCards: "AdaptiveCards"
    }
}));

import { FileFormat, ITemplateService } from "../services/templateService/ITemplateService";
import type {
    IFiltersExtensibilityInput,
    IResultsExtensibilityInput
} from "./ExtensibilityUsageHelper";

const { LayoutRenderType } = require("@pnp/modern-search-extensibility") as typeof import("@pnp/modern-search-extensibility");
const { ExtensibilityUsageHelper } = require("./ExtensibilityUsageHelper") as typeof import("./ExtensibilityUsageHelper");

const createTemplateService = (templateContent: string): ITemplateService => ({
    getFileContent: jest.fn().mockResolvedValue(templateContent),
    ensureHandlebarsHelpersLoaded: jest.fn().mockResolvedValue(undefined),
    Handlebars: {
        helpers: {},
        partials: {},
        parse: jest.fn().mockReturnValue({ type: "Program", body: [] })
    }
} as unknown as ITemplateService);

const createResultsInput = (templateService: ITemplateService): IResultsExtensibilityInput => ({
    dataSourceKey: "builtin-data-source",
    selectedLayoutKey: "builtin-layout",
    layoutRenderType: LayoutRenderType.Handlebars,
    queryModifierConfiguration: [],
    inlineTemplateContent: "",
    externalTemplateUrl: "https://contoso.sharepoint.com/template.html",
    layoutProperties: {},
    resultTypes: [],
    templateService,
    builtinDataSourceKeys: ["builtin-data-source"],
    builtinLayoutKeys: ["builtin-layout"],
    builtinComponentNames: []
});

const createFiltersInput = (templateService: ITemplateService): IFiltersExtensibilityInput => ({
    selectedLayoutKey: "builtin-layout",
    filtersConfiguration: [],
    inlineTemplateContent: "",
    externalTemplateUrl: "https://contoso.sharepoint.com/filter-template.html",
    layoutProperties: {},
    templateService,
    builtinLayoutKeys: ["builtin-layout"],
    builtinFilterTemplateKeys: [],
    builtinComponentNames: []
});

describe("ExtensibilityUsageHelper external templates", () => {
    it("skips extensibility libraries when an external template uses only built-in features", async () => {
        const templateService = createTemplateService("<div>{{Title}}</div>");

        await expect(
            ExtensibilityUsageHelper.getResultsUsage(createResultsInput(templateService))
        ).resolves.toEqual({
            usesCustomExtensibility: false,
            reason: "only out-of-the-box features are used"
        });

        expect(templateService.getFileContent).toHaveBeenCalledWith(
            "https://contoso.sharepoint.com/template.html",
            FileFormat.Text
        );
    });

    it("loads extensibility libraries when an external template uses a custom component", async () => {
        const templateService = createTemplateService("<contoso-result></contoso-result>");

        await expect(
            ExtensibilityUsageHelper.getResultsUsage(createResultsInput(templateService))
        ).resolves.toEqual({
            usesCustomExtensibility: true,
            reason: "custom web component '<contoso-result>'"
        });
    });

    it("inspects Handlebars result-type external templates", async () => {
        const templateService = createTemplateService("<contoso-result></contoso-result>");
        const input = createResultsInput(templateService);
        input.externalTemplateUrl = "";
        input.resultTypes = [{
            externalTemplateUrl: "https://contoso.sharepoint.com/result-type.html"
        } as any];

        await expect(
            ExtensibilityUsageHelper.getResultsUsage(input)
        ).resolves.toEqual({
            usesCustomExtensibility: true,
            reason: "custom web component '<contoso-result>'"
        });

        expect(templateService.getFileContent).toHaveBeenCalledWith(
            "https://contoso.sharepoint.com/result-type.html",
            FileFormat.Text
        );
    });

    it("loads extensibility libraries conservatively when external template inspection fails", async () => {
        const templateService = createTemplateService("");
        (templateService.getFileContent as jest.Mock).mockRejectedValue(new Error("network error"));

        await expect(
            ExtensibilityUsageHelper.getResultsUsage(createResultsInput(templateService))
        ).resolves.toEqual({
            usesCustomExtensibility: true,
            reason: "an external template that could not be inspected"
        });
    });

    it("does not prefetch external templates when inspection is disabled for edit mode", async () => {
        const templateService = createTemplateService("<div>{{Title}}</div>");
        const input = createResultsInput(templateService);
        input.inspectExternalTemplates = false;

        await expect(
            ExtensibilityUsageHelper.getResultsUsage(input)
        ).resolves.toEqual({
            usesCustomExtensibility: true,
            reason: "external template inspection is disabled"
        });

        expect(templateService.getFileContent).not.toHaveBeenCalled();
    });

    it("loads Adaptive Card external templates as JSON for inspection", async () => {
        const templateService = createTemplateService('{"type":"AdaptiveCard"}');
        const input = createResultsInput(templateService);
        input.layoutRenderType = LayoutRenderType.AdaptiveCards;

        await ExtensibilityUsageHelper.getResultsUsage(input);

        expect(templateService.getFileContent).toHaveBeenCalledWith(
            "https://contoso.sharepoint.com/template.html",
            FileFormat.Json
        );
    });

    it("skips extensibility libraries for built-in external filter templates", async () => {
        const templateService = createTemplateService("<div>{{filter.displayName}}</div>");

        await expect(
            ExtensibilityUsageHelper.getFiltersUsage(createFiltersInput(templateService))
        ).resolves.toEqual({
            usesCustomExtensibility: false,
            reason: "only out-of-the-box features are used"
        });

        expect(templateService.getFileContent).toHaveBeenCalledWith(
            "https://contoso.sharepoint.com/filter-template.html",
            FileFormat.Text
        );
    });

    it("does not prefetch external filter templates when inspection is disabled for edit mode", async () => {
        const templateService = createTemplateService("<div>{{filter.displayName}}</div>");
        const input = createFiltersInput(templateService);
        input.inspectExternalTemplates = false;

        await expect(
            ExtensibilityUsageHelper.getFiltersUsage(input)
        ).resolves.toEqual({
            usesCustomExtensibility: true,
            reason: "external template inspection is disabled"
        });

        expect(templateService.getFileContent).not.toHaveBeenCalled();
    });
});
