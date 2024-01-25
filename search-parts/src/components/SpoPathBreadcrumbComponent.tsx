import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { ITheme, Breadcrumb, IBreadcrumbItem } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface IBreadcrumbProps {
    /**
     * Path from which breadcrumb items are formed from. Ideally use the path property of a SharePoint document, list item, folder, etc.
     */
    path?: string;

    /**
     * The SharePoint site URL from which the entity path originates from.
     */
    siteUrl?: string;

    /**
     * The SharePoint web URL from which the entity path originates from.
     */
    webUrl?: string;

    /**
     * Determines whether the site name should be included in the breadcrumb items.
     */
    includeSiteName?: boolean;

    /**
     * Determines whether the entity name should be included in the breadcrumb items.
     */
    includeEntityName?: boolean;

    /**
     * Determines whether the breadcrumb items should be clickable links to the path they represent.
     */
    breadcrumbItemsAsLinks?: boolean;

    /**
     * The maximum number of breadcrumb items to display before coalescing. If not specified, all breadcrumbs will be rendered.
     */
    maxDisplayedItems?: number;

    /**
     * Index where overflow items will be collapsed.
     */
    overflowIndex?: number;

    /**
     * Font size of breadcrumb items.
     */
    fontSize?: number;

    /**
     * The current theme settings.
     */
    themeVariant?: IReadonlyTheme;
}

export interface IBreadcrumbState { }

export class SpoPathBreadcrumb extends React.Component<IBreadcrumbProps, IBreadcrumbState> {

    static defaultProps = {
        includeSiteName: true,
        includeEntityName: true,
        breadcrumbItemsAsLinks: true,
        maxDisplayedItems: 3,
        overflowIndex: 0,
        fontSize: 12
    };
    
    public render() {
        const { path, siteUrl, webUrl, includeSiteName, includeEntityName, breadcrumbItemsAsLinks, maxDisplayedItems, overflowIndex, fontSize, themeVariant } = this.props;

        const commonStyles = {
            fontSize: `${fontSize}px`,
            padding: '1px',
            selectors: {
                // If the entity name is not included in path then reset the formatting of last breadcrumb item.
                ...( !includeEntityName ? { '&:last-child': { fontWeight: 'unset !important', color: 'unset !important' } } : {} )
            },
        };

        const breadcrumbStyles = {
            root: { margin: '0' },
            item: { ...commonStyles },
            itemLink: { 
                ...commonStyles,
                selectors: {
                    '&:hover': { backgroundColor: 'unset', textDecoration: 'underline'},
                    ...commonStyles.selectors
                },
            },
        };

        const breadcrumbItems = this.validateEntityPath(path, siteUrl, webUrl) ? this.getBreadcrumbItems(path, siteUrl, webUrl, includeSiteName, includeEntityName, breadcrumbItemsAsLinks) : undefined;

        return (
            <>
            {breadcrumbItems !== undefined &&
                <Breadcrumb
                    items={breadcrumbItems}
                    maxDisplayedItems={maxDisplayedItems}
                    overflowIndex={breadcrumbItems.length <= overflowIndex ? 0 : overflowIndex}
                    styles={breadcrumbStyles}
                    ariaLabel="Breadcrumb path"
                    overflowAriaLabel="More links"
                    theme={themeVariant as ITheme}
                />
            }
            </>
        )
    }

    private validateEntityPath = (path: string, siteUrl: string, webUrl: string): boolean => {
        return path !== undefined && path !== null 
               && siteUrl !== undefined && siteUrl !== null
               && webUrl !== undefined && webUrl !== null;
    }

    private getBreadcrumbItems = (path: string, siteUrl: string, webUrl: string, includeSiteName: boolean, includeEntityName: boolean, breadcrumbItemsAsLinks: boolean): IBreadcrumbItem[] => {    
        // Example:
        // webUrl: https://contoso.sharepoint.com/sites/sitename/subsite
        // path: https://contoso.sharepoint.com/sites/sitename/subsite/Shared Documents/Document.docx

        const frags = webUrl.split('/');
        // frags: ["https:", "", "contoso.sharepoint.com", "sites", "sitename", "subsite"]

        const isRootSite = siteUrl.split('/').length === 3;
        // Root site only contains parts: ["https:", "", "contoso.sharepoint.com"]

        const basePath = isRootSite ? frags.slice(0, 3).join('/') : frags.slice(0, 4).join('/');
        // basePath: https://contoso.sharepoint.com/sites
        // Root site base path: https://contoso.sharepoint.com

        // If includeSiteName is true, then only remove the base path from the original path. In example first items of path are "sitename", "subsite"
        // If includeSiteName is false, then remove the whole webUrl from the original path. In example first item of path is "Shared Documents"
        const replacePath = includeSiteName ? basePath : webUrl;
        const parts = path.replace(replacePath, '').split('/').filter(part => part);

        // If includeEntityName is false, then remove the last part of the path. In example remove Document.doxc. Last part is a title of the entity for which the breadcrumb path is generated
        if (!includeEntityName) parts.pop();
      
        const breadcrumbItems: IBreadcrumbItem[] = parts.map((part, index) => {
            const item: IBreadcrumbItem = {
                text: part,
                key: `item${index + 1}`
            };

            // If breadcrumbItemsAsLinks is true, then add the href property to the breadcrumb item
            if (breadcrumbItemsAsLinks) {
                const relativePath = parts.slice(0, index + 1).join('/');

                // If includeSiteName is true, then the href is the base path + the current path part because parts contain the site name and possible subsite(s)
                // If includeSiteName is false, then the href is the webUrl + the current path part because parts do not contain the site name and possible subsite(s)
                item.href = includeSiteName ? `${basePath}/${relativePath}` : `${webUrl}/${relativePath}`;
            }
            
            return item;
        });

        // If entity is located on the root site, then add the root site as first breadcrumb item if includeSiteName is true
        if (isRootSite && includeSiteName) breadcrumbItems.unshift({ text: 'Home', key: 'home', href: siteUrl });
      
        return breadcrumbItems;
    }
}

export class SpoPathBreadcrumbWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {
        let props = this.resolveAttributes();
        const spoPathBreadcrumb = <div style={{ display: 'flex' }}><SpoPathBreadcrumb {...props} /></div>;
        ReactDOM.render(spoPathBreadcrumb, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}
