import * as React from 'react';
import { Checkbox, DefaultButton, DetailsList, Dialog, DialogFooter, IColumn, MessageBar, MessageBarType, PrimaryButton, SelectionMode, TextField } from '@fluentui/react';
import * as strings from 'CommonStrings';
import { validateExportColumnsJson } from '../../helpers/CsvExportHelper';

export interface IExportColumnsEditorProps {
    getValue: () => string;
    selectedProperties: string[];
    onSave: (value: string) => void;
}

interface IExportColumnRow {
    managedProperty: string;
    csvHeader: string;
    selected: boolean;
}

export default function ExportColumnsEditor(props: IExportColumnsEditorProps): JSX.Element {
    const [isOpen, setIsOpen] = React.useState(false);
    const [rows, setRows] = React.useState<IExportColumnRow[]>([]);
    const [parseError, setParseError] = React.useState('');
    const labels = strings.Layouts.DetailsList;

    const open = (): void => {
        const value = props.getValue();
        const error = value.trim() ? validateExportColumnsJson(value) : '';
        const mapping: Record<string, string> = value.trim() && !error ? JSON.parse(value) : {};
        // Keep configured columns first so opening and saving does not reorder existing exports.
        const fields = Array.from(new Set([...Object.keys(mapping), ...props.selectedProperties]));
        setRows(fields.map(managedProperty => ({
            managedProperty,
            csvHeader: Object.prototype.hasOwnProperty.call(mapping, managedProperty) ? mapping[managedProperty] : managedProperty,
            selected: Object.prototype.hasOwnProperty.call(mapping, managedProperty)
        })));
        setParseError(error ? labels.ExportColumnsEditorInvalidJson : '');
        setIsOpen(true);
    };

    const updateRow = (managedProperty: string, change: Partial<IExportColumnRow>): void => {
        setRows(current => current.map(row => row.managedProperty === managedProperty ? { ...row, ...change } : row));
    };
    const json = JSON.stringify(Object.fromEntries(rows.filter(row => row.selected).map(row => [row.managedProperty, row.csvHeader])), null, 2);
    const error = parseError || validateExportColumnsJson(json, props.selectedProperties);
    const unavailableFields = rows.filter(row => !props.selectedProperties.includes(row.managedProperty)).map(row => row.managedProperty);
    const columns: IColumn[] = [
        {
            key: 'selected', name: labels.ExportColumnSelectedLabel, minWidth: 65, maxWidth: 85,
            onRender: (row: IExportColumnRow) => <Checkbox checked={row.selected}
                ariaLabel={`${labels.ExportColumnSelectedLabel}: ${row.managedProperty}`}
                onChange={(_event, checked) => updateRow(row.managedProperty, { selected: !!checked })} />
        },
        {
            key: 'managedProperty', name: labels.ExportManagedPropertyLabel, fieldName: 'managedProperty',
            minWidth: 180, isResizable: true, isMultiline: true
        },
        {
            key: 'csvHeader', name: labels.DisplayNameColumnLabel, minWidth: 200, isResizable: true,
            onRender: (row: IExportColumnRow) => <TextField value={row.csvHeader}
                ariaLabel={`${labels.DisplayNameColumnLabel}: ${row.managedProperty}`}
                onChange={(_event, value) => updateRow(row.managedProperty, { csvHeader: value ?? '' })} />
        }
    ];

    return <>
        <DefaultButton text={labels.EditExportColumnsButtonLabel} onClick={open} />
        <Dialog hidden={!isOpen} onDismiss={() => setIsOpen(false)}
            minWidth={0} maxWidth={960}
            dialogContentProps={{
                title: labels.EditExportColumnsButtonLabel,
                subText: labels.ExportColumnsEditorDescription,
                showCloseButton: true
            }}
            modalProps={{ isBlocking: true, styles: { main: { width: 'calc(100vw - 32px)', maxHeight: '90vh' } } }}>
            {unavailableFields.length > 0 && <MessageBar messageBarType={MessageBarType.warning}>
                {labels.ExportColumnsMissingPropertiesError.replace('{0}', unavailableFields.join(', '))}
            </MessageBar>}
            {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
            <div style={{ maxHeight: '55vh', overflow: 'auto' }}>
                <DetailsList items={rows} columns={columns} selectionMode={SelectionMode.none}
                    getKey={(row: IExportColumnRow) => row.managedProperty} />
            </div>
            <DialogFooter>
                <PrimaryButton text={strings.Controls.TextDialogSaveButtonText} disabled={!!error}
                    onClick={() => { props.onSave(json); setIsOpen(false); }} />
                <DefaultButton text={strings.Controls.TextDialogCancelButtonText} onClick={() => setIsOpen(false)} />
            </DialogFooter>
        </Dialog>
    </>;
}
