# Frequently Asked Questions (FAQs)

**Q**: Should I switch from using SharePoint Search as the datasource to Microsoft Search?

![Microsoft Search](./assets/DataSources.png "Datasources")

**A**: It depends on your requirements. Microsoft Search is the API being invested in going forward and allows search on entities outside of SharePoint such as Teams, Outlook and Graph Connector items. If you are only using SharePoint and OneDrive data, using features such as managed metadata, or creating a people directory, then using the SharePoint Search API is recommended for now.

-----------------------

**Q**: How will the automatic disabling of SharePoint Online custom scripts affect the PnP Modern Search web parts?

**A**: Not at all. The PnP Modern Search web parts are built using the SharePoint Framework, which is not affected by the automatic disabling of custom scripts.

-----------------------

**Q**: In version 4.10.1 the LPC (Live Person Card) hover option became available as an option for the People Layout. What is the difference between LCP and Persona card?

![LCP option](./assets/LCP.png "LCP option in the People Layout")

**A**: The Live Person Card does not require any additional Graph Permissions. The LPC can be customized to show additional fields from Entra ID, but not the same way as the pnp-people or mgt-person. However it will always show equal to any other people card shown in Microsoft 365. See [Add or remove custom attributes on a profile card using the profile card API](https://learn.microsoft.com/graph/add-properties-profilecard).

-----------------------

**Q: Is the deprecation of SharePoint-Add-in's affecting PnP Modern Search?**

**A**: No, as the project is built using the SharePoint Framework, not the deprecated add-in model.

-----------------------

**Q**: Is the PnP Modern Search package certified by a 3rd party in order to ensure compliance with GDPR or similar requirements?

**A**: No, it is up to you to review the source code in order to ensure compliance with any relevant requirements. The web parts do not store, process or log any data, thus GDPR is not directly relevant. Any privacy concern of data is up to how data is stored and protected at the source level, e.g. SharePoint.

-----------------------

**Q**: Are the PnP Modern Search web parts logging data to a local or remote receiver?

**A**: No, the PnP Modern Search web parts are not logging data to any receiver, not even telemetry data.

-----------------------

**Q**: What is the ID or name of the PnP Modern Search App Registration in Azure AD/Entra ID?

**A**: There isn’t an App Registration nor an Enterprise application, as PnP Modern Search does not rely on an application entry. The solution uses FedAuth cookies from SharePoint when calling the SharePoint Search API, and uses the “SharePoint Online Client Extensibility” app registrations when calling Graph APIs.

The solution **does NOT elevate** any permissions when calling the APIs, as permissions are all of the type Delegated Permissions. This means that the permissions are bound to the current user in the API calls, not the PnP Modern Search solution itself.

-----------------------

**Q**: I am concerned about what will happen if the project is abandoned. Will Microsoft take over the project?

**A**: It is hard to predict the future, but a vast number of companies are using the PnP Modern Search web parts in their solutions. The solution is hosted on GitHub owned by the Microsoft Search team. Most likely these companies will either clone the project and make a commercial version or will provide the manpower needed to keep the project in maintenance mode.

-----------------------
