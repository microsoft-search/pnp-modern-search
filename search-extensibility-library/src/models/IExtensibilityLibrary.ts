import { IComponentDefinition } from './IComponentDefinition';

export interface IExtensibilityLibrary {

    /**
     * Returns custom web components
     */
    getCustomWebComponents(): IComponentDefinition<any>[];
}
