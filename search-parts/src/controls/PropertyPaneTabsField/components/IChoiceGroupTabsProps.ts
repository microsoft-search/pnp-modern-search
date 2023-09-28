import { IChoiceGroupOption } from "office-ui-fabric-react";

export interface IChoiceGroupTabsProps {
    defaultSelectedKey: string;
    onChange(selectedKey: string): void;
    options: IChoiceGroupOption[];
}