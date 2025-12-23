# Audience Targeting

Audience targeting allows you to control the visibility of the web part based on user membership in SharePoint groups, Microsoft Entra ID (Azure AD) security groups, or specific users.

!["Audience targeting settings"](../../../assets/webparts/audience-settings.png){: .center}

| Setting | Description | Default value |
| --------| ----------- |---------------|
|**Target Audience** | Select SharePoint groups, Microsoft Entra ID security groups, or individual users. The web part will only be visible if the current user is a member of at least one selected group or matches a selected user. If no audience is selected, the web part is visible to everyone. | Empty (visible to everyone) |
|**Cache Duration (hours)** | How long to cache audience membership results. Microsoft Entra ID group membership is cached in localStorage, while SharePoint group membership is cached in sessionStorage. | 1 |

## How it works

- When audiences are configured, the web part checks if the current user is a member of any of the selected groups or matches any of the selected users.
- If the user matches **at least one** selected audience (OR logic), the web part renders normally.
- If the user does not match any audience, the web part renders nothing (empty).
- In **Edit mode**, the web part always renders regardless of audience settings, so page editors can configure it.
- Group membership c|**Cache Duration (hours)** | How long to cache audience membership resuted audience types

| Type | Description |
| ---- | ----------- |
| **SharePoint Group** | Any SharePoint group in the current site. Membership is checked via SharePoint REST API. |
| **Microsoft Entra ID Security Group** | Security groups from Microsoft Entra ID (Azure AD). Membership is checked via Microsoft Graph API using transitive membership (includes nested groups). |
| **User** | Individual users by email or login name. Direct match against the current user. |

## Cache behavior

To minimize API calls and improve performance, audience membership results are cached:

- **Microsoft Entra ID groups**: Cached in `localStorage` with the key `pnp-search-aad-groups` for the duration specified.
- **SharePoint groups**: Cached in `sessionStorage` with per-group keys for the duration specified.

The cache is automatically invalidated when the duration expires.
