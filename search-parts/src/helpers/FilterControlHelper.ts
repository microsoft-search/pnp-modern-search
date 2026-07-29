import { FilterType, IFilterControlDefinition } from "@pnp/modern-search-extensibility";
import { BuiltinFilterTypes } from "../layouts/AvailableTemplates";

/**
 * Helper resolving information about the control (i.e. 'selectedTemplate') configured for a filter,
 * regardless of whether it is a builtin control or one provided by an extensibility library.
 */
export class FilterControlHelper {

    /**
     * Returns the custom filter control definition matching a selected template, if any.
     * @param selectedTemplate the template key configured for the filter
     * @param customFilterControls the custom filter controls loaded from the extensibility libraries
     */
    public static getCustomControl(selectedTemplate: string, customFilterControls: IFilterControlDefinition[]): IFilterControlDefinition {

        if (!selectedTemplate || !customFilterControls || customFilterControls.length === 0) {
            return undefined;
        }

        return customFilterControls.filter(control => control && control.key === selectedTemplate)[0];
    }

    /**
     * Returns the filter type for a selected template. Custom controls default to 'Refiner' when they don't specify one.
     * Returns 'undefined' when the template is unknown (ex: the extensibility library is not deployed anymore).
     * @param selectedTemplate the template key configured for the filter
     * @param customFilterControls the custom filter controls loaded from the extensibility libraries
     */
    public static getFilterType(selectedTemplate: string, customFilterControls: IFilterControlDefinition[]): FilterType {

        const builtinType = BuiltinFilterTypes[selectedTemplate];

        if (builtinType) {
            return builtinType;
        }

        const customControl = this.getCustomControl(selectedTemplate, customFilterControls);

        return customControl ? (customControl.filterType || FilterType.Refiner) : undefined;
    }

    /**
     * Determines if an option of the filters configuration is supported by the custom control configured for a filter.
     * Builtin controls (i.e. no matching custom control) are left untouched and always return 'true'.
     * @param selectedTemplate the template key configured for the filter
     * @param customFilterControls the custom filter controls loaded from the extensibility libraries
     * @param option the filters configuration option to check
     */
    public static supportsOption(selectedTemplate: string, customFilterControls: IFilterControlDefinition[], option: 'multiValues' | 'valuesCount' | 'maxBuckets'): boolean {

        const customControl = this.getCustomControl(selectedTemplate, customFilterControls);

        if (!customControl) {
            return true;
        }

        switch (option) {
            case 'multiValues':
                return customControl.supportsMultiValues !== false;
            case 'valuesCount':
                return customControl.supportsValuesCount !== false;
            case 'maxBuckets':
                return customControl.supportsMaxBuckets !== false;
            default:
                return true;
        }
    }
}
