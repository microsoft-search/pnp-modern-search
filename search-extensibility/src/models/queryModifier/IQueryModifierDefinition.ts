import { IQueryModifier } from "./IQueryModifier";

export interface IQueryModifierDefinition {

    /**
     * The provider internal name
     */
    name: string;

    /**
     * The provider unique key
     */
    key: string;

    /**
     * The provider description
     */
    description: string;

    /**
     * The query modifier service key
     */
    serviceKey: any;
}