import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IPropertyPaneCustomFieldProps, IPropertyPaneField, PropertyPaneFieldType } from '@microsoft/sp-property-pane';

const ExportColumnsEditor = React.lazy(() => import(
    /* webpackChunkName: 'pnp-modern-search-export-columns-editor' */
    './ExportColumnsEditor'
));

export class PropertyPaneExportColumns implements IPropertyPaneField<IPropertyPaneCustomFieldProps> {
    public readonly type = PropertyPaneFieldType.Custom;
    public readonly targetProperty = 'layoutProperties.exportColumnsEditor';
    public readonly properties: IPropertyPaneCustomFieldProps;

    public constructor(getValue: () => string, selectedProperties: string[], onSave: (value: string) => void) {
        this.properties = {
            key: this.targetProperty,
            onRender: (element, _context, changeCallback) => {
                ReactDom.render(
                    React.createElement(React.Suspense, { fallback: null },
                        React.createElement(ExportColumnsEditor, {
                            getValue,
                            selectedProperties,
                            onSave: value => {
                                if (!changeCallback) {
                                    throw new Error('The export columns property-pane change callback is unavailable.');
                                }
                                onSave(value);
                                changeCallback('layoutProperties.exportColumns', value);
                            }
                        })
                    ), element
                );
            },
            onDispose: element => { ReactDom.unmountComponentAtNode(element); }
        };
    }
}
