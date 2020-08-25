import { IRefinerConfiguration, ISearchContext, ITemplateContext } from '../..';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';

export interface IRefinerEditorProps {
    label: string;
    refiners: IRefinerConfiguration[];
    onChange: (refiners: IRefinerConfiguration[]) => Promise<boolean>;
    onAvailablePropertiesUpdated: (properties:IComboBoxOption[])=>void;
    searchService: ISearchContext;
    templateService: ITemplateContext;
    availableProperties: IComboBoxOption[];
}

export interface IRefinerEditorPropertyPaneProps extends IRefinerEditorProps {
    disabled?: boolean;    
}