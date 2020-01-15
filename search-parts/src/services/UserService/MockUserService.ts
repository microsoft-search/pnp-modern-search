// PnP
import { ConsoleListener, LogLevel, Logger } from '@pnp/logging';

// Interface
import { IUserInfo } from '../../models/IUser';
import IUserService from './IUserService';

// MockData
import { mockUserData } from './MockUserData';

// Class
export class MockUserService implements IUserService {
  getUserInfos(accountNames: string[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  constructor() {
    const consoleListener = new ConsoleListener();
    Logger.subscribe(consoleListener);
  }
}
