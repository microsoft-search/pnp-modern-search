import { IUserInfo } from "../../models/IUser";

export default interface IUserService {
  getUserInfos(accountNames: string[]): Promise<IUserInfo[]>;
}
