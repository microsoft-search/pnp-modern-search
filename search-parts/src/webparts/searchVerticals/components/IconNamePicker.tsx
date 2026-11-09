import * as React from 'react';
import { ComboBox, IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import { Icon } from '@fluentui/react/lib/Icon';

const MAX_VISIBLE_SUGGESTIONS = 100;
const SUGGESTION_MENU_WIDTH = 320;

export interface IIconNamePickerProps {
    options: IComboBoxOption[];
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}

const IconNamePicker: React.FC<IIconNamePickerProps> = ({ options, value, placeholder, onChange }) => {
    const searchText = value.trim().toLowerCase();
    const filteredOptions = options
        .filter(option => !searchText || option.text.toLowerCase().includes(searchText))
        .slice(0, MAX_VISIBLE_SUGGESTIONS);
    const hasCurrentValue = value !== '' && !options.some(option => option.key === value);
    const visibleOptions = hasCurrentValue
        ? [{ key: value, text: value }, ...filteredOptions.slice(0, MAX_VISIBLE_SUGGESTIONS - 1)]
        : filteredOptions;

    return (
        <ComboBox
            allowFreeform={true}
            autoComplete="on"
            options={visibleOptions}
            selectedKey={value || null}
            text={value}
            placeholder={placeholder}
            dropdownWidth={SUGGESTION_MENU_WIDTH}
            dropdownMaxWidth={480}
            onChange={(_event, option, _index, inputValue) => {
                onChange(option ? String(option.key) : inputValue || '');
            }}
            onInputValueChange={inputValue => onChange(inputValue)}
            onRenderOption={option => (
                <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                    <Icon
                        aria-hidden={true}
                        iconName={String(option.key)}
                        styles={{ root: { fontSize: 16, width: 20 } }}
                    />
                    <span>{option.text}</span>
                </div>
            )}
        />
    );
};

export default IconNamePicker;
