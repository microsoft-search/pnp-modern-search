import { IQueryModifierInput, IQueryModification,
          IExtensionContext, IQueryModifierInstance, 
          ExtensionTypes } from "..";

export abstract class BaseQueryModifier implements IQueryModifierInstance {

  public extensionType: string = ExtensionTypes.QueryModifer;
  public context: IExtensionContext;

  public async abstract onInit(): Promise<void>;

  public async abstract modifyQuery(searchQuery: IQueryModifierInput): Promise<IQueryModification>;

}
