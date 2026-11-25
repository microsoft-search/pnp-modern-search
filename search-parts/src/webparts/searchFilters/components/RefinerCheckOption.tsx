import { IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import * as strings from 'SearchFiltersWebPartStrings';
import { renderCheckOption } from '../../../controls/PropertyPaneAsyncCombo/components/CheckOption';

export function renderRefinerCheckOption(
    option: IComboBoxOption,
    defaultRender?: (option?: IComboBoxOption) => JSX.Element
): JSX.Element {
    return renderCheckOption(option, {
        verified: strings.PropertyPane.DataFilterCollection.RefinerCheckVerified,
        failed: strings.PropertyPane.DataFilterCollection.RefinerCheckFailed,
        unknown: strings.PropertyPane.DataFilterCollection.RefinerCheckUnknown,
        notRefinable: strings.PropertyPane.DataFilterCollection.RefinerCheckNotRefinable
    }, defaultRender);
}
