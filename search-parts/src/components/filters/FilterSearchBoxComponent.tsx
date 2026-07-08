import * as React from "react";
import { BaseWebComponent, ExtensibilityConstants, IDataFilterInfo, IDataFilterInternal, IDataFilterValueInfo, IDataFilterValueInternal } from "@pnp/modern-search-extensibility";
import * as ReactDOM from "react-dom";
import { IconButton, ITag, ITagPickerProps, TagPicker, Text, ITheme, Spinner, SpinnerSize } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { sortBy } from "@microsoft/sp-lodash-subset";
import styles from './FilterSearchBoxComponent.module.scss';
import * as commonStrings from 'CommonStrings';
import { TaxonomyHelper } from '../../helpers/TaxonomyHelper';

type FilterSearchBoxEventCallback = (filterName: string, filterValue: IDataFilterValueInfo) => void;

export interface IFilterSearchBoxProps {

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * The current filter information
     */
    filter?: IDataFilterInternal;

    /**
     * Callback handlers for search
     */
    onFilterValueUpdated: FilterSearchBoxEventCallback;
}

export interface IFilterSearchBoxState {
    availableValues: ITag[];
    selectedValues: ITag[];
    selectedSignature: string;
    isSelectionInProgress: boolean;
}

export class FilterSearchBox extends React.Component<IFilterSearchBoxProps, IFilterSearchBoxState> {
    private selectionFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
    private static readonly SELECTION_FEEDBACK_MAX_DURATION_MS = 10000;
    private static readonly SELECTION_FEEDBACK_POST_UPDATE_MS = 800;
    private static readonly GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';

    public constructor(props: IFilterSearchBoxProps) {
        super(props);

        const availableValues = this.mapFilterValuesToTags(props.filter?.values || []);
        const selectedValues = this.getSelectedTagsFromValues(props.filter?.values || [], availableValues);

        this.state = {
            availableValues,
            selectedValues,
            selectedSignature: this.getSelectedSignature(props.filter?.values || []),
            isSelectionInProgress: false
        };
    }

    public componentDidMount(): void {
        this.restoreSelectionFeedback();
    }

