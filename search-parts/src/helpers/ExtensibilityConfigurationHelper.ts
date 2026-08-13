import { Constants } from "../common/Constants";
import { IExtensibilityConfiguration } from "../models/common/IExtensibilityConfiguration";

/**
 * Resolves the extensibility configuration used by Web Parts while preserving
 * compatibility with configurations saved before Search Filters had its own setting.
 */
export class ExtensibilityConfigurationHelper {

    /**
     * Uses connected Search Results libraries only while the Search Filters configuration
     * is still its untouched, disabled default placeholder. Any explicit Filters entry wins.
     */
    public static resolveFiltersConfiguration(
        filtersConfiguration: IExtensibilityConfiguration[],
        connectedResultsConfigurations: IExtensibilityConfiguration[]
    ): IExtensibilityConfiguration[] {

        const ownConfiguration = filtersConfiguration || [];
        if (!this.isDefaultFiltersConfiguration(ownConfiguration)) {
            return ownConfiguration;
        }

        const inheritedById = new Map<string, IExtensibilityConfiguration>();
        (connectedResultsConfigurations || [])
            .filter(configuration => configuration?.enabled && !!configuration.id)
            .forEach(configuration => {
                const id = this.normalizeId(configuration.id);
                if (!inheritedById.has(id)) {
                    inheritedById.set(id, { ...configuration });
                }
            });

        return inheritedById.size > 0 ? Array.from(inheritedById.values()) : ownConfiguration;
    }

    /** Creates a stable identity for runtime configuration reload checks. */
    public static getConfigurationKey(configuration: IExtensibilityConfiguration[]): string {
        return (configuration || [])
            .map(item => `${this.normalizeId(item?.id)}:${item?.enabled === true}`)
            .sort((left, right) => left.localeCompare(right))
            .join("|");
    }

    private static isDefaultFiltersConfiguration(configuration: IExtensibilityConfiguration[]): boolean {
        if (configuration.length !== 1) {
            return false;
        }

        const item = configuration[0];
        return item?.enabled !== true
            && this.normalizeId(item?.id) === this.normalizeId(Constants.DEFAULT_EXTENSIBILITY_LIBRARY_COMPONENT_ID);
    }

    private static normalizeId(id: string): string {
        return (id || "").replace(/[{}]/g, "").toLowerCase();
    }
}