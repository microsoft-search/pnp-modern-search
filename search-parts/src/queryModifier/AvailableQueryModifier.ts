import * as strings from 'CommonStrings';
import { IQueryModifierDefinition } from "@pnp/modern-search-extensibility";

export enum BuiltinQueryModifierKeys {
    WordModifier = 'WordModifier',
}

export class AvailableQueryModifier {

    /**
     * Returns the list of builtin data sources for the Search Results
     */
    public static BuiltinQueryModifier: IQueryModifierDefinition[] = [
        {
            name: strings.BuiltInQueryModifiers.WordModifier.ModifierName,
            key: BuiltinQueryModifierKeys.WordModifier.toString(),
            description: strings.BuiltInQueryModifiers.WordModifier.ModifierDescription,
            serviceKey: null // ServiceKey will be created dynamically for builtin modifier            
        }
    ];
}