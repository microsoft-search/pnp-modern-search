import { WebPartContext } from '@microsoft/sp-webpart-base';

export const loadMsGraphToolkit = async (context: WebPartContext) => {

    const component = window.customElements.get("mgt-mock-provider");
    if (!component) {
        // Load Microsoft Graph Toolkit dynamically
        try {
            const { Providers } = await import(
                /* webpackChunkName: 'microsoft-graph-toolkit' */
                '@microsoft/mgt-spfx'
            );
    
            if (!Providers.globalProvider) {
                const { SharePointProvider } = await import(
                    /* webpackChunkName: 'microsoft-graph-toolkit' */
                    '@microsoft/mgt-spfx'
                );
    
                Providers.globalProvider = new SharePointProvider(context);
            }
        } catch (error) {
            console.warn(error);
        }
    }
}