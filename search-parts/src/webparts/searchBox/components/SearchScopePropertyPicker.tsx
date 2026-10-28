import * as React from 'react';
import { ComboBox, IComboBoxOption } from '@fluentui/react';
import * as strings from 'CommonStrings';

export interface ISearchScopePropertyPickerProps {
    value?: string;
    properties: string[];
    onChange: (value: string) => void;
}

export default function SearchScopePropertyPicker(props: ISearchScopePropertyPickerProps): JSX.Element {
    const [filter, setFilter] = React.useState('');
    const options: IComboBoxOption[] = props.properties
        .filter(name => name.toLowerCase().includes(filter.toLowerCase()))
        .map(name => ({ key: name, text: name }));

    return <ComboBox
        ariaLabel={strings.AdvancedSearch.Property}
        placeholder={strings.AdvancedSearch.Property}
        text={props.value || ''}
        options={options}
        allowFreeform={false}
        autoComplete="on"
        useComboBoxAsMenuWidth
        onInputValueChange={value => setFilter(value)}
        onMenuDismissed={() => setFilter('')}
        onChange={(_, option) => {
            if (option) {
                props.onChange(option.text);
                setFilter('');
            }
        }}
    />;
}
