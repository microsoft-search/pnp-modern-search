import { IQueryModification, IQueryModifierInput, IExtensionInstance } from "../..";

export interface IQueryModifierInstance extends IExtensionInstance {
    
    modifyQuery(searchQuery:IQueryModifierInput) : Promise<IQueryModification>;

}