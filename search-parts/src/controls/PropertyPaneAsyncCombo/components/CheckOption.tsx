import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { IComboBoxOption } from '@fluentui/react/lib/ComboBox';

export function renderCheckOption(
    option: IComboBoxOption,
    labels: { verified: string; failed: string; unknown: string; notSortable?: string; notRefinable?: string },
    defaultRender?: (option?: IComboBoxOption) => JSX.Element
): JSX.Element {
    const verified = option.data === 'verified';
    const failed = option.data === 'failed';
    const notSortable = option.data === 'notSortable';
    const notRefinable = option.data === 'notRefinable';
    const blocked = notSortable || notRefinable;
    const label = verified ? labels.verified : notSortable ? labels.notSortable ?? labels.failed
        : notRefinable ? labels.notRefinable ?? labels.failed : failed ? labels.failed : labels.unknown;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {defaultRender ? defaultRender(option) : option.text}
            <span title={label} role="img" aria-label={label}>
                <Icon iconName={verified ? 'CheckMark' : blocked ? 'Blocked' : failed ? 'ErrorBadge' : 'Info'}
                    styles={{ root: { color: verified ? '#107c10' : failed || blocked ? '#a4262c' : undefined } }} />
            </span>
        </span>
    );
}
