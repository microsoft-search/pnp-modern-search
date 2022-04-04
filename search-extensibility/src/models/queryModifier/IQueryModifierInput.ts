import { IQueryModification } from "./IQueryModification";

export interface IQueryModifierInput extends IQueryModification {    
    resultSourceId: string;
}