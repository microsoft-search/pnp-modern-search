import * as React from 'react';
import { Suspense } from 'react';
import * as strings from 'SearchEditComponentsLibraryStrings';
const TextDialog = React.lazy(() => import('../../controls/TextDialog/TextDialog'));
import { SearchManagedProperties } from '../../controls/SearchManagedProperties/SearchManagedProperties';
import { ITemplateValueFieldEditorProps } from 'search-extensibility';


export interface ITemplateValueFieldEditorState {
}

export class TemplateValueFieldEditor extends React.Component<ITemplateValueFieldEditorProps, ITemplateValueFieldEditorState> {

    public constructor(props: ITemplateValueFieldEditorProps) {
        super(props);
    }

    public render(): JSX.Element {

        let renderField: JSX.Element = null;
 
        if (this.props.useHandlebarsExpr) {
            let lang: any = "handlebars";
            renderField = <Suspense fallback={""}><TextDialog
                language={lang}
                dialogTextFieldValue={this.props.value}
                onChanged={(fieldValue) => {
                    this.props.onUpdate(this.props.field.id, fieldValue);
                }}
                strings={{
                    cancelButtonText: strings.RefinementEditor.CancelButtonLabel,
                    dialogButtonText: strings.RefinementEditor.EditHandlebarsExpressionLabel,
                    dialogTitle: strings.RefinementEditor.AddHandlebarsExpressionDialogLabel,
                    saveButtonText: strings.RefinementEditor.SaveButtonLabel
                }}
            /></Suspense>;
        } else {

            renderField = <SearchManagedProperties
                defaultSelectedKey={this.props.value}
                onUpdate={(newValue: string, isSortable?: boolean) => {

                    if (this.props.validateSortable) {
                        if (!isSortable) {
                            this.props.onCustomFieldValidation(this.props.field.id, strings.Sort.SortInvalidSortableFieldMessage);
                        } else {
                            this.props.onUpdate(this.props.field.id, newValue);
                            this.props.onCustomFieldValidation(this.props.field.id, '');
                        }
                    } else {
                        this.props.onUpdate(this.props.field.id, newValue);
                    }
                }}
                availableProperties={this.props.availableProperties}
                onUpdateAvailableProperties={this.props.onUpdateAvailableProperties}
                searchService={this.props.searchService}
                validateSortable={this.props.validateSortable}
            />;
        }

        return renderField;
    }
}