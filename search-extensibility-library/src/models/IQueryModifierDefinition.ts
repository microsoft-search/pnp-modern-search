import { IQueryModifierInput, IQueryModification } from "./IQueryModification";

export interface IQueryModifierDefinition {
  modifyQuery: (query: IQueryModifierInput) => Promise<IQueryModification>;
}
