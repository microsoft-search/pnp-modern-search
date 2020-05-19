import { IExtensionInstance } from "./IExtensionInstance";
import { IQueryModifierInput } from "../IQueryModifierInput";
import { IQueryModification } from "../IQueryModification";

export interface IQueryModifierInstance extends IExtensionInstance {
    
    modifyQuery(searchQuery:IQueryModifierInput) : Promise<IQueryModification>;

}