import * as React from 'react';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { FocusZone, FocusZoneDirection } from '@fluentui/react/lib/FocusZone';
import { List } from '@fluentui/react/lib/List';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { TextField } from '@fluentui/react/lib/TextField';
import { getId } from '@fluentui/react/lib/Utilities';
import * as strings from 'CommonStrings';

const SUGGESTION_MENU_WIDTH = 320;
const OPTION_HEIGHT = 36;

export interface IIconNamePickerProps {
    options: IComboBoxOption[];
    value: string;
    placeholder: string;
    ariaLabel: string;
    label?: string;
    description?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}

export async function loadIconNameOptions(): Promise<IComboBoxOption[]> {
    const [{ initializeIcons }, { default: iconNames }] = await Promise.all([
        import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@fluentui/font-icons-mdl2'
        ),
        import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@fluentui/font-icons-mdl2/lib/data/AllIconNames.json'
        )
    ]);
    initializeIcons();
    return iconNames
        .filter(icon => typeof icon.name === 'string')
        .map(icon => ({ key: icon.name, text: icon.name }))
        .sort((a, b) => a.text.localeCompare(b.text));
}

const IconNamePicker: React.FC<IIconNamePickerProps> = ({ options, value, placeholder, ariaLabel, label, description, disabled, onChange }) => {
    const [draft, setDraft] = React.useState(value);
    const [query, setQuery] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const target = React.useRef<HTMLDivElement>(null);
    const popupId = React.useRef(getId('pnp-icon-picker-')).current;
    React.useEffect(() => setDraft(value), [value]);

    const searchText = query.trim().toLowerCase();
    const visibleOptions = React.useMemo(() => options
        .filter(option => !searchText || option.text.toLowerCase().includes(searchText)), [options, searchText]);

    const commit = (iconName: string): void => {
        setDraft(iconName);
        if (iconName !== value) {
            onChange(iconName);
        }
    };

    const open = (): void => {
        setQuery('');
        setIsOpen(true);
    };

    return (
        <div ref={target} onKeyDownCapture={event => {
            if (event.key === 'Escape') {
                setDraft(value);
                if (isOpen) {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen(false);
                }
            }
        }}>
            <TextField
                role="combobox"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={isOpen ? popupId : undefined}
                ariaLabel={ariaLabel}
                label={label}
                description={description}
                disabled={disabled}
                onRenderInput={(inputProps, render) => render({ ...inputProps, 'aria-labelledby': undefined })}
                value={draft}
                placeholder={placeholder}
                onChange={(_event, text) => setDraft(text || '')}
                onBlur={() => commit(draft)}
                onKeyDown={event => {
                    if (event.key === 'ArrowDown' && event.altKey) {
                        event.preventDefault();
                        open();
                    } else if (event.key === 'Enter') {
                        event.preventDefault();
                        commit(draft);
                    }
                }}
                onRenderSuffix={() => (
                    <IconButton
                        ariaLabel={ariaLabel}
                        disabled={disabled}
                        aria-haspopup="dialog"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? popupId : undefined}
                        iconProps={{ iconName: 'ChevronDown' }}
                        onClick={() => isOpen ? setIsOpen(false) : open()}
                        styles={{ root: { height: 30, width: 24 } }}
                    />
                )}
                styles={{ suffix: { padding: 0 } }}
            />
            {isOpen && (
                <Callout
                    id={popupId}
                    role="dialog"
                    ariaLabel={ariaLabel}
                    target={target}
                    directionalHint={DirectionalHint.bottomLeftEdge}
                    isBeakVisible={false}
                    calloutWidth={SUGGESTION_MENU_WIDTH}
                    calloutMaxWidth={480}
                    setInitialFocus={true}
                    onDismiss={() => setIsOpen(false)}
                >
                    <div style={{ padding: 8 }}>
                        <SearchBox
                            ariaLabel={strings.Filters.SearchPlaceholder}
                            placeholder={strings.Filters.SearchPlaceholder}
                            value={query}
                            onChange={(_event, text) => setQuery(text || '')}
                            onKeyDown={event => {
                                if (event.key === 'ArrowDown') {
                                    event.preventDefault();
                                    event.currentTarget.closest('[role="dialog"]')
                                        ?.querySelector<HTMLButtonElement>('[role="option"]')?.focus();
                                }
                            }}
                        />
                    </div>
                    <div key={searchText} data-is-scrollable={true} style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {visibleOptions.length ? (
                            <FocusZone direction={FocusZoneDirection.vertical}>
                                <List
                                    role="listbox"
                                    aria-label={ariaLabel}
                                    items={visibleOptions}
                                    getItemCountForPage={() => 20}
                                    getPageHeight={index => OPTION_HEIGHT * Math.min(20, visibleOptions.length - index)}
                                    onRenderCell={(option: IComboBoxOption, index) => (
                                        <DefaultButton
                                            role="option"
                                            aria-selected={option.key === value}
                                            aria-posinset={index + 1}
                                            aria-setsize={visibleOptions.length}
                                            text={option.text}
                                            iconProps={{ iconName: String(option.key) }}
                                            onClick={() => {
                                                commit(String(option.key));
                                                setIsOpen(false);
                                            }}
                                            styles={{
                                                root: {
                                                    height: OPTION_HEIGHT,
                                                    width: '100%',
                                                    border: 'none',
                                                    justifyContent: 'flex-start',
                                                    background: 'transparent'
                                                },
                                                label: { fontWeight: 'normal' },
                                                icon: { fontSize: 16, width: 20 }
                                            }}
                                        />
                                    )}
                                />
                            </FocusZone>
                        ) : (
                            <div role="status" style={{ padding: 12 }}>
                                {strings.General.TagPickerStrings.NoResultsSearchMessage}
                            </div>
                        )}
                    </div>
                </Callout>
            )}
        </div>
    );
};

export default IconNamePicker;
