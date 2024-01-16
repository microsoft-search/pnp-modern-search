import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { ITheme, Breadcrumb, IBreadcrumbItem } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface IBreadcrumbProps {
    /**
     * Path from which breadcrumb items are formed from. Ideally use the OriginalPath property of a SharePoint document, list item, folder, etc.
     */
    originalPath?: string;

    /**
     * The SharePoint site URL from which the path originates from. Used for creating links without need to struggle with all possible domain name variations.
     */
    spWebUrl?: string;

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

// This regular expression is used to validate SharePoint paths. The path must include sharepoint.com/sites/ or sharepoint.com/teams/.
// This method will not recognize OneDrive paths, as they are not compatible with this component.
// OneDrive paths are excluded because they are not user-friendly and thus, inappropriate for breadcrumb navigation.
// The usage of domain extensions such as *.mcas.ms, *.mcas-gov.us, or *.mcas-gov.ms does not impact this validation as they are not part of the OriginalPath property.
// It is recommended to use the OriginalPath property with this validation.
const SPO_REGEX = /https:\/\/.*\.sharepoint\.com\/(sites|teams)\//;

export class SpoPathBreadcrumb extends React.Component<IBreadcrumbProps, IBreadcrumbState> {

    static defaultProps = {
        includeSiteName: true,
        includeEntityName: true,
        breadcrumbItemsAsLinks: false,
        maxDisplayedItems: 3,
        overflowIndex: 0,
        fontSize: 12
    };
    
    public render() {
        const { originalPath, spWebUrl, includeSiteName, includeEntityName, breadcrumbItemsAsLinks, maxDisplayedItems, overflowIndex, fontSize, themeVariant } = this.props;

        const commonStyles = {
            fontSize: `${fontSize}px`,
            padding: '1px',
            selectors: {
                // If the entity name is not included in path then reset the formatting of last breadcrumb item.
                ...( !includeEntityName ? { '&:last-child': { fontWeight: 'unset !important', color: 'unset !important' } } : {} )
            },
        };

        const breadcrumbStyles = {
            root: {
                margin: '0',
            },
            item: { ...commonStyles },
            itemLink: { 
                ...commonStyles,
                selectors: {
                    '&:hover': { backgroundColor: 'unset' },
                    ...commonStyles.selectors
                },
            },
        };

        return (
            <>
            {originalPath !== undefined && spWebUrl !== undefined && this.validateFilePath(originalPath) &&
                <Breadcrumb
                    items={this.getBreadcrumbItems(spWebUrl, originalPath, includeSiteName, includeEntityName, breadcrumbItemsAsLinks)}
                    maxDisplayedItems={maxDisplayedItems}
                    overflowIndex={overflowIndex}
                    styles={breadcrumbStyles}
                    ariaLabel="Breadcrumb path"
                    overflowAriaLabel="More links"
                    theme={themeVariant as ITheme}
                />
            }
            </>
        )
    }

    private validateFilePath = (path: string): boolean => {
        return SPO_REGEX.test(path);
    }

    private getBreadcrumbItems = (spWebUrl: string, originalPath: string, includeSiteName: boolean, includeEntityName: boolean, breadcrumbItemsAsLinks: boolean): IBreadcrumbItem[] => {
        const frags = spWebUrl.split('/');
        const basePath = frags.slice(0, 4).join('/');
      
        const parts = originalPath.replace(basePath, '').split('/').filter(part => part);
        if (!includeSiteName) parts.shift();
        if (!includeEntityName) parts.pop();
      
        const breadcrumbItems: IBreadcrumbItem[] = parts.map((part, index) => {
            const item: IBreadcrumbItem = {
                text: part,
                key: `item${index + 1}`
            };

            if (breadcrumbItemsAsLinks) item.href = `${basePath}/${parts.slice(0, index + 1).join('/')}`
            
            return item;
        }); 
      
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
