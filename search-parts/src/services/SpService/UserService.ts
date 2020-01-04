// PnP
import { ConsoleListener, LogLevel, Logger } from '@pnp/logging';
import { sp, SPRest } from '@pnp/sp';

// SPFx
import { PageContext } from '@microsoft/sp-page-context';

// Interface
import { IUser, IUserProfileProperty } from './../../models/IUser';
import IUserService from './IUserService';

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
  public async getUserProperties(accountName: string): Promise<IUser> {
    let response : any;
    try {
      response = await this._localPnPSetup.profiles.getPropertiesFor(accountName);
      if (!!response && !response['odata.null']) {
        let properties = {};
        if (!!response.UserProfileProperties) {
          response.UserProfileProperties.forEach((prop : IUserProfileProperty) => {
            properties[prop.Key] = prop.Value;
          });
          response.userProperties = properties;
        }
        return response;
      }
    } catch (error) {
      Logger.write(`[UserService.getUserProperties()]: Error: ${error}`, LogLevel.Error);
      throw error;
    }
  }
}
