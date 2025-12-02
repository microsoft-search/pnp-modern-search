import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPropertyFieldGroupOrPerson } from "@pnp/spfx-property-controls";
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

/**
 * Service to check if the current user is a member of the configured audience groups
 */
export class AudienceTargetingService {
    private static readonly CLAIM_USER_PREFIX = "i:0#.f|membership|";
    private static readonly CLAIM_GROUP_PREFIX = "c:0o.c|federateddirectoryclaimprovider|";
    private static readonly AAD_GROUP_CACHE_KEY = "PnPModernSearchAudienceAADCache";

    private _audiences: IPropertyFieldGroupOrPerson[];
    private _audienceCacheDuration: number; // hours
    private _context: WebPartContext;

    constructor(audiences: IPropertyFieldGroupOrPerson[], audienceCacheDuration: number, context: WebPartContext) {
        this._audiences = audiences;
        this._audienceCacheDuration = audienceCacheDuration || 24;
        this._context = context;
    }

    /**
     * Check if the current user is a member of any of the configured audiences
     * @returns true if the user is in the audience, false otherwise
     */
    public async checkAudiences(): Promise<boolean> {
        // If no audiences configured, show to everyone
        if (!this._audiences || this._audiences.length === 0) {
            return true;
        }

        const aadGroupIds: string[] = [];

        // Check if an audience is the current person first as it requires no API calls
        for (const audience of this._audiences) {
            // Check if the audience is the current user
            const audienceLogin = audience.id?.replace(AudienceTargetingService.CLAIM_USER_PREFIX, "")?.toLowerCase();
            const currentUserLogin = this._context.pageContext.user.loginName?.toLowerCase();
            
            if (audienceLogin && currentUserLogin && audienceLogin === currentUserLogin) {
                return true;
            }

            // Collect all AAD group IDs for batch checking
            if (audience.login === "FederatedDirectoryClaimProvider") {
                aadGroupIds.push(audience.id.replace(AudienceTargetingService.CLAIM_GROUP_PREFIX, ""));
            }
        }

        const promises: Promise<boolean>[] = [];

        // Check SharePoint groups
        for (const audience of this._audiences) {
            if (audience.id) {
                const spGroupId = parseInt(audience.id, 10);
                if (!isNaN(spGroupId)) {
                    promises.push(this.isCurrentUserMemberOfSPGroup(spGroupId));
                }
            }
        }

        // Check AAD security groups
        if (aadGroupIds.length > 0) {
            promises.push(this.isCurrentUserMemberOfAADGroup(aadGroupIds));
        }

        // If any check returns true, user is in the audience
        const results = await Promise.all(promises);
        return results.some(result => result === true);
    }

    /**
     * Check if the current user is a member of a specific SharePoint Group
     * @param groupId The ID of the SharePoint group to check
     * @returns true if the user is a member, false otherwise
     */
    private async isCurrentUserMemberOfSPGroup(groupId: number): Promise<boolean> {
        try {
            const cacheKey = `isCurrentUserMemberOfSPGroup-${groupId}-${this._context.pageContext.web.id.toString()}`;
            const cachedResult = this.getFromCache(cacheKey);
            
            if (cachedResult !== null) {
                return cachedResult;
            }

            const response: SPHttpClientResponse = await this._context.spHttpClient.get(
                `${this._context.pageContext.web.absoluteUrl}/_api/web/sitegroups/getbyid(${groupId})/users`,
                SPHttpClient.configurations.v1
            );

            if (!response.ok) {
                console.error(`Error checking SP group membership: ${response.statusText}`);
                return false;
            }

            const data = await response.json();
            const users = data.value || [];
            
            // Check if the current user's ID is in the list of group users
            const isMember = users.some((user: { Id: number }) => 
                user.Id === this._context.pageContext.legacyPageContext?.userId
            );

            this.setToCache(cacheKey, isMember);
            return isMember;
        } catch (error) {
            console.error(`Error checking SP group membership: ${error}`);
            return false;
        }
    }

    /**
     * Check if the current user is a member or transitive member of an AAD group
     * @param groupIds The IDs of the Azure AD groups
     * @returns true if the user is a member of any of the groups, false otherwise
     */
    private async isCurrentUserMemberOfAADGroup(groupIds: string[]): Promise<boolean> {
        try {
            // Check if groupIds and timestamp are already cached in localStorage
            const cachedData = localStorage.getItem(AudienceTargetingService.AAD_GROUP_CACHE_KEY);
            if (cachedData) {
                const { ids, timestamp } = JSON.parse(cachedData);
                const cachedTimestamp = new Date(parseInt(timestamp));
                const currentTime = new Date();
                const timeDiff = currentTime.getTime() - cachedTimestamp.getTime();
                const hoursDiff = timeDiff / (1000 * 60 * 60);

                if (hoursDiff < this._audienceCacheDuration) {
                    // Filter locally for the group IDs you're interested in
                    return groupIds.some(groupId => ids.includes(groupId));
                }
            }

            const graphClient = await this._context.msGraphClientFactory.getClient('3');

            // Get the list of groups (including nested groups) the current user is a member of
            const transitiveGroups = await graphClient
                .api('/me/transitiveMemberOf')
                .version('v1.0')
                .select('id') // Only select group IDs to reduce the payload
                .get();

            // Cache the groupIds and timestamp in localStorage
            const transitiveGroupIds = transitiveGroups.value.map((group: { id: string }) => group.id);
            const groupData = {
                ids: transitiveGroupIds,
                timestamp: new Date().getTime().toString()
            };
            localStorage.setItem(AudienceTargetingService.AAD_GROUP_CACHE_KEY, JSON.stringify(groupData));

            // Filter locally for the group IDs you're interested in
            return groupIds.some(groupId => transitiveGroupIds.includes(groupId));
        } catch (error) {
            console.error(`Error checking AAD group membership: ${error}`);
            return false;
        }
    }

    /**
     * Get a value from session storage cache
     */
    private getFromCache(key: string): boolean | null {
        try {
            const cachedData = sessionStorage.getItem(key);
            if (cachedData) {
                const { value, timestamp } = JSON.parse(cachedData);
                const cachedTimestamp = new Date(parseInt(timestamp));
                const currentTime = new Date();
                const timeDiff = currentTime.getTime() - cachedTimestamp.getTime();
                const hoursDiff = timeDiff / (1000 * 60 * 60);

                if (hoursDiff < this._audienceCacheDuration) {
                    return value;
                }
            }
        } catch {
            // Ignore cache errors
        }
        return null;
    }

    /**
     * Set a value to session storage cache
     */
    private setToCache(key: string, value: boolean): void {
        try {
            const cacheData = {
                value: value,
                timestamp: new Date().getTime().toString()
            };
            sessionStorage.setItem(key, JSON.stringify(cacheData));
        } catch {
            // Ignore cache errors
        }
    }
}
