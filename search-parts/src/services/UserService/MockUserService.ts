// Interface
import { IUserService } from 'search-extensibility';
// Class
export class MockUserService implements IUserService {
  
  public getUserInfos(accountNames: string[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

}
