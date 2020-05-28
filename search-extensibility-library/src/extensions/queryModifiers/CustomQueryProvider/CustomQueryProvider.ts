import { BaseQueryModifier, IQueryModification, IQueryModifierInput } from 'search-extensibility';
import * as strings from 'SearchExtensibilityReferenceExtensionLibraryStrings';

export default class CustomQueryModifier extends BaseQueryModifier  {

  public async onInit(): Promise<void> {
    // this.context.webPart // SPFx Webpart Context
    // this.context.search // Search Context
    // this.context.template // Template Context
  }

  public async modifyQuery(query: IQueryModifierInput): Promise<IQueryModification> {
      
    return new Promise<IQueryModification>((resolve, reject) => {

        // Simulate API call delay of 1 second
        setTimeout(() => {
            
        const newQueryText = `${query.queryText} fileextension:docx`;

            console.log(`[${strings.Extensions.QueryModifier.Custom.DisplayName}] Original query '${query.queryText}' modified to '${newQueryText}'`);

            resolve({
                queryText: newQueryText,
                queryTemplate: query.queryTemplate
            } as IQueryModification);

        }, 1000);

    });

  }
}
