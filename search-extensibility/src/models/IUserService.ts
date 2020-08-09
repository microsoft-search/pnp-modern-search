export interface IUserService {
  getUserInfos: (accountNames: string[]) => Promise<any>;
}
