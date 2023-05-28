import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import styles from './ItemSelectionComponent.module.scss';
import { Check } from 'office-ui-fabric-react';

export interface IItemSelectionComponentProps {

    /**
     * The current index of item. Needed for the the SelectionZone to lookup the correct item im the collection.
     */
    index?: string;

    /**
     * Flag indicating if the item is selected or not
     */
    isSelected?: boolean;

    /**
     * If selection is enabled or not. Needed to determine if the component should allow selection or not
     */
    enabled?: boolean;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;
}

export class ItemSelectionWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        const props: IItemSelectionComponentProps = this.resolveAttributes();

        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(this.innerHTML, 'text/html');
        const contentTemplate = htmlContent.getElementById('content');

        const renderTemplateContent = <div style={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: contentTemplate.innerHTML }}></div>;
        let renderItemSelection = renderTemplateContent;

        if (props.enabled) {

            renderItemSelection = <div
                className={`${styles.root} ${props.isSelected ? styles.selected : null}`}
                data-is-focusable
                data-selection-index={props.index}>

                <div className={`item-selection ${styles.itemRow}`} data-selection-toggle>
                    <div className="item-selection-checkbox" data-is-focusable data-selection-toggle>
                        <Check checked={props.isSelected} />
                    </div>
                    {renderTemplateContent}
                </div>

            </div>;
        }
        ReactDOM.render(renderItemSelection, this);
        if (props.isSelected) {
            this.scrollIntoView();
        }
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}