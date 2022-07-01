import { IChoiceGroupOption } from "office-ui-fabric-react";

export interface IPropertyPaneTabsFieldProps {
    defaultSelectedKey: string;

    /**
     * Callback when the property is updated
     * @param propertyPath the updated property name
     * @param newValue the new values
     * @param changeCallback optionnal callback to notify SPFx something has changed add retrigger a render
     */
    onPropertyChange: (propertyPath: string, newValue: string, changeCallback?: (targetProperty?: string, newValue?: any) => void) => void;
    options: IChoiceGroupOption[];
}