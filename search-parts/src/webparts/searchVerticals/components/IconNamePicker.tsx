import * as React from 'react';
import { ComboBox, IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import { Icon } from '@fluentui/react/lib/Icon';

const MAX_VISIBLE_SUGGESTIONS = 100;
const SUGGESTION_MENU_WIDTH = 320;

export interface IIconNamePickerProps {
    options: IComboBoxOption[];
    value: string;
    placeholder: string;
    ariaLabel: string;
    onChange: (value: string) => void;
}

const IconNamePicker: React.FC<IIconNamePickerProps> = ({ options, value, placeholder, ariaLabel, onChange }) => {
    const [query, setQuery] = React.useState(value);
    React.useEffect(() => setQuery(value), [value]);

    const searchText = query.trim().toLowerCase();
    const visibleOptions = options
        .filter(option => !searchText || option.text.toLowerCase().includes(searchText))
        .slice(0, MAX_VISIBLE_SUGGESTIONS);

    return (
        <div onKeyDownCapture={event => {
            if (event.key === 'Escape') {
                setQuery(value);
            }
        }}>
            <ComboBox
                allowFreeform={true}
                autoComplete="on"
                ariaLabel={ariaLabel}
                options={visibleOptions}
                selectedKey={value || null}
                text={value}
                placeholder={placeholder}
                dropdownWidth={SUGGESTION_MENU_WIDTH}
                dropdownMaxWidth={480}
                onChange={(_event, option, _index, inputValue) => {
                    const iconName = option ? String(option.key) : inputValue || '';
                    setQuery(iconName);
                    onChange(iconName);
                }}
                onInputValueChange={setQuery}
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
        </div>
    );
};

export default IconNamePicker;
