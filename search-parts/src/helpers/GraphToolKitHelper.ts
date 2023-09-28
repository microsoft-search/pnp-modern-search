import { WebPartContext } from '@microsoft/sp-webpart-base';

export const loadMsGraphToolkit = async (context: WebPartContext) => {

    const component = window.customElements.get("mgt-mock-provider");
    if (!component) {
        // Load Microsoft Graph Toolkit dynamically
        const { Providers } = await import(
            /* webpackChunkName: 'microsoft-graph-toolkit' */
            '@microsoft/mgt-react/dist/es6'
        );

        if (!Providers.globalProvider) {
            const { SharePointProvider } = await import(
                /* webpackChunkName: 'microsoft-graph-toolkit' */
                '@microsoft/mgt-sharepoint-provider/dist/es6'
            );

            Providers.globalProvider = new SharePointProvider(context);
        }

    }
}