
export default interface IUserService {
  getUserInfos(accountNames: string[]): Promise<any>;
}
