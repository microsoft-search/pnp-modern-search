import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import * as webPartStrings from 'SearchFiltersWebPartStrings';

export interface IMaxBucketsEditorProps {
    value?: number | string;
    defaultMaxBuckets?: number;
    disabled?: boolean;
    onUpdate: (value: number | undefined) => void;
}

export default function MaxBucketsEditor(props: IMaxBucketsEditorProps): JSX.Element {
    const strings = webPartStrings.PropertyPane.DataFilterCollection;
    const numValue = props.value ? parseInt(props.value.toString(), 10) : undefined;

    return <TextField
        type="number"
        ariaLabel={strings.FilterMaxBuckets}
        value={props.value ? props.value.toString() : ''}
        placeholder={!props.disabled && props.defaultMaxBuckets !== undefined ? props.defaultMaxBuckets.toString() : undefined}
        disabled={props.disabled}
        errorMessage={numValue && numValue > 1000 ? strings.FilterMaxBucketsWarning : ''}
        styles={{ root: { minWidth: 80 } }}
        onChange={(_, newValue) => {
            const parsedValue = newValue && newValue.trim() !== '' ? parseInt(newValue, 10) : undefined;
            props.onUpdate(parsedValue);
        }} />;
}
