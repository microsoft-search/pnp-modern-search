import * as React from 'react';
import { IRefinerGroupsDialogProps } from './IRefinerGroupsDialogProps';
import { IRefinerGroupsDialogState } from './IRefinerGroupsDialogState';
import { TextField } from 'office-ui-fabric-react';
import { FieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-controls-react/lib/FieldCollectionData';
import NoSuggestionTagPicker from './NoSuggestionTagPicker';
import { isEqual } from '@microsoft/sp-lodash-subset';
import styles from './RefinerGroupsDialog.module.scss';

export default class RefinerGroupsDialog extends React.Component<IRefinerGroupsDialogProps, IRefinerGroupsDialogState> {

	/*************************************************************************************
	 * Component's constructor
	 * @param props 
	 * @param state 
	 *************************************************************************************/
	constructor(props: IRefinerGroupsDialogProps, state: IRefinerGroupsDialogState) {
		super(props);
		this.state = {
			refinerGroupsValue: this.props.refinerGroupsValue
		};
	}

	public componentDidUpdate(): void {

		if (!isEqual(this.props.refinerGroupsValue, this.state.refinerGroupsValue)) {
			this.props.onChanged(this.state.refinerGroupsValue);
		}
	}

	public render() {
		return (
			<div className={styles.RefinerGroupsFieldCollectionData}>
				<FieldCollectionData
					key={"FieldCollectionData"}
					manageBtnLabel={this.props.strings.dialogButtonText}
					saveAndAddBtnLabel={this.props.strings.addAndSaveButtonText}
					saveBtnLabel={this.props.strings.saveButtonText}
					cancelBtnLabel={this.props.strings.cancelButtonText}
					disabled={this.props.disabled}
					onChanged={(value) => {
						// Remove the key property before setting the state as we don't need it
						this.setState({ refinerGroupsValue: value.map(({ advanced, fql, label }) => ({ advanced, fql, label })) });
					}}
					panelHeader={this.props.strings.panelHeader}
					enableSorting={true}
					itemsPerPage={10}

					fields={[
						{ id: "label", title: this.props.strings.groupLabel, type: CustomCollectionFieldType.string, required: true },
						{ id: "advanced", title: this.props.strings.advancedLabel, type: CustomCollectionFieldType.boolean, defaultValue: false, },
						{
							id: "fql",
							title: this.props.strings.valuesLabel,
							type: CustomCollectionFieldType.custom,
							onCustomRender: (field, value, onUpdate, item, itemId, onError) => {

								const valueChanged = (newValue: string) => {
									onError(field.id, !newValue ? field.title : "");
									onUpdate(field.id, newValue);
								};

								return (
									!item.advanced ?
										<NoSuggestionTagPicker key={itemId} value={value ?? ''} onChanged={valueChanged} />
										:
										<TextField key={itemId} multiline value={value} onChange={(_, newValue: string) => valueChanged(newValue)} placeholder={this.props.strings.advancedValuesPlaceholder} />
								);
							}
						}
					]}
					value={this.state.refinerGroupsValue}
				/>
			</div>
		);
	}
}
