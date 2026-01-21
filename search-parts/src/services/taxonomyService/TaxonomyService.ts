import { Log, ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { SPHttpClient, MSGraphClientV3, MSGraphClientFactory } from '@microsoft/sp-http';
import { ITaxonomyService } from './ITaxonomyService';
import { Constants } from '../../common/Constants';
import { ITerms, ITerm } from './ITaxonomyItems';

const TaxonomyService_ServiceKey = 'PnPModernSearchTaxonomyService';

export class TaxonomyService implements ITaxonomyService {

	public static readonly ServiceKey: ServiceKey<ITaxonomyService> = ServiceKey.create(TaxonomyService_ServiceKey, TaxonomyService);

	private spHttpClient: SPHttpClient;
	private serviceScope: ServiceScope;

	constructor(serviceScope: ServiceScope) {
		this.serviceScope = serviceScope;
		serviceScope.whenFinished(() => {
			this.spHttpClient = serviceScope.consume<SPHttpClient>(SPHttpClient.serviceKey);
		});
	}

	/**
	 * Gets multiple terms by their ids using the current taxonomy context
	 */
	public async getTermsById(siteUrl: string, termIds: string[]): Promise<ITerm[]> {
		let terms: ITerm[] = [];
		const clientServiceUrl = `${siteUrl}/_vti_bin/client.svc/ProcessQuery`;

		const xmlQueryParameters = termIds.map(id => `<Object Type="String">${id}</Object>`);

		const data = `<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="pnp"><Actions><ObjectPath Id="1" ObjectPathId="0"/><ObjectPath Id="3" ObjectPathId="2"/><ObjectPath Id="5" ObjectPathId="4"/><Query Id="6" ObjectPathId="4"><Query SelectAllProperties="true"><Properties/></Query><ChildItemQuery SelectAllProperties="false"><Properties><Property Name="Id" SelectAll="true"/><Property Name="Labels" SelectAll="true"/></Properties></ChildItemQuery></Query></Actions><ObjectPaths><StaticMethod Id="0" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}"/><Method Id="2" ParentId="0" Name="GetDefaultSiteCollectionTermStore"/><Method Id="4" ParentId="2" Name="GetTermsById"><Parameters><Parameter Type="Array">${xmlQueryParameters.join('')}</Parameter></Parameters></Method></ObjectPaths></Request>`;

		const response = await this.spHttpClient.post(clientServiceUrl, SPHttpClient.configurations.v1, {
			headers: {
				'Accept': 'application/json;odata.metadata=none',
				'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
				'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG,
				'Content-Type': 'application/xml'
			},
			body: data
		});

		if (response.status === 200) {
			const responseJson = await response.json();
			const termStoreResultTerms: ITerms[] = responseJson.filter((r: { [x: string]: string; }) => r['_ObjectType_'] === 'SP.Taxonomy.TermCollection');

			if (termStoreResultTerms.length > 0) {
				terms = termStoreResultTerms[0]._Child_Items_;
			}
		} else {
			Log.error(TaxonomyService_ServiceKey, new Error(response.statusText));
			throw new Error(response.statusText);
		}

		return terms;
	}

	/**
	 * Gets all terms from a term set using CSOM with parent hierarchy.
	 * Implements local storage caching with configurable duration.
	 */
	public async getTermsByTermSetId(siteUrl: string, termSetId: string, termGroupId: string, cacheDurationDays?: number): Promise<ITerm[]> {
		const cacheKey = `pnp_taxonomy_cache_${termSetId}`;
		const effectiveCacheDuration = cacheDurationDays !== undefined ? cacheDurationDays : 3;
		
		// Try to get from cache first
		try {
			const cachedData = localStorage.getItem(cacheKey);
			if (cachedData) {
				const parsed = JSON.parse(cachedData);
				const cachedTimestamp = new Date(parsed.timestamp);
				const now = new Date();
				const ageInDays = (now.getTime() - cachedTimestamp.getTime()) / (1000 * 60 * 60 * 24);
				
				if (ageInDays < effectiveCacheDuration) {
					Log.info(TaxonomyService_ServiceKey, `Using cached terms for ${termSetId} (age: ${ageInDays.toFixed(2)} days)`);
					console.log(`[TaxonomyService] Cache hit for ${termSetId}, age: ${ageInDays.toFixed(2)} days`);
					return parsed.terms;
				} else {
					Log.info(TaxonomyService_ServiceKey, `Cache expired for ${termSetId} (age: ${ageInDays.toFixed(2)} days, max: ${effectiveCacheDuration} days)`);
					console.log(`[TaxonomyService] Cache expired for ${termSetId}, reloading...`);
					localStorage.removeItem(cacheKey);
				}
			}
		} catch (error) {
			Log.warn(TaxonomyService_ServiceKey, `Error reading from cache: ${error}`);
		}
		
		// Fetch from server
		const clientServiceUrl = `${siteUrl}/_vti_bin/client.svc/ProcessQuery`;

		// Build CSOM request to get all terms from a specific term set
		const data = `<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="pnp"><Actions><ObjectPath Id="1" ObjectPathId="0"/><ObjectPath Id="3" ObjectPathId="2"/><ObjectPath Id="5" ObjectPathId="4"/><ObjectPath Id="7" ObjectPathId="6"/><Query Id="8" ObjectPathId="6"><Query SelectAllProperties="true"><Properties/></Query><ChildItemQuery SelectAllProperties="true"><Properties/></ChildItemQuery></Query></Actions><ObjectPaths><StaticMethod Id="0" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}"/><Method Id="2" ParentId="0" Name="GetDefaultSiteCollectionTermStore"/><Method Id="4" ParentId="2" Name="GetTermSet"><Parameters><Parameter Type="String">${termSetId}</Parameter></Parameters></Method><Method Id="6" ParentId="4" Name="GetAllTerms"/></ObjectPaths></Request>`;

		try {
			const response = await this.spHttpClient.post(clientServiceUrl, SPHttpClient.configurations.v1, {
				headers: {
					'Accept': 'application/json;odata.metadata=none',
					'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
					'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG,
					'Content-Type': 'application/xml'
				},
				body: data
			});

			if (response.status === 200) {
				const responseJson = await response.json();
				let terms: ITerm[] = [];

				// Find TermCollection in response
				if (Array.isArray(responseJson)) {
					for (const item of responseJson) {
						if (item && typeof item === 'object' && item['_ObjectType_'] === 'SP.Taxonomy.TermCollection') {
							terms = item._Child_Items_ || [];
							break;
						}
					}
				}

				Log.verbose(TaxonomyService_ServiceKey, `Found ${terms.length} terms in TermSet ${termSetId}`);
				
				// Cache the results
				if (terms.length > 0) {
					try {
						const cacheData = {
							timestamp: new Date().toISOString(),
							terms: terms
						};
						localStorage.setItem(cacheKey, JSON.stringify(cacheData));
						console.log(`[TaxonomyService] Cached ${terms.length} terms for ${termSetId}`);
					} catch (error) {
						Log.warn(TaxonomyService_ServiceKey, `Error saving to cache: ${error}`);
					}
				}
				
				return terms;
			} else {
				const errorText = await response.text();
				Log.warn(TaxonomyService_ServiceKey, `CSOM call failed: ${response.status}: ${errorText}`);
			}
		} catch (error) {
			Log.warn(TaxonomyService_ServiceKey, `Error calling CSOM: ${error}`);
		}

		return [];
	}

	/**
	 * Gets all term sets from the default site collection term store
	 */
	public async getTermSets(siteUrl: string): Promise<Array<{id: string, name: string, groupId: string, groupName: string}>> {
		const clientServiceUrl = `${siteUrl}/_vti_bin/client.svc/ProcessQuery`;

		// Build CSOM request to get all groups and their term sets
		// Proper structure: Get session -> Get store -> Get Groups property -> Query with child items including TermSets
		const data = `<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="pnp"><Actions><ObjectPath Id="1" ObjectPathId="0"/><ObjectPath Id="3" ObjectPathId="2"/><ObjectPath Id="5" ObjectPathId="4"/><Query Id="6" ObjectPathId="4"><Query SelectAllProperties="false"><Properties/></Query><ChildItemQuery SelectAllProperties="false"><Properties><Property Name="Id" ScalarProperty="true"/><Property Name="Name" ScalarProperty="true"/><Property Name="TermSets" SelectAll="false"><Query SelectAllProperties="false"><Properties/></Query><ChildItemQuery SelectAllProperties="false"><Properties><Property Name="Id" ScalarProperty="true"/><Property Name="Name" ScalarProperty="true"/></Properties></ChildItemQuery></Property></Properties></ChildItemQuery></Query></Actions><ObjectPaths><StaticMethod Id="0" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}"/><Method Id="2" ParentId="0" Name="GetDefaultSiteCollectionTermStore"/><Property Id="4" ParentId="2" Name="Groups"/></ObjectPaths></Request>`;

		try {
			const response = await this.spHttpClient.post(clientServiceUrl, SPHttpClient.configurations.v1, {
				headers: {
					'Accept': 'application/json;odata.metadata=none',
					'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
					'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG,
					'Content-Type': 'application/xml'
				},
				body: data
			});

			if (response.status === 200) {
				const responseJson = await response.json();
				const termSets: Array<{id: string, name: string, groupId: string, groupName: string}> = [];

				console.log('[TaxonomyService] CSOM Response - Array?', Array.isArray(responseJson), 'Length:', responseJson?.length);
				
				// Log all ObjectTypes in the response to understand structure
				if (Array.isArray(responseJson)) {
					console.log('[TaxonomyService] Response ObjectTypes:', responseJson.map((item, idx) => 
						`[${idx}]: ${item?._ObjectType_ || 'no _ObjectType_'}`
					));
					
					// Log the full first few items for inspection
					if (responseJson[0]?.ErrorInfo) {
						console.error('[TaxonomyService] CSOM Error:', responseJson[0].ErrorInfo);
					} else {
						console.log('[TaxonomyService] First response item (full):', JSON.stringify(responseJson[0], null, 2));
					}
				}

				// Parse groups and term sets from response
				if (Array.isArray(responseJson)) {
					for (const item of responseJson) {
						// Look for TermGroupCollection which is what Groups property returns
						if (item && typeof item === 'object' && item['_ObjectType_'] === 'SP.Taxonomy.TermGroupCollection') {
							const groups = item._Child_Items_ || [];
							console.log('[TaxonomyService] Found TermGroupCollection with', groups.length, 'groups');
							
							for (const group of groups) {
								const groupId = group.Id?.replace(/[{}]/g, '') || '';
								const groupName = group.Name || '';
								console.log('[TaxonomyService] Processing group:', groupName, groupId);
								
								const termSetCollection = group.TermSets;
								console.log('[TaxonomyService] TermSets in group:', termSetCollection ? 'exists' : 'null', 
									termSetCollection?._Child_Items_?.length || 0, 'items');
								
								if (termSetCollection && termSetCollection._Child_Items_) {
									for (const termSet of termSetCollection._Child_Items_) {
										termSets.push({
											id: termSet.Id?.replace(/[{}]/g, '') || '',
											name: termSet.Name || '',
											groupId: groupId,
											groupName: groupName
										});
									}
								}
							}
							break;
						}
					}
				}

				Log.verbose(TaxonomyService_ServiceKey, `Found ${termSets.length} term sets`);
				if (termSets.length === 0) {
					console.warn('[TaxonomyService] getTermSets returned 0 items from CSOM after parsing.');
					return await this.getTermSetsRestFallback(siteUrl);
				}
				return termSets;
			} else {
				const errorText = await response.text();
				console.error(`[TaxonomyService] CSOM call failed: ${response.status}: ${errorText}`);
				Log.warn(TaxonomyService_ServiceKey, `CSOM call failed: ${response.status}: ${errorText}`);
			}
		} catch (error) {
			console.error('[TaxonomyService] Error calling CSOM', error);
			Log.warn(TaxonomyService_ServiceKey, `Error calling CSOM: ${error}`);
		}

		return await this.getTermSetsRestFallback(siteUrl);
	}

	/**
	 * Fallback using v2.1 termstore REST API when CSOM returns no term sets.
	 */
	private async getTermSetsRestFallback(siteUrl: string): Promise<Array<{id: string, name: string, groupId: string, groupName: string}>> {
		// Try fetching all term sets directly instead of via groups
		const directEndpoint = `${siteUrl}/_api/v2.1/termStore/sets`;
		const groupsEndpoint = `${siteUrl}/_api/v2.1/termstore/groups?$expand=sets`;
		
		try {
			// First, try getting sets directly
			console.log('[TaxonomyService] REST fallback trying direct sets endpoint:', directEndpoint);
			let response = await this.spHttpClient.get(directEndpoint, SPHttpClient.configurations.v1, {
				headers: {
					'Accept': 'application/json;odata.metadata=none'
				}
			});

			if (response.status === 200) {
				const json = await response.json();
				console.log('[TaxonomyService] Direct sets response:', json.value?.length || 0, 'sets');
				
				if (json && Array.isArray(json.value) && json.value.length > 0) {
					// Get group info for each set via parentGroup navigation
					const termSets: Array<{id: string, name: string, groupId: string, groupName: string}> = [];
					for (const set of json.value) {
						termSets.push({
							id: set.id || '',
							name: set.localizedNames?.[0]?.name || set.name || '',
							groupId: set.parentGroup?.id || '',
							groupName: set.parentGroup?.name || 'Unknown Group'
						});
					}
					console.log('[TaxonomyService] Direct sets extracted', termSets.length, 'term sets');
					return termSets;
				}
			}
			
			// Fallback to groups endpoint
			console.log('[TaxonomyService] Trying groups endpoint:', groupsEndpoint);
			response = await this.spHttpClient.get(groupsEndpoint, SPHttpClient.configurations.v1, {
				headers: {
					'Accept': 'application/json;odata.metadata=none'
				}
			});

			if (response.status !== 200) {
				const errorText = await response.text();
				console.error(`[TaxonomyService] REST groups fallback failed: ${response.status}: ${errorText}`);
				return [];
			}

			const json = await response.json();
			const termSets: Array<{id: string, name: string, groupId: string, groupName: string}> = [];
			
			console.log('[TaxonomyService] Groups response:', json.value?.length || 0, 'groups');
			if (json.value && json.value.length > 0) {
				console.log('[TaxonomyService] First group structure:', JSON.stringify(json.value[0], null, 2));
			}

			if (json && Array.isArray(json.value)) {
				for (const group of json.value) {
					const groupId = group.id || '';
					const groupName = group.name || '';
					console.log('[TaxonomyService] Group:', groupName, 'has', group.sets?.length || 0, 'sets');
					if (group.sets && Array.isArray(group.sets)) {
						for (const set of group.sets) {
							termSets.push({
								id: set.id || '',
								name: set.localizedNames?.[0]?.name || set.name || '',
								groupId,
								groupName
							});
						}
					}
				}
			}

			if (termSets.length === 0) {
				console.warn('[TaxonomyService] REST fallback returned 0 term sets after both attempts. Trying Graph API...');
				return await this.getTermSetsGraphFallback();
			}

			return termSets;
		} catch (error) {
			console.error('[TaxonomyService] REST fallback error', error);
			return await this.getTermSetsGraphFallback();
		}
	}

	/**
	 * Final fallback using Microsoft Graph API to get term sets.
	 */
	private async getTermSetsGraphFallback(): Promise<Array<{id: string, name: string, groupId: string, groupName: string}>> {
		try {
			console.log('[TaxonomyService] Attempting Graph API fallback...');
			
			// Get MSGraphClientFactory from service scope
			const msGraphClientFactory = this.serviceScope.consume(MSGraphClientFactory.serviceKey);
			const graphClient: MSGraphClientV3 = await msGraphClientFactory.getClient('3');
			
			// Call Graph API to get term store groups with their sets
			const endpoint = '/sites/root/termStore/groups?$expand=sets';
			console.log('[TaxonomyService] Graph API endpoint:', endpoint);
			
			const response = await graphClient
				.api(endpoint)
				.version('v1.0')
				.get();
			
			const termSets: Array<{id: string, name: string, groupId: string, groupName: string}> = [];
			
			console.log('[TaxonomyService] Graph API response:', response.value?.length || 0, 'groups');
			
			if (response && Array.isArray(response.value)) {
				for (const group of response.value) {
					const groupId = group.id || '';
					const groupName = group.displayName || group.name || '';
					console.log('[TaxonomyService] Graph group:', groupName, 'has', group.sets?.length || 0, 'sets');
					
					if (group.sets && Array.isArray(group.sets)) {
						for (const set of group.sets) {
							termSets.push({
								id: set.id || '',
								name: set.localizedNames?.[0]?.name || set.displayName || set.name || '',
								groupId,
								groupName
							});
						}
					}
				}
			}
			
			console.log('[TaxonomyService] Graph API extracted', termSets.length, 'term sets');
			
			if (termSets.length === 0) {
				console.warn('[TaxonomyService] Graph API returned 0 term sets. No term sets available via any method.');
			}
			
			return termSets;
		} catch (error) {
			console.error('[TaxonomyService] Graph API fallback error', error);
			Log.error(TaxonomyService_ServiceKey, new Error(`Graph API fallback failed: ${error}`));
			return [];
		}
	}

	/**
	 * Clears the cached terms for a specific term set
	 */
	public clearTermsCache(termSetId: string): void {
		const cacheKey = `pnp_taxonomy_cache_${termSetId}`;
		try {
			localStorage.removeItem(cacheKey);
			console.log(`[TaxonomyService] Cleared cache for term set ${termSetId}`);
		} catch (error) {
			Log.warn(TaxonomyService_ServiceKey, `Error clearing cache: ${error}`);
		}
	}

}
