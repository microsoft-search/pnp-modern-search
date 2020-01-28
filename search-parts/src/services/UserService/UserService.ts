// PnP
import { ConsoleListener, LogLevel, Logger } from '@pnp/logging';
import { sp, SPRest } from '@pnp/sp';

// SPFx
import { PageContext } from '@microsoft/sp-page-context';

// Interface
import { IUserInfo } from '../../models/IUser';
import IUserService from './IUserService';
import { JSONParser } from '@pnp/odata';
import { Guid } from '@microsoft/sp-core-library';

// Class
export class UserService implements IUserService {

  private _pageContext: PageContext;
  private _localPnPSetup: SPRest;

  constructor(pageContext: PageContext, ) {
    this._pageContext = pageContext;

    const consoleListener = new ConsoleListener();
    Logger.subscribe(consoleListener);

    this._localPnPSetup = sp.configure({
      headers: {
        Accept: 'application/json; odata=nometadata',
      },
    }, this._pageContext.web.absoluteUrl);
  }

  /**
   * Get user information
   */

  public async getUserInfos(accountNames: string[]): Promise<IUserInfo[]> {
    
    const batch = this._localPnPSetup.createBatch();
    const parser = new JSONParser();
    const batchId = Guid.newGuid().toString();

    let userInfos: IUserInfo[] = [];

    const promises = accountNames.map(async accountName => {

        let url = `${this._pageContext.web.absoluteUrl}/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='${encodeURIComponent(`i:0#.f|membership|${accountName}`)}'&$select=DisplayName,AccountName`;
        return batch.add(url, 'GET', {
            headers: {
                Accept: 'application/json; odata=nometadata'
            }
        }, parser, batchId);
    });

    // Execute the batch
    await batch.execute();

    const response = await Promise.all(promises);
    response.map((result: any) => {
      userInfos.push({
        AccountName: result.AccountName,
        Properties: {
          DisplayName: result.DisplayName
        }
      } as IUserInfo);
    });

    return userInfos;
  }
}
