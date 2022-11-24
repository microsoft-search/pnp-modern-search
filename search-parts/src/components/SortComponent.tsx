import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent, SortFieldDirection, ISortInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import { Dropdown, IDropdownOption, IconButton } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { ISortFieldConfiguration } from '../models/search/ISortFieldConfiguration';
import * as strings from 'CommonStrings';

export interface ISortComponentProps {

    /**
     * The sortable fields
     */
    fields?: ISortFieldConfiguration[];

    /**
     * The default selected field
     */
    defaultSelectedField?: string;

    /**
     * The default sort direction
     */
    defaultDirection?: SortFieldDirection;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Callback handler when a sort field and direction are selected
     */
    onSort: (sortFieldName: string, sortFieldDirection: SortFieldDirection) => void;
}

export interface ISortComponentState {

    /**
     * The current selected field name in the dropdown list
     */
    selectedFieldName: string;
}

export class SortComponent extends React.Component<ISortComponentProps, ISortComponentState> {

    public constructor(props: ISortComponentProps) {
        super(props);

        this.state = {
            selectedFieldName: props.defaultSelectedField
        };
    }

    public render() {

        const options = this._buildOptions();
        let renderSortButton: JSX.Element = null;
        const dropdownStyles = {
            dropdown: {
                minWidth: 200,
                textAlign: "left"
            },
        };

        if (this.props.defaultSelectedField && this.props.defaultDirection || this.state.selectedFieldName) {

            renderSortButton = <IconButton
                iconProps={{
                    iconName: this.props.defaultDirection === SortFieldDirection.Ascending ? "SortUp" : "SortDown"
                }}
                onClick={() => {
                    const sortDirection = this.props.defaultDirection === SortFieldDirection.Ascending ? SortFieldDirection.Descending : SortFieldDirection.Ascending;
                    this.props.onSort(this.state.selectedFieldName, sortDirection);
                }}
            >
            </IconButton>;
        }

        return <div style={{ display: 'flex' }}>
            <Dropdown
                placeholder={strings.Controls.SortByPlaceholderText}
                styles={dropdownStyles}
                defaultSelectedKey={this.props.defaultSelectedField ? this.props.defaultSelectedField : null}
                options={options}
                onChange={(ev, option: IDropdownOption, index: number) => {
                    this.setState({
                        selectedFieldName: option.key as string
                    }, () => {
                        this.props.onSort(option.key as string, this.props.defaultDirection);
                    });
                }}
            />
            {renderSortButton}
        </div>;
    }

    /**
     * Build the list of available options (i.e fields) for sorting
     * To not interfer with the default data source sort order, which can be different from source to source, we don't set a default value if no field is selected
     * Data sources are responsible to interpret de current sort field and direction and translate them to their own query language syntax.
     */
    private _buildOptions(): IDropdownOption[] {

        let options: IDropdownOption[] = [];

        const defaultOptions: IDropdownOption[] = [{
            key: null,
            text: `<${strings.Controls.SortByDefaultOptionText}>`
        }];

        // Get only fields identified as "userSort"
        options = this.props.fields.filter(field => field.isUserSort).map(field => {
            return {
                key: field.sortField,
                text: field.sortFieldDisplayName ? field.sortFieldDisplayName : field.sortField
            };
        });

        return defaultOptions.concat(options);
    }
}

export class SortWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();

        const fields: ISortFieldConfiguration[] = props.fields;

        // Don't show the control if no user sort fields are specified
        if (fields && fields.some(field => field.isUserSort)) {
            const sortComponent = <SortComponent
                fields={fields}
                defaultSelectedField={props.defaultSelectedField}
                defaultDirection={props.defaultDirection}
                onSort={(sortFieldName, sortFieldDirection) => {

                    // Send the event to the main Web Part
                    this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_SORT_BY, {
                        detail: {
                            sortFieldName: sortFieldName,
                            sortFieldDirection: sortFieldDirection
                        } as ISortInfo,
                        bubbles: true,
                        cancelable: true
                    }));
                }}
            />;

            ReactDOM.render(sortComponent, this);
        }
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}