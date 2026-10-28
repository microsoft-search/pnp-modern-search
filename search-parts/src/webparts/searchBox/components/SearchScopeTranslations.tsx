import * as React from 'react';
import { DefaultButton, PrimaryButton, Dialog, DialogFooter, Dropdown, TextField, IDropdownOption, Stack, Text } from '@fluentui/react';
import * as strings from 'CommonStrings';
import { LocalizationHelper } from '../../../helpers/LocalizationHelper';
import { ISearchScope } from '../../../helpers/SearchScopeHelper';

export interface ISearchScopeTranslationsProps {
    labels?: ISearchScope['labels'];
    defaultLabel: string;
    uiLanguage: string;
    onSave: (labels: ISearchScope['labels']) => void;
}

export default function SearchScopeTranslations(props: ISearchScopeTranslationsProps): JSX.Element {
    const [open, setOpen] = React.useState(false);
    const [labels, setLabels] = React.useState<ISearchScope['labels']>({});
    const [language, setLanguage] = React.useState(props.uiLanguage.toLowerCase());
    const locales: string[] = Object.keys(LocalizationHelper.locales).map(key => LocalizationHelper.locales[key]);
    const languageCode = (locale: string): string => locales.find(item => item.toLowerCase() === locale.toLowerCase()) || locale;
    const savedLanguages = Object.keys(props.labels || {}).sort();
    const options: IDropdownOption[] = Array.from(new Set([...locales, props.uiLanguage, ...Object.keys(labels)].map(locale => locale.toLowerCase())))
        .filter(Boolean).sort().map(locale => ({
            key: locale,
            text: labels[locale] ? `${languageCode(locale)}: ${labels[locale]}` : languageCode(locale)
        }));

    return <>
        <Stack tokens={{ childrenGap: 4 }}>
        <DefaultButton text={strings.AdvancedSearch.Translations}
            onClick={() => {
                const draft: ISearchScope['labels'] = {};
                Object.keys(props.labels || {}).forEach(locale => { draft[locale.toLowerCase()] = props.labels[locale]; });
                setLabels(draft);
                setLanguage(props.uiLanguage.toLowerCase());
                setOpen(true);
            }} />
        <Text block>{`${strings.AdvancedSearch.Language}: ${savedLanguages.length ? savedLanguages.map(languageCode).join(', ') : '\u2014'}`}</Text>
        </Stack>
        <Dialog hidden={!open} onDismiss={() => setOpen(false)}
            dialogContentProps={{ title: strings.AdvancedSearch.Translations }}
            modalProps={{ isBlocking: true }}>
            <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="mediumPlus" block>{props.defaultLabel}</Text>
            {Object.keys(labels).sort().map(locale =>
                <DefaultButton key={locale} text={`${languageCode(locale)}: ${labels[locale]}`}
                    checked={language === locale}
                    onClick={() => setLanguage(locale)}
                    styles={{ root: { height: 'auto', minHeight: 32 }, label: { whiteSpace: 'normal', overflowWrap: 'anywhere', textAlign: 'left' } }} />
            )}
            <Dropdown label={strings.AdvancedSearch.Language} options={options} selectedKey={language}
                onChange={(_, option) => setLanguage(String(option.key))} />
            <TextField label={strings.AdvancedSearch.Label} value={labels[language] || ''}
                placeholder={props.defaultLabel}
                onChange={(_, value) => {
                    const next = { ...labels };
                    if (value.trim()) {
                        next[language] = value;
                    } else {
                        delete next[language];
                    }
                    setLabels(next);
                }} />
            </Stack>
            <DialogFooter>
                <PrimaryButton text={strings.Controls.TextDialogSaveButtonText}
                    onClick={() => { props.onSave(labels); setOpen(false); }} />
                <DefaultButton text={strings.Controls.TextDialogCancelButtonText} onClick={() => setOpen(false)} />
            </DialogFooter>
        </Dialog>
    </>;
}
