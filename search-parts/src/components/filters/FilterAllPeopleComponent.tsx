import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { IconButton } from '@fluentui/react/lib/Button';
import { ITheme, getTheme } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface IFilterAllPeopleProps {
    instanceId?: string;
    filterName?: string;
    showLimitWarning?: boolean;
    limitWarningText?: string;
    themeVariant?: IReadonlyTheme;
    onLoadMore?: () => void;
}

export class FilterAllPeopleComponent extends React.Component<IFilterAllPeopleProps> {

    private readonly onLoadMoreClick = (): void => {
        this.props.onLoadMore?.();
    }

    public render(): JSX.Element {
        if (!this.props.showLimitWarning) {
            return null;
        }

        const buttonTitle = this.props.limitWarningText || 'Refiner value limit reached';

        return (
            <div style={{ marginBottom: 8 }}>
                <IconButton
                    iconProps={{ iconName: 'Add' }}
                    title={buttonTitle}
                    ariaLabel={buttonTitle}
                    theme={(this.props.themeVariant as ITheme) || getTheme()}
                    onClick={this.onLoadMoreClick}
                />
            </div>
        );
    }
}

export class FilterAllPeopleWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback(): void {
        const props = this.resolveAttributes();
        ReactDOM.render(
            <FilterAllPeopleComponent
                {...props}
                onLoadMore={() => {
                    this.dispatchEvent(new CustomEvent('pnp-modern-search:all-people-load-more', {
                        detail: {
                            instanceId: props.instanceId,
                            filterName: props.filterName
                        },
                        bubbles: true,
                        cancelable: true
                    }));
                }}
            />,
            this
        );
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}
