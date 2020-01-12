export interface IUser {
  AccountName: string;
  DirectReports: string[];
  DisplayName: string;
  Email: string;
  ExtendedManagers: string[];
  ExtendedReports: string[];
  IsFollowed: boolean;
  LatestPost?: any;
  Peers: string[];
  PersonalSiteHostUrl: string;
  PersonalUrl: string;
  PictureUrl: string;
  Title: string;
  UserUrl: string;

  /* List of UserProfileProperties column
  UserProfile_GUID,SID,ADGuid,AccountName,FirstName,SPS-PhoneticFirstName,LastName,SPS-PhoneticLastName,PreferredName,SPS-PhoneticDisplayName,WorkPhone,
  Department,Title,SPS-Department,Manager,AboutMe,PersonalSpace,PictureURL,UserName,QuickLinks,WebSite,SPS-JobTitle,SPS-DataSource,SPS-MemberOf,
  SPS-Dotted-line,SPS-Peers,SPS-Responsibility,SPS-SipAddress,SPS-MySiteUpgrade,SPS-DontSuggestList,SPS-ProxyAddresses,SPS-HireDate,SPS-DisplayOrder,
  SPS-ClaimID,SPS-ClaimProviderID,SPS-LastColleagueAdded,SPS-OWAUrl,SPS-ResourceSID,SPS-ResourceAccountName,SPS-MasterAccountName,SPS-UserPrincipalName,
  SPS-O15FirstRunExperience,SPS-PersonalSiteInstantiationState,SPS-DistinguishedName,SPS-SourceObjectDN,SPS-LastKeywordAdded,SPS-ClaimProviderType,
  SPS-SavedAccountName,SPS-SavedSID,SPS-ObjectExists,SPS-PersonalSiteCapabilities,SPS-PersonalSiteFirstCreationTime,SPS-PersonalSiteLastCreationTime,
  SPS-PersonalSiteNumberOfRetries,SPS-PersonalSiteFirstCreationError,SPS-FeedIdentifier,WorkEmail,CellPhone,Fax,HomePhone,Office,SPS-Location,Assistant,
  SPS-PastProjects,SPS-Skills,SPS-School,SPS-Birthday,SPS-StatusNotes,SPS-Interests,SPS-HashTags,SPS-EmailOptin,SPS-PrivacyPeople,SPS-PrivacyActivity,
  SPS-PictureTimestamp,SPS-PicturePlaceholderState,SPS-PictureExchangeSyncState,SPS-MUILanguages,SPS-ContentLanguages,SPS-TimeZone,SPS-RegionalSettings-FollowWeb,
  SPS-Locale,SPS-CalendarType,SPS-AltCalendarType,SPS-AdjustHijriDays,SPS-ShowWeeks,SPS-WorkDays,SPS-WorkDayStartHour,SPS-WorkDayEndHour,SPS-Time24,
  SPS-FirstDayOfWeek,SPS-FirstWeekOfYear,SPS-RegionalSettings-Initialized,OfficeGraphEnabled,SPS-UserType,SPS-HideFromAddressLists,SPS-RecipientTypeDetails,
  DelveFlags,VideoUserPopup,PulseMRUPeople,msOnline-ObjectId,SPS-PointPublishingUrl,SPS-TenantInstanceId,SPS-SharePointHomeExperienceState,SPS-RefreshToken,
  SPS-MultiGeoFlags,PreferredDataLocation
  */
  UserProfileProperties: IUserProfileProperty[];
}

export interface IUserProfileProperty {
  Key: string;
  Value: string;
  ValueType: string;
}
