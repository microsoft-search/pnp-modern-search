import { IQueryModifierInput } from '../models/IQueryModifierInput';
import { IQueryModification } from '../models/IQueryModification';
import { IExtensionContext } from '../models/IExtensionContext';
import { IQueryModifierInstance } from '../models/instance/IQueryModifierInstance';
import { ExtensionTypes } from "../utility/ExtensionTypes";

export abstract class BaseQueryModifier implements IQueryModifierInstance {

  public extensionType: string = ExtensionTypes.QueryModifer;
  public context: IExtensionContext;

  public async abstract onInit(): Promise<void>;

  public async abstract modifyQuery(searchQuery: IQueryModifierInput): Promise<IQueryModification>;

}
