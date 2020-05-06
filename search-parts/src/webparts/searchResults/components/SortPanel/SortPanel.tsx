import * as React from 'react';
import ISortPanelProps from './ISortPanelProps';
import ISortPanelState from './ISortPanelState';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import * as strings from 'SearchResultsWebPartStrings';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { SortDirection } from '@pnp/sp';
import styles from '../SearchResultsWebPart.module.scss';
import { ISortFieldDirection } from '../../../../models/ISortFieldConfiguration';

export default class SortPanel extends React.Component<ISortPanelProps, ISortPanelState> {

    public constructor(props) {
        super(props);

        this.state = {
            sortDirection: this.props.sortDirection ? this.props.sortDirection : SortDirection.Ascending,
            sortField: this.props.sortField ? this.props.sortField : null
        };

        this._setSortDirection = this._setSortDirection.bind(this);
        this._getDropdownOptions = this._getDropdownOptions.bind(this);
        this._onChangedSelectedField = this._onChangedSelectedField.bind(this);
    }

    public componentDidUpdate(prevProps){
        let sortDirection = this.state.sortDirection;
        if (this.props.sortDirection != prevProps.sortDirection){
            sortDirection = this.props.sortDirection;
        }
        let sortField = this.state.sortField;
        if (this.props.sortField != prevProps.sortField){
            sortField = this.props.sortField;
        }
        if (sortDirection != this.state.sortDirection || sortField != this.state.sortField){
            this.setState({
                sortDirection: sortDirection,
                sortField: sortField
            });
        }
    }

    public render(): React.ReactElement<ISortPanelProps> {
        if (this.props.sortableFieldsConfiguration.length === 0) return <span />;

        const dropdownOptions: IDropdownOption[] = this._getDropdownOptions();

        return (
            <div className={styles.searchWp__buttonBar__button}>
                <ActionButton
                    className={`${styles.searchWp__filterResultBtn} ms-fontWeight-semibold`}
                    iconProps={{
                        iconName: this.state.sortDirection === SortDirection.Ascending ? 'Ascending' : 'Descending'
                    }}
                    disabled={!this.state.sortField ? true : false}
                    title={this.state.sortDirection === SortDirection.Ascending ? strings.Sort.SortDirectionAscendingLabel : strings.Sort.SortDirectionDescendingLabel}
                    onClick={() => {
                        this._setSortDirection();
                    }}
                />
                <Dropdown
                    className={styles.searchWp__sortDropdown}
                    placeHolder={strings.Sort.SortPanelSortFieldPlaceHolder}
                    ariaLabel={strings.Sort.SortPanelSortFieldAria}
                    onChanged={this._onChangedSelectedField}
                    selectedKey={this.state.sortField}
                    options={dropdownOptions}
                />
            </div>
        );
    }

    private _setSortDirection() {

        let sortDirection = this.state.sortDirection;

        switch (this.state.sortDirection) {
            case SortDirection.Ascending:
                sortDirection = SortDirection.Descending;
                break;

            case SortDirection.Descending:
                sortDirection = SortDirection.Ascending;
                break;

            default:
                sortDirection = SortDirection.Ascending;
                break;
        }

        this.setState({
            sortDirection: sortDirection,
        });

        this.props.onUpdateSort(sortDirection, this.state.sortField);
    }

    private _getDropdownOptions(): IDropdownOption[] {

        let dropdownOptions: IDropdownOption[] = [];

        // add default option to avoid onFocus bug on DropDown control
        dropdownOptions.push({
            key: 'default-item',
            text: strings.Sort.SortPanelSortFieldPlaceHolder,
            ariaLabel: strings.Sort.SortPanelSortFieldAria,
            disabled: true,
            selected: true,
            hidden: true,
        });

        this.props.sortableFieldsConfiguration.map(e => {
            dropdownOptions.push({
                key: e.sortField,
                text: e.displayValue,
                data: {
                    sortDirection: e.sortField === this.state.sortField ? this.state.sortDirection : e.sortDirection
                }
            });
        });

        return dropdownOptions;
    }

    private _onChangedSelectedField(option: IDropdownOption): void {
        const sortField = option.key.toString();
        let sortDirection;
        if (option.data.sortDirection) {
            sortDirection = option.data.sortDirection === ISortFieldDirection.Ascending ? SortDirection.Ascending : SortDirection.Descending;
        } else {
            sortDirection = this.state.sortDirection;
        }
        this.setState({
            sortField: sortField,
            sortDirection: sortDirection
        });
        this.props.onUpdateSort(sortDirection, sortField);
    }
}
