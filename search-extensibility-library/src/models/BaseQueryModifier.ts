import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQueryModifierInput, IQueryModification } from './IQueryModification';

export abstract class BaseQueryModifier {

  protected _ctx: WebPartContext;

  protected constructor(context: WebPartContext) {
    this._ctx = context;
  }

  public async onInit(): Promise<void> {

  }

  public async modifyQuery(searchQuery: IQueryModifierInput): Promise<IQueryModification> {
    throw 'Not implemented';
  }

}
