import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Icon, TooltipHost, DirectionalHint, getId } from '@fluentui/react';

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

    private readonly descriptionId: string = getId('pnp-warning');

    public render() {
        const { tooltip } = this.props;

        return (
            <>
                <TooltipHost content={tooltip} directionalHint={DirectionalHint.bottomCenter}>
                    <button
                        type='button'
                        title={tooltip}
                        aria-label={tooltip}
                        aria-describedby={this.descriptionId}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            padding: 0,
                            border: `1px solid ${WARNING_COLOR}`,
                            borderRadius: '50%',
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
                        <Icon iconName='Info' styles={{ root: { color: WARNING_COLOR, fontSize: 12 } }} />
                    </button>
                </TooltipHost>
                <span
                    id={this.descriptionId}
                    style={{
                        border: 0,
                        clip: 'rect(0 0 0 0)',
                        height: 1,
                        margin: -1,
                        overflow: 'hidden',
                        padding: 0,
                        position: 'absolute',
                        width: 1,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {tooltip}
                </span>
            </>
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
