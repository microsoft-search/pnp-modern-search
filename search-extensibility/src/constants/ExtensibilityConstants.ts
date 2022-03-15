export class ExtensibilityConstants {
    /**
     * Event name to use when a filter value is selected or unselected
     */
    public static readonly EVENT_FILTER_UPDATED = 'filterUpdated';

    /**
     * Event name to use when all filter values are applied at once
     */
    public static readonly EVENT_FILTER_APPLY_ALL = 'filterApplyAll';

    /**
     * Event name to use when all filter values are cleared at once
     */
    public static readonly EVENT_FILTER_CLEAR_ALL = 'filterClearAll';

    /**
     * Event name to use when the operator between filter values changes
     */
    public static readonly EVENT_FILTER_VALUE_OPERATOR_UPDATED = 'filterOperatorUpdated';

    /**
     * Event name to use when a sort field an direction are applied
     */
    public static readonly EVENT_SORT_BY = 'sortBy';
}