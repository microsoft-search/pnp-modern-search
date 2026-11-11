import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Icon, TooltipHost, DirectionalHint } from '@fluentui/react';

const WARNING_COLOR = '#d83b01';

export interface IWarningMarkerProps {

    /**
     * The warning text displayed in the tooltip and announced to screen readers
     */
    tooltip?: string;
}

/**
 * Small circled "Info" marker displayed next to a filter name to signal a warning
 * (ex: the refiner values limit has been reached). The warning text is shown in a tooltip.
 */
export class WarningMarker extends React.Component<IWarningMarkerProps> {

    public render() {
        const { tooltip } = this.props;

        return (
            // The text is shown by the Fluent tooltip and exposed to assistive technologies through
            // aria-label. No native `title` attribute: it would show a second browser tooltip on hover.
            <TooltipHost content={tooltip} directionalHint={DirectionalHint.bottomCenter}>
                <button
                    type='button'
                    aria-label={tooltip}
                    style={{
                        // The Fluent "Info" glyph is already circled: render the bare icon,
                        // without any extra border, so it reads as a regular inline icon.
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        border: 'none',
                        color: WARNING_COLOR,
                        background: 'transparent',
                        cursor: 'help'
                    }}
                    onClick={(e) => {
                        // The marker can be rendered inside a clickable header (ex: collapsible filter).
                        // Clicking it should only show the tooltip, not trigger the header action.
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Icon iconName='Info' styles={{ root: { color: WARNING_COLOR, fontSize: 14, lineHeight: 1 } }} />
                </button>
            </TooltipHost>
        );
    }
}

export class WarningMarkerWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {
        const props = this.resolveAttributes();

        // Keep the marker inline next to the text it follows, without relying on template CSS.
        this.style.display = 'inline-flex';
        this.style.verticalAlign = 'middle';
        this.style.marginLeft = '6px';

        ReactDOM.render(<WarningMarker {...props} />, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}
