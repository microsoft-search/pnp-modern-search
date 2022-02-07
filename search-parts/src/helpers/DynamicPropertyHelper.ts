import { DynamicProperty } from '@microsoft/sp-component-base';

export class DynamicPropertyHelper {
    /**
     * Returns the value of the property or undefined
     * @param property the property
     */
    public static tryGetValueSafe(property: DynamicProperty<any>): any {
        if (!property) return undefined;
        if (property.isDisposed) return undefined;
        try {
            return property.tryGetValue();
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Returns the values of the property or undefined
     * @param property the property
     */
    public static tryGetValuesSafe(property: DynamicProperty<any>): any[] {
        if (!property) return undefined;
        if (property.isDisposed) return undefined;
        try {
            return property.tryGetValues();
        } catch (error) {
            return undefined;
        }
    }

    public static tryGetSourceSafe(property: DynamicProperty<any>): any {
        if (!property) return undefined;
        if (property.isDisposed) return undefined;
        try {
            return property.tryGetSource();
        } catch (error) {
            return undefined;
        }
    }
}