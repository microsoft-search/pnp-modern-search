import * as React from 'react';
import { Suspense } from 'react';
const TextDialog = React.lazy(() => import('../TextDialog/TextDialog'));
import { ICustomCollectionField } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react';
import * as strings from 'CommonStrings';

export interface ITemplateValueFieldEditorState {
}

export interface ITemplateValueFieldEditorProps {

    /**
     * The field mode to render
     */
    useHandlebarsExpr: boolean;

    /**
     * The current CollectionData item (i.e. row)
     */
    currentItem: any;

    /**
     * The current field on the row
     */
    field: ICustomCollectionField;

    /**
     * Handler when a field value is updated
     */
    onUpdate: (fieldId: string, value: any) => {};

    /**
     * The default value to display in the field
     */
    value: any;

    /**
     * The list of available item properties
     */
    availableProperties: IComboBoxOption[];
}

export class TemplateValueFieldEditor extends React.Component<ITemplateValueFieldEditorProps, ITemplateValueFieldEditorState> {

    public constructor(props: ITemplateValueFieldEditorProps) {
        super(props);
    }

    public render(): JSX.Element {

        let renderField: JSX.Element = null;

        if (this.props.useHandlebarsExpr) {
            let lang: any = "handlebars";
            renderField =   <Suspense fallback={""}>
                                <TextDialog
                                    language={lang}
                                    dialogTextFieldValue={this.props.value}
                                    onChanged={(fieldValue) => {
                                        this.props.onUpdate(this.props.field.id, fieldValue);
                                    }}
                                    strings={{
                                        cancelButtonText: strings.Controls.TextDialogCancelButtonText,
                                        dialogButtonText: strings.Controls.TextDialogButtonText ,
                                        dialogTitle: strings.Controls.TextDialogTitle,
                                        saveButtonText: strings.Controls.TextDialogSaveButtonText
                                    }}
                                />
                            </Suspense>;
        } else {

            renderField = <ComboBox
                text={ this.props.value }
                allowFreeform={false}
                autoComplete='on'                                
                onChange={(ev, option: IComboBoxOption) => {
                    this.props.onUpdate(this.props.field.id, option.key);
                }}
                useComboBoxAsMenuWidth={true}
                options={ this.props.availableProperties }
                placeholder={ strings.Controls.SelectItemComboPlaceHolder }
            />;
        }

        return renderField;
    }
}