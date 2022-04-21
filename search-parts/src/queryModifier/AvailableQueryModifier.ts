import * as strings from 'CommonStrings';
import { IQueryModifierDefinition } from "@pnp/modern-search-extensibility";

export enum BuiltinQueryModifierKeys {
    WordPrefixModifier = 'WordPrefixModifier',
}

export class AvailableQueryModifier {

    /**
     * Returns the list of builtin data sources for the Search Results
     */
    public static BuiltinQueryModifier: IQueryModifierDefinition[] = [
        {
            name: strings.BuiltInQueryModifiers.WordPrefixModifier.ModifierName,
            key: BuiltinQueryModifierKeys.WordPrefixModifier.toString(),
            description: strings.BuiltInQueryModifiers.WordPrefixModifier.ModifierDescription,
            serviceKey: null, // ServiceKey will be created dynamically for builtin source
            sortIdx:0,
            endWhenSuccessfull:false
        }
    ];
}