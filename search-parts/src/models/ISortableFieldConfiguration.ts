import { ISortFieldDirection } from "./ISortFieldConfiguration";

interface ISortableFieldConfiguration {
    sortField: string;
    displayValue: string;
    sortDirection: ISortFieldDirection;
}

export default ISortableFieldConfiguration;
