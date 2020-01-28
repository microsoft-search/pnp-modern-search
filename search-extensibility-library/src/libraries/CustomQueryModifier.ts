import { BaseQueryModifier } from '../models/BaseQueryModifier';
import { IQueryModifierInput, IQueryModification } from '../models/IQueryModification';

export class CustomQueryModifier extends BaseQueryModifier  {

  public static readonly DisplayName: string = 'Sample Query Modifier';
  public static readonly Description: string = 'Adds a filter to the query so that only word documents are returned.';

  public async onInit(): Promise<void> {
      // this._ctx // SPFx Webpart Context
  }

  public async modifyQuery(query: IQueryModifierInput): Promise<IQueryModification> {
      return new Promise<IQueryModification>((resolve, reject) => {
          // Simulate API call delay of 1 second
          setTimeout(() => {
              const newQueryText = `${query.queryText} fileextension:docx`;

              console.log(`[${CustomQueryModifier.DisplayName}] Original query '${query.queryText}' modified to '${newQueryText}'`);

              resolve({
                  queryText: newQueryText,
                  queryTemplate: query.queryTemplate
              } as IQueryModification);
          }, 1000);
      });
  }
}
