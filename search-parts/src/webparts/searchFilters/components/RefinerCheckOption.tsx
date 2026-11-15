import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import * as strings from 'SearchFiltersWebPartStrings';

export function renderRefinerCheckOption(
    option: IComboBoxOption,
    defaultRender?: (option?: IComboBoxOption) => JSX.Element
): JSX.Element {
    const verified = option.data === 'verified';
    const failed = option.data === 'failed';
    const label = verified
        ? strings.PropertyPane.DataFilterCollection.RefinerCheckVerified
        : failed
            ? strings.PropertyPane.DataFilterCollection.RefinerCheckFailed
            : strings.PropertyPane.DataFilterCollection.RefinerCheckUnknown;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {defaultRender(option)}
            <span title={label} role="img" aria-label={label}>
                <Icon iconName={verified ? 'CheckMark' : failed ? 'ErrorBadge' : 'Info'}
                    styles={{ root: { color: verified ? '#107c10' : failed ? '#a4262c' : undefined } }} />
            </span>
        </span>
    );
}
