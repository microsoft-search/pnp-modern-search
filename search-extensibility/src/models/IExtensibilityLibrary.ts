import { Guid } from '@microsoft/sp-core-library';
import { IExtension, ExtensionType } from '..';

export interface IExtensibilityLibrary {

    /**
     * the id of the library, assigned in the Extensibility service
     */
    guid: Guid;
    
    /**
     * the programatic name to apply to this library
     */
    name: string;

    /**
     * the library description
     */
    description: string;

    /**
     * @returns all extensions in the library
     */
    getExtensions(): IExtension<ExtensionType>[];

    /**
     * the fabric icon to display in the UI
     */
    icon:string;
}