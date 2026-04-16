import { Log } from '@microsoft/sp-core-library';
import { SPHttpClient } from '@microsoft/sp-http';
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ITaxonomyService } from './ITaxonomyService';
import { Constants } from '../../common/Constants';
import { ITerms, ITerm } from './ITaxonomyItems';

const TaxonomyService_ServiceKey = 'PnPModernSearchTaxonomyService';

export class TaxonomyService implements ITaxonomyService {

	public static ServiceKey: ServiceKey<ITaxonomyService> = ServiceKey.create(TaxonomyService_ServiceKey, TaxonomyService);

	private readonly termsCachePrefix = 'pnp_taxonomy_cache_';

	private readonly guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

	/**
	 * The SPHttpClient instance
	 */
    private spHttpClient: SPHttpClient;

    constructor(serviceScope: ServiceScope) {

		serviceScope.whenFinished(() => {
			this.spHttpClient = serviceScope.consume<SPHttpClient>(SPHttpClient.serviceKey);
		});
    }

    /**
     * Gets multiple terms by their ids using the current taxonomy context
     * @param siteUrl The site URL to use for the taxonomy session 
     * @param termIds An array of term ids to search for
     * @return {Promise<ITerm[]>} A promise containing the terms.
     */
    public async getTermsById(siteUrl: string, termIds: string[]): Promise<ITerm[]> {

		let terms: ITerm[] = [];
		const clientServiceUrl = `${siteUrl}/_vti_bin/client.svc/ProcessQuery`;

		// Build XML query parameters
		const xmlQueryParameters = termIds.map(id => {
			return `<Object Type="String">${id}</Object>`;
		});

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

			// Retrieve the term collection results
			const termStoreResultTerms: ITerms[] = responseJson.filter((r: { [x: string]: string; }) => r['_ObjectType_'] === 'SP.Taxonomy.TermCollection');

			if (termStoreResultTerms.length > 0) {

				// Retrieve all terms
				terms = termStoreResultTerms[0]._Child_Items_;
			}
		} else {

			Log.error(TaxonomyService_ServiceKey, new Error(response.statusText));
			throw new Error(response.statusText);
		}

		return terms;
	}

	/**
	 * Gets all terms from a term set using CSOM and optional local storage cache.
	 */
	public async getTermsByTermSetId(siteUrl: string, termSetId: string, termGroupId: string, cacheDurationDays?: number): Promise<ITerm[]> {
		void termGroupId; // eslint-disable-line no-void
		const sanitizedTermSetId = this.normalizeGuid(termSetId);
		if (!sanitizedTermSetId) {
			Log.warn(TaxonomyService_ServiceKey, `Invalid term set id '${termSetId}' supplied.`);
			return [];
		}

		const cacheKey = `${this.termsCachePrefix}${sanitizedTermSetId}`;
		const effectiveCacheDuration = cacheDurationDays !== undefined ? cacheDurationDays : 3;

		try {
			const cachedData = localStorage.getItem(cacheKey);
			if (cachedData) {
				const parsed = JSON.parse(cachedData);
				const cachedTimestamp = new Date(parsed.timestamp);
				const now = new Date();
				const ageInDays = (now.getTime() - cachedTimestamp.getTime()) / (1000 * 60 * 60 * 24);
				if (ageInDays < effectiveCacheDuration) {
					return parsed.terms;
				}
				localStorage.removeItem(cacheKey);
			}
		} catch {
			// Ignore cache read issues and continue with fetch.
		}

		const clientServiceUrl = `${siteUrl}/_vti_bin/client.svc/ProcessQuery`;
		const data = `<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="pnp"><Actions><ObjectPath Id="1" ObjectPathId="0"/><ObjectPath Id="3" ObjectPathId="2"/><ObjectPath Id="5" ObjectPathId="4"/><ObjectPath Id="7" ObjectPathId="6"/><Query Id="8" ObjectPathId="6"><Query SelectAllProperties="true"><Properties/></Query><ChildItemQuery SelectAllProperties="true"><Properties/></ChildItemQuery></Query></Actions><ObjectPaths><StaticMethod Id="0" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}"/><Method Id="2" ParentId="0" Name="GetDefaultSiteCollectionTermStore"/><Method Id="4" ParentId="2" Name="GetTermSet"><Parameters><Parameter Type="String">${this.escapeXml(sanitizedTermSetId)}</Parameter></Parameters></Method><Method Id="6" ParentId="4" Name="GetAllTerms"/></ObjectPaths></Request>`;

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

				if (Array.isArray(responseJson)) {
					for (const item of responseJson) {
						if (item && item['_ObjectType_'] === 'SP.Taxonomy.TermCollection') {
							terms = item._Child_Items_ || [];
							break;
						}
					}
				}

				if (terms.length > 0) {
					try {
						localStorage.setItem(cacheKey, JSON.stringify({
							timestamp: new Date().toISOString(),
							terms
						}));
					} catch {
						// Ignore cache write issues.
					}
				}

				return terms;
			}
		} catch (error) {
			Log.warn(TaxonomyService_ServiceKey, `Error calling CSOM for term set '${sanitizedTermSetId}': ${error}`);
		}

		return [];
	}

	/**
	 * Gets all term sets from the default site collection term store.
	 */
	public async getTermSets(siteUrl: string): Promise<Array<{ id: string, name: string, groupId: string, groupName: string }>> {
		const clientServiceUrl = `${siteUrl}/_vti_bin/client.svc/ProcessQuery`;
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

			if (response.status !== 200) {
				Log.warn(TaxonomyService_ServiceKey, `Failed to load term sets: ${response.statusText}`);
				return [];
			}

			const responseJson = await response.json();
			const termSets: Array<{ id: string, name: string, groupId: string, groupName: string }> = [];

			if (Array.isArray(responseJson)) {
				for (const item of responseJson) {
					if (item && item['_ObjectType_'] === 'SP.Taxonomy.TermGroupCollection') {
						const groups = item._Child_Items_ || [];
						for (const group of groups) {
							const groupId = (group.Id || '').replace(/[{}]/g, '');
							const groupName = group.Name || '';
							const groupTermSets = group.TermSets?._Child_Items_ || [];
							for (const termSet of groupTermSets) {
								termSets.push({
									id: (termSet.Id || '').replace(/[{}]/g, ''),
									name: termSet.Name || '',
									groupId,
									groupName
								});
							}
						}
						break;
					}
				}
			}

			return termSets;
		} catch (error) {
			Log.warn(TaxonomyService_ServiceKey, `Error loading term sets: ${error}`);
			return [];
		}
	}

	public clearTermsCache(termSetId: string): void {
		try {
			const sanitizedTermSetId = this.normalizeGuid(termSetId);
			if (sanitizedTermSetId) {
				localStorage.removeItem(`${this.termsCachePrefix}${sanitizedTermSetId}`);
			}
			localStorage.removeItem(`${this.termsCachePrefix}${termSetId}`);
		} catch (error) {
			Log.warn(TaxonomyService_ServiceKey, `Error clearing cache: ${error}`);
		}
	}

	/**
	 * Validates and normalizes a GUID value by trimming, removing braces, and lowercasing.
	 */
	private normalizeGuid(value: string): string | null {
		if (!value || typeof value !== 'string') {
			return null;
		}

		const trimmedValue = value.trim();
		const guid = trimmedValue.replace(/[{}]/g, '');
		return this.guidPattern.test(guid) ? guid.toLowerCase() : null;
	}

	/**
	 * Escapes XML special characters before interpolating values into CSOM request payloads.
	 */
	private escapeXml(value: string): string {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');
	}
}
