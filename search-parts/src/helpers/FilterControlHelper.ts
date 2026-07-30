import { FilterConditionOperator, FilterType, IDataFilterConfiguration, IFilterControlDefinition } from "@pnp/modern-search-extensibility";
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

    /**
     * Returns the filters configuration where the filters using a custom filter control get their resolved filter type
     * and the options unsupported by their control reset to the default value.
     *
     * The property pane only disables the unsupported options, so a value persisted before the custom control was
     * selected (or before the control opted out from an option) has to be normalized here to make sure everything
     * relying on the configuration (rendering, connected data sources, ...) sees the effective values.
     *
     * @param configurations the filters configuration coming from the property pane
     * @param customFilterControls the custom filter controls loaded from the extensibility libraries
     */
    public static normalizeConfigurations<T extends IDataFilterConfiguration>(configurations: T[], customFilterControls: IFilterControlDefinition[]): T[] {

        if (!configurations || configurations.length === 0 || !customFilterControls || customFilterControls.length === 0) {
            return configurations;
        }

        return configurations.map(configuration => this.normalizeConfiguration(configuration, customFilterControls));
    }

    /**
     * Normalizes a single filter configuration. Configurations using a builtin control are returned untouched.
     * @param configuration the filter configuration coming from the property pane
     * @param customFilterControls the custom filter controls loaded from the extensibility libraries
     */
    public static normalizeConfiguration<T extends IDataFilterConfiguration>(configuration: T, customFilterControls: IFilterControlDefinition[]): T {

        const customControl = configuration ? this.getCustomControl(configuration.selectedTemplate, customFilterControls) : undefined;

        if (!customControl) {
            return configuration;
        }

        const normalized: T & { showLimitExceededWarning?: boolean } = {
            ...configuration,
            filterType: customControl.filterType || FilterType.Refiner
        };

        if (customControl.supportsMultiValues === false) {
            // Without multi values, the operator between values is meaningless
            normalized.isMulti = false;
            normalized.operator = FilterConditionOperator.AND;
        }

        if (customControl.supportsValuesCount === false) {
            normalized.showCount = false;
        }

        if (customControl.supportsMaxBuckets === false) {
            // Leaving it empty makes the data sources fall back to their default number of buckets
            normalized.maxBuckets = undefined;
            normalized.showLimitExceededWarning = false;
        }

        return normalized;
    }
}
