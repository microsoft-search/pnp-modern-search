import { IChoiceGroupOption } from '@fluentui/react';

export interface IChoiceGroupTabsProps {
    defaultSelectedKey: string;
    onChange(selectedKey: string): void;
    options: IChoiceGroupOption[];
}