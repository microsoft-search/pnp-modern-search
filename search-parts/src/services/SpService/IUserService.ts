
export default interface IUserService {
  /**
   * Get user properties
   * @param accountName accountName (ex :i:0#.f|membership|exemple@tenant.onmicrosoft.com)
   */
  getUserProperties(accountName : string): any;
}
