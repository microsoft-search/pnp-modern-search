import { ServiceScope, ServiceKey } from '@microsoft/sp-core-library';

export class ServiceScopeHelper {

	/**
	 * Registers new services within a child scope of the specified root scope
	 * @param serviceKey the service keys of services to register in that scope
	 */
	public static registerChildServices(rootScope: ServiceScope, serviceKeys: ServiceKey<any>[]): ServiceScope {

		let childScope: ServiceScope = null;

		if (rootScope) {

			childScope = rootScope.startNewChild();
			serviceKeys.forEach(serviceKey => {
				childScope.createDefaultAndProvide(serviceKey);
			});

			childScope.finish();
		}

		return childScope;
	}

	/**
	 * Gets the top root service scope from a child scope
	 * @param scope a child service scope
	 * @returns 
	 */
	public static getRootServiceScope(scope: ServiceScope) {

		let rootServiceScope;
		
		let parentScope = scope.getParent();
		
		while (parentScope !== undefined) {
			rootServiceScope = parentScope;
			parentScope = parentScope.getParent();
		}

		return rootServiceScope;
	}
}