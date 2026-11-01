import * as React from 'react';
import { DefaultButton, PrimaryButton, IconButton, Dialog, DialogFooter, TextField, Stack, Text } from '@fluentui/react';
import * as commonStrings from 'CommonStrings';
import * as webPartStrings from 'SearchFiltersWebPartStrings';
import { PeoplePickerDomainHelper } from '../../../helpers/PeoplePickerDomainHelper';

export interface IAllowedEmailDomainsEditorProps {
    value?: unknown;
    disabled?: boolean;
    onSave: (value: string) => void;
}

const splitEntries = (value: unknown): string[] =>
    typeof value === 'string' ? value.split(/[;,]/).map(entry => entry.trim()).filter(Boolean) : [];

const isValidEntry = (entry: string): boolean => PeoplePickerDomainHelper.parse(entry).valid;

export default function AllowedEmailDomainsEditor(props: IAllowedEmailDomainsEditorProps): JSX.Element {
    const strings = webPartStrings.PropertyPane.DataFilterCollection;
    const [open, setOpen] = React.useState(false);
    const [domains, setDomains] = React.useState<string[]>([]);
    const [newDomain, setNewDomain] = React.useState('');
    const [error, setError] = React.useState('');
    const savedCount = splitEntries(props.value).length;
    const hasInvalid = domains.some(domain => !isValidEntry(domain));

    const addDomains = (): void => {
        const parsed = PeoplePickerDomainHelper.parse(newDomain);
        if (!parsed.configured) {
            return;
        }
        if (!parsed.valid) {
            setError(strings.AllowedEmailDomainsInvalidEntry);
            return;
        }
        setDomains(Array.from(new Set([...domains, ...parsed.domains])));
        setNewDomain('');
        setError('');
    };

    const saveDomains = (): void => {
        const parsed = PeoplePickerDomainHelper.parse([...domains, newDomain].join('; '));
        if (!parsed.valid) {
            setError(strings.AllowedEmailDomainsInvalidEntry);
            return;
        }
        props.onSave(parsed.domains.join('; '));
        setOpen(false);
    };

    return <>
        <DefaultButton text={strings.AllowedEmailDomainsButton.replace('{0}', String(savedCount))}
            title={splitEntries(props.value).join('; ')}
            disabled={props.disabled}
            onClick={() => {
                const parsed = PeoplePickerDomainHelper.parse(props.value);
                setDomains(parsed.valid ? parsed.domains : splitEntries(props.value));
                setNewDomain('');
                setError('');
                setOpen(true);
            }} />
        <Dialog hidden={!open} onDismiss={() => setOpen(false)}
            dialogContentProps={{ title: strings.AllowedEmailDomains, subText: strings.AllowedEmailDomainsDialogDescription }}
            modalProps={{ isBlocking: true }}>
            <Stack tokens={{ childrenGap: 8 }}>
                {domains.length === 0 && <Text block>{strings.AllowedEmailDomainsEmpty}</Text>}
                {domains.map(domain => {
                    const valid = isValidEntry(domain);
                    return <Stack key={domain} horizontal verticalAlign="center" horizontalAlign="space-between">
                        <Text styles={{ root: { overflowWrap: 'anywhere', color: valid ? undefined : '#a4262c' } }}
                            title={valid ? undefined : strings.AllowedEmailDomainsInvalidEntry}>{domain}</Text>
                        <IconButton iconProps={{ iconName: 'Delete' }}
                            ariaLabel={strings.AllowedEmailDomainsRemove.replace('{0}', domain)}
                            title={strings.AllowedEmailDomainsRemove.replace('{0}', domain)}
                            onClick={() => setDomains(domains.filter(item => item !== domain))} />
                    </Stack>;
                })}
                <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 8 }}>
                    <Stack.Item grow>
                        <TextField label={strings.AllowedEmailDomainsNewDomain}
                            placeholder={strings.AllowedEmailDomainsPlaceholder}
                            value={newDomain}
                            errorMessage={error}
                            onChange={(_, value) => { setNewDomain(value || ''); setError(''); }}
                            onKeyDown={event => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    addDomains();
                                }
                            }} />
                    </Stack.Item>
                    <DefaultButton text={strings.AllowedEmailDomainsAdd} disabled={!newDomain.trim()} onClick={addDomains}
                        styles={{ root: { marginBottom: error ? 22 : 0 } }} />
                </Stack>
            </Stack>
            <DialogFooter>
                <PrimaryButton text={commonStrings.Controls.TextDialogSaveButtonText} disabled={hasInvalid}
                    onClick={saveDomains} />
                <DefaultButton text={commonStrings.Controls.TextDialogCancelButtonText} onClick={() => setOpen(false)} />
            </DialogFooter>
        </Dialog>
    </>;
}
