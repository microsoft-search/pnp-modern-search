import { IQueryModifierDefinition } from "./IQueryModifierDefinition";
import { BaseQueryModifier } from "./BaseQueryModifier";

export interface IQueryModifierInstance<T> extends IQueryModifierDefinition<T> {
  instance: BaseQueryModifier;
  isInitialized: boolean;
}
