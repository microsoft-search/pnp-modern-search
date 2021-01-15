import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { IGroup, IGroupDividerProps, Icon, Text, GroupedList } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import styles from './CollapsibleContentComponent.module.scss';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import 'core-js/features/dom-collections';
import * as DOMPurify from 'dompurify';

export interface ICollapsibleContentComponentProps {

    /**
     * The collapsible groupe name
     */
    groupName?: string;

    /**
     * If the group should be collapsed by default
     */
    defaultCollapsed?: boolean;

    /**
     * The item CSS class to use to generate items. If not provided, 'item' template will be rendered in a single block
     */
    itemClass: string;

    /**
     * Content of the items template
     */
    itemsTemplateContent: string;

    /**
     * Content of the footer template
     */
    footerTemplateContent: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;
}

export interface ICollapsibleContentComponentState {

    /**
     * Current collapse/expand state for the group
     */
    isCollapsed: boolean;

    /**
     * Current items in the group
     */
    items: JSX.Element[];
}

export class CollapsibleContentComponent extends React.Component<ICollapsibleContentComponentProps, ICollapsibleContentComponentState> {

    private componentRef = React.createRef<HTMLDivElement>();
    private _domPurify: any;

    public constructor(props) {
        super(props);

        this.state = {
            items: [],
            isCollapsed: props.defaultCollapsed ? true : false,
        };

        this._onRenderCell = this._onRenderCell.bind(this);
        this._onRenderHeader = this._onRenderHeader.bind(this);

        this._domPurify = DOMPurify.default;
    }

    public componentDidMount() {
        this._initItems(this.props);
    }
    
    public render() {

        const groups: IGroup[] = [
            {
                key: this.props.groupName,
                name: this.props.groupName,
                count: this.state.items.length === 0 ? 1: this.state.items.length, // The count should be at least 1 to show the header
                startIndex: 0,
                isShowingAll:  true, 
                hasMoreData: false,               
                isCollapsed: this.state.isCollapsed,
            }
        ];

        let items = cloneDeep(this.state.items); 

        const groupedList = <GroupedList
                                items={items}
                                styles={{
                                    root: {
                                        selectors: {
                                            '.ms-List-cell': {
                                                minHeight: 0
                                            }
                                        }
                                    }
                                }}
                                onRenderCell={this._onRenderCell}
                                className={styles.collapsible__filterPanel__body__group}     
                                onShouldVirtualize={() => false}
                                listProps={ { onShouldVirtualize: () => false } }           
                                groupProps={
                                    {  
                                        onRenderHeader: this._onRenderHeader,
                                        onRenderFooter: ((props) => {

                                            if (!props.group.isCollapsed) {
                                                return <div dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(this.props.footerTemplateContent)}}></div>;
                                            } else {
                                                return null;
                                            }                                        
                                        }).bind(this),
                                    }
                                }
                                groups={groups} 
                            />;

        return <div ref={this.componentRef} data-is-scrollable={true}> {groupedList}</div>;
    }
    
    /**
     * Initializes items in for goups in the GroupedList
     * @param refinementResults the refinements results
     */
    private _initItems(props: ICollapsibleContentComponentProps): void {

        let items: JSX.Element[] = [];

        if (props.itemsTemplateContent) {

            const htmlObject = document.createElement('div');
            htmlObject.innerHTML = props.itemsTemplateContent;
            
            if (props.itemClass) {

                htmlObject.querySelectorAll(`.${props.itemClass}`).forEach((node, key) => {
                    items.push(<div dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(node.outerHTML) }} data-id={`${key}`}></div>);
                });

            } else {
                items.push(<div dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(htmlObject.outerHTML) }} data-id={'0'}></div>);
            }
        }   

        this.setState({
            items: items
        });
    }
  
    private _onRenderHeader(props: IGroupDividerProps): JSX.Element {

        return (
            <div className={styles.collapsible__filterPanel__body__group__header}
            onClick={() => {

                this.setState({
                    isCollapsed: !props.group.isCollapsed
                });

                props.onToggleCollapse(props.group);
            }}>
            <Text variant={'large'}>{props.group.name}</Text>
            <div className={styles.collapsible__filterPanel__body__headerIcon}>
              {props.group.isCollapsed ?
                <Icon iconName='ChevronDown' />
                :
                <Icon iconName='ChevronUp' />
              }
            </div>
          </div>
        );
    }

    private _onRenderCell(nestingDepth: number, item: any, itemIndex: number) {
        return (
            <div data-selection-index={itemIndex}>
                {item}
            </div>
        );
    }
}

export class CollapsibleContentWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {

        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(this.innerHTML, 'text/html');

        // Get the templates
        const contentTemplate = htmlContent.getElementById('collapsible-content');
        const footerTemplate = htmlContent.getElementById('collapsible-footer');
        
        let itemsTemplateContent = null;
        let itemClass = null;
        let footerTemplateContent = null;

        if (contentTemplate) {
            itemsTemplateContent = contentTemplate.innerHTML;
            itemClass = contentTemplate.getAttribute('item-class');
        }
        
        if (footerTemplate) {
            footerTemplateContent = footerTemplate.innerHTML;
        }

        let props = this.resolveAttributes();
        const collapsibleContent = <CollapsibleContentComponent {...props} itemsTemplateContent={itemsTemplateContent} footerTemplateContent={footerTemplateContent} itemClass={itemClass}/>;
        ReactDOM.render(collapsibleContent, this);
    }    
}