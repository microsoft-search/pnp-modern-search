// PnP
import { ConsoleListener, LogLevel, Logger } from '@pnp/logging';

// Interface
import { IUser, IUserProfileProperty } from './../../models/IUser';
import IUserService from './IUserService';

// MockData
import { mockUserData } from './MockUserData';

// Class
export class MockUserService implements IUserService {
  constructor() {
    const consoleListener = new ConsoleListener();
    Logger.subscribe(consoleListener);
  }

  /**
   * Get user information
   */
  public async getUserProperties(accountName: string): Promise<IUser> {
    let response: any;
    try {
      response = await mockUserData;
      if (!!response && !response['odata.null']) {
        let properties = {};
        if (!!response.UserProfileProperties) {
          response.UserProfileProperties.forEach((prop: IUserProfileProperty) => {
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