    public componentWillUnmount(): void {
        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
            this.selectionFeedbackTimer = null;
        }
    }

    private readonly getSelectionFeedbackStorageKey = (): string => {
        const instanceId = `${this.props.instanceId ?? ''}`;
        const filterName = `${this.props.filter?.filterName ?? ''}`;
        return `pnp-modern-search:filter-feedback:${instanceId}:${filterName}`;
    }

    private readonly readSelectionFeedbackTimestamp = (): number => {
        try {
            const value = globalThis.sessionStorage.getItem(this.getSelectionFeedbackStorageKey());
            const timestamp = Number(value);
            return Number.isFinite(timestamp) ? timestamp : 0;
        } catch {
            return 0;
        }
    }

    private readonly writeSelectionFeedbackTimestamp = (timestamp: number): void => {
        try {
            globalThis.sessionStorage.setItem(this.getSelectionFeedbackStorageKey(), `${timestamp}`);
        } catch {
            // Ignore storage errors (e.g. blocked in private mode)
        }
    }

    private readonly clearSelectionFeedbackTimestamp = (): void => {
        try {
            globalThis.sessionStorage.removeItem(this.getSelectionFeedbackStorageKey());
        } catch {
            // Ignore storage errors
        }
    }

    private readonly restoreSelectionFeedback = (): void => {
        const startedAt = this.readSelectionFeedbackTimestamp();
        if (!startedAt) {
            return;
        }

        const elapsed = Date.now() - startedAt;
        const remainingMs = FilterSearchBox.SELECTION_FEEDBACK_MAX_DURATION_MS - elapsed;

        if (remainingMs <= 0) {
            this.clearSelectionFeedbackTimestamp();
            return;
        }

        this.setState({ isSelectionInProgress: true });

        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
        }

        this.selectionFeedbackTimer = setTimeout(() => {
            this.selectionFeedbackTimer = null;
            this.clearSelectionFeedbackTimestamp();
            this.setState({ isSelectionInProgress: false });
        }, remainingMs);
    }

    private readonly beginSelectionFeedback = (): void => {
        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
        }

        this.writeSelectionFeedbackTimestamp(Date.now());
        this.setState({ isSelectionInProgress: true });

        this.selectionFeedbackTimer = setTimeout(() => {
            this.selectionFeedbackTimer = null;
            this.clearSelectionFeedbackTimestamp();
            this.setState({ isSelectionInProgress: false });
        }, FilterSearchBox.SELECTION_FEEDBACK_MAX_DURATION_MS);
    }

    private readonly setImmediateProgressCursor = (): void => {
        if (!globalThis.document) {
            return;
        }

        if (globalThis.document.documentElement) {
            globalThis.document.documentElement.style.setProperty('cursor', 'progress', 'important');
        }

        if (globalThis.document.body) {
            globalThis.document.body.style.setProperty('cursor', 'progress', 'important');
        }

        const styleId = FilterSearchBox.GLOBAL_BUSY_CURSOR_STYLE_ID;
        if (!globalThis.document.getElementById(styleId)) {
            const styleElement = globalThis.document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = '* { cursor: progress !important; }';
            globalThis.document.head.appendChild(styleElement);
        }
    }

    private readonly getTextColor = (): string => {
        if (this.props.themeVariant?.isInverted) {
            return this.props.themeVariant?.semanticColors?.bodyText ?? '#323130';
        }

        return this.props.themeVariant?.semanticColors?.inputText ?? '#323130';
    }

    private readonly onRenderSelectedItem = (props: { item: ITag; index: number }): JSX.Element => {
        const itemName = this.getDisplayName(`${props.item.name ?? ''}`);

        return <li
            className={styles.tagItem}
            style={{
                border: this.props.themeVariant?.isInverted ? '1px solid #fff' : 'inherit'
            }}
            data-selection-index={props.index}
            data-is-focusable="true"
        >
            <Text
                className={styles.tagItemText}
                aria-label={props.item.name}
            >
                {itemName}
            </Text>
            <IconButton
                className={styles.tagRemoveBtn}
                iconProps={{ iconName: 'Cancel' }}
                styles={{ root: { height: '26px' } }}
                onClick={() => {
                    this.setImmediateProgressCursor();
                    this.beginSelectionFeedback();
                    const filterValue: IDataFilterValueInfo = {
                        name: `${props.item.name ?? ''}`,
                        value: `${props.item.key ?? ''}`,
                        selected: false
                    };

                    this.props.onFilterValueUpdated(this.props.filter.filterName, filterValue);
                }}
            />
        </li>;
    }

    private readonly onRenderSuggestionItem = (itemProps: ITag): JSX.Element => {
        return <span>{this.getDisplayName(itemProps.name)}</span>;
    }

    public componentDidUpdate(prevProps: IFilterSearchBoxProps): void {
        const prevValues = prevProps.filter?.values || [];
        const currentValues = this.props.filter?.values || [];
        const prevSignature = this.getSelectedSignature(prevValues);
        const currentSignature = this.getSelectedSignature(currentValues);

        if (prevSignature !== currentSignature || prevValues.length !== currentValues.length) {
            const availableValues = this.mapFilterValuesToTags(currentValues);
            const selectedValues = this.getSelectedTagsFromValues(currentValues, availableValues);

            this.setState({
                availableValues,
                selectedValues,
                selectedSignature: currentSignature
            });

            if (this.state.isSelectionInProgress) {
                if (this.selectionFeedbackTimer !== null) {
                    clearTimeout(this.selectionFeedbackTimer);
                }

                this.selectionFeedbackTimer = setTimeout(() => {
                    this.selectionFeedbackTimer = null;
                    this.clearSelectionFeedbackTimestamp();
                    this.setState({ isSelectionInProgress: false });
                }, FilterSearchBox.SELECTION_FEEDBACK_POST_UPDATE_MS);
            }
        }
    }

    private readonly getSelectedSignature = (values: IDataFilterValueInternal[]): string => {
        return values
            .filter(value => value?.selected && value?.value)
            .map(value => `${value.value}`)
            .sort((left, right) => left.localeCompare(right))
            .join('|');
    }

    private readonly mapFilterValuesToTags = (values: IDataFilterValueInternal[]): ITag[] => {
        return values.map(filterValue => {
            return {
                key: `${filterValue?.value ?? ''}`,
                name: this.getDisplayName(filterValue?.name ?? filterValue?.value)
            };
        });
    }

    private readonly getSelectedTagsFromValues = (values: IDataFilterValueInternal[], availableValues: ITag[]): ITag[] => {
        const selectedValueSet = new Set(values.filter(value => value?.selected).map(value => `${value?.value ?? ''}`));
        return availableValues.filter(tag => selectedValueSet.has(`${tag.key}`));
    }

    private readonly isPeopleTemplate = (): boolean => {
        return (this.props.filter as any)?.selectedTemplate === 'PeopleTemplate';
    }

    private readonly getDisplayName = (rawName: string): string => {
        if (!this.isPeopleTemplate()) {
            return `${rawName ?? ''}`;
        }

        const extractReadableLabel = (value: string): string => {
            const cleanedValue = TaxonomyHelper.normalizeReadableLabelCandidate(value);
            if (!cleanedValue) {
                return '';
            }

            const claimsLabel = TaxonomyHelper.extractClaimsLabel(cleanedValue);
            if (claimsLabel) {
                return claimsLabel;
            }

            if (TaxonomyHelper.isReadablePlainLabel(cleanedValue)) {
                return cleanedValue;
            }

            const personLikeLabel = TaxonomyHelper.extractPersonLikeLabel(cleanedValue);
            if (personLikeLabel) {
                return personLikeLabel;
            }

            const emailLikeLabel = TaxonomyHelper.extractEmailLikeLabel(cleanedValue);
            if (emailLikeLabel) {
                return emailLikeLabel;
            }

            const firstReadablePipeSegment = TaxonomyHelper.extractFirstReadablePipeSegment(cleanedValue);
            if (firstReadablePipeSegment) {
                return firstReadablePipeSegment;
            }

            return '';
        };

        const readableRawName = extractReadableLabel(rawName);
        if (readableRawName) {
            return readableRawName;
        }

        const decodedName = TaxonomyHelper.decodeHexString(`${rawName ?? ''}`);
        const readableDecodedName = extractReadableLabel(decodedName);
        if (readableDecodedName) {
            return readableDecodedName;
        }

        return `${rawName ?? ''}`;
    }

    public render() {

        const textColor = this.getTextColor();

        const availableValues = this.state.availableValues;
        const selectedValues = this.state.selectedValues;

        let pickerProps: ITagPickerProps = {
            removeButtonAriaLabel: "Remove",
            itemLimit: availableValues.length,
            inputProps: {
                placeholder: selectedValues.length === 0 ? commonStrings.General.TagPickerStrings.SearchPlaceholder : '',
            },
            styles: {
                text: {
                    borderColor: '#c2c2c2',
                    borderLeft: 0,
                    borderRight: 0,
                    borderTop: 0
                },
                input: {
                    backgroundColor: 'transparent',
                    color: textColor,
                    selectors: {
                        '::placeholder': {
                            color: textColor
                        },
                        '::-ms-input-placeholder': {
                            color: textColor
                        }
                    }
                }
            },
            selectedItems: sortBy(selectedValues, 'name'), // Sort items alphabetically by their label every time. Otherwise, when submitting multiple filters, the order could change unexpectedly
            onResolveSuggestions: (filter: string, selectedItems?: ITag[]) => {

                const foundValues = availableValues.filter(s => `${s.name ?? ''}`.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));

                // Make sure the matching values are not already selected
                return foundValues.filter(foundValue => {
                    return !selectedValues.some(selectedValue => selectedValue.key === foundValue.key);
                });
            },
            pickerSuggestionsProps: {
                noResultsFoundText: commonStrings.General.TagPickerStrings.NoResultsSearchMessage
            },
            onChange: (selectedTagItems: ITag[]) => {
                this.setImmediateProgressCursor();
                this.beginSelectionFeedback();
                const nextSelectedTagItems = selectedTagItems || [];
                this.setState({ selectedValues: nextSelectedTagItems });

                // Determine the removed item according to current selected tags
                const removedItems = (this.props.filter?.values || []).filter((selectedValue: IDataFilterValueInternal) => {
                    return selectedValue.selected && !nextSelectedTagItems.some(tag => `${tag.key}` === `${selectedValue.value}`);
                });

                if (removedItems.length > 0) {

                    const filterValue: IDataFilterValueInfo = {
                        name: removedItems[0].name,
                        value: removedItems[0].value,
                        selected: false
                    };

                    this.props.onFilterValueUpdated(this.props.filter.filterName, filterValue);
                }
            },
            onRenderItem: this.onRenderSelectedItem,
            onRenderSuggestionsItem: this.onRenderSuggestionItem,
            resolveDelay: 200,
            onItemSelected: (selectedItem: ITag) => {
                this.setImmediateProgressCursor();
                this.beginSelectionFeedback();
                this.setState(prevState => {
                    const alreadySelected = prevState.selectedValues.some(item => `${item.key}` === `${selectedItem.key}`);
                    if (alreadySelected) {
                        return null;
                    }

                    return {
                        selectedValues: [...prevState.selectedValues, selectedItem]
                    };
                });

                // Find the filter value 
                const filterValue: IDataFilterValueInfo = {
                    name: `${selectedItem.name ?? ''}`,
                    value: `${selectedItem.key ?? ''}`,
                    selected: true
                };

                this.props.onFilterValueUpdated(this.props.filter.filterName, filterValue);
                return selectedItem;
            },
            disabled: availableValues.length === 0
        };

        if (this.props.themeVariant) {
            pickerProps.theme = this.props.themeVariant as ITheme;
        }

        return <div>
            {this.state.isSelectionInProgress && (
                <div style={{
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: '#605e5c'
                }}>
                    <Spinner size={SpinnerSize.xSmall} />
                    <span>Updating selection...</span>
                </div>
            )}
            <TagPicker {...pickerProps} />
        </div>;
    }
}

export class FilterSearchBoxWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();
        const renderFilterSearchBox = <FilterSearchBox {...props}
            onFilterValueUpdated={(filterName: string, filterValue: IDataFilterValueInfo) => {
                // Bubble event through the DOM
                const detail: IDataFilterInfo = {
                    filterName: filterName,
                    filterValues: [filterValue],
                    instanceId: props.instanceId
                };
                this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                    detail,
                    bubbles: true,
                    cancelable: true
                }));
            }}
        />;
        ReactDOM.render(renderFilterSearchBox, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}