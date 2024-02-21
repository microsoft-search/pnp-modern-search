import { WebPartContext } from '@microsoft/sp-webpart-base';

export const loadMsGraphToolkit = async (context: WebPartContext, disambiguation: string) => {

    const component = disambiguation !== null && disambiguation !== undefined && disambiguation !== "" ? window.customElements.get(`mgt-${disambiguation}-person`) : window.customElements.get("mgt-person");
    if (!component) {
        // Load Microsoft Graph Toolkit dynamically
        const { customElementHelper } = await import(
            /* webpackChunkName: 'microsoft-graph-toolkit' */
            '@microsoft/mgt-element/dist/es6/components/customElementHelper'
        );
        
        if (disambiguation !== null && disambiguation !== undefined && disambiguation !== "") {
            customElementHelper.withDisambiguation(disambiguation);
        }

        const { Providers } = await import(
          /* webpackChunkName: 'microsoft-graph-toolkit' */
          '@microsoft/mgt-element/dist/es6/providers/Providers'
      );

        const { registerMgtComponents } = await import(
          /* webpackChunkName: 'microsoft-graph-toolkit' */
          '@microsoft/mgt-components/dist/es6'
        );

        if (!Providers.globalProvider) {
            const { SharePointProvider } = await import(
                /* webpackChunkName: 'microsoft-graph-toolkit' */
                '@microsoft/mgt-sharepoint-provider/dist/es6'
            );

            Providers.globalProvider = new SharePointProvider(context);
        }
        registerMgtComponents();
    }
}