import { IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import schema from '../dataSources/tenant-managed-properties.json';

const refinableProperties = new Set(
    Object.entries(schema.properties)
        .filter(([, flags]) => flags.refine)
        .map(([name]) => name.toLowerCase())
);

const sortableProperties = new Set(
    Object.entries(schema.properties)
        .filter(([, flags]) => flags.sort)
        .map(([name]) => name.toLowerCase())
);

export function checkRefinerSchemaOptions(options: IComboBoxOption[]): IComboBoxOption[] {
    return options
        .filter(option => !option.disabled && refinableProperties.has(String(option.key).toLowerCase()))
        .map(option => ({ ...option, data: 'verified' }));
}

export function checkSortSchemaOptions(options: IComboBoxOption[]): IComboBoxOption[] {
    return options
        .filter(option => !option.disabled && sortableProperties.has(String(option.key).toLowerCase()))
        .map(option => ({ ...option, data: 'verified' }));
}
