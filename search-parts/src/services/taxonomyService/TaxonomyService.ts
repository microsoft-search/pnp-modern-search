import { Log, ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { SPHttpClient } from '@microsoft/sp-http';
import { ITaxonomyService } from './ITaxonomyService';
import { Constants } from '../../common/Constants';
import { ITerms, ITerm } from './ITaxonomyItems';

const TaxonomyService_ServiceKey = 'PnPModernSearchTaxonomyService';

export class TaxonomyService implements ITaxonomyService {

	public static readonly ServiceKey: ServiceKey<ITaxonomyService> = ServiceKey.create(TaxonomyService_ServiceKey, TaxonomyService);

	private spHttpClient: SPHttpClient;

	constructor(serviceScope: ServiceScope) {
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
	 */
	public async getTermsByTermSetId(siteUrl: string, termSetId: string, termGroupId: string): Promise<ITerm[]> {
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

}
