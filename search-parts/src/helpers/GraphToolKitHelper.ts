import { WebPartContext } from '@microsoft/sp-webpart-base';

const DISAMBIGUATION = "pnp-modern-search";

export const loadMsGraphToolkit = async (context: WebPartContext) => {
    // Load Microsoft Graph Toolkit dynamically
    const { customElementHelper } = await import(
      /* webpackChunkName: 'microsoft-graph-toolkit' */
      '@microsoft/mgt-element/dist/es6/components/customElementHelper'
    );

    customElementHelper.withDisambiguation(DISAMBIGUATION);

    const component = window.customElements.get(`${customElementHelper.prefix}-person`);
    if (!component) {
        const { Providers } = await import(
          /* webpackChunkName: 'microsoft-graph-toolkit' */
          '@microsoft/mgt-element/dist/es6/providers/Providers'
        );

        const { registerMgtComponents } = await import(
          /* webpackChunkName: 'microsoft-graph-toolkit' */
          '@microsoft/mgt-components/dist/es6/registerMgtComponents'
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