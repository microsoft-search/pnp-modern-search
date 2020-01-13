import { IQueryModifierInput, IQueryModification } from "../../models/IQueryModification";

export interface IQueryModifierDefinition {
  modifyQuery: (query: IQueryModifierInput) => Promise<IQueryModification>;
}
