import * as React from 'react';
import { IRefinerGroupsDialogProps } from './IRefinerGroupsDialogProps';
import { IRefinerGroupsDialogState } from './IRefinerGroupsDialogState';
import { TextField } from 'office-ui-fabric-react';
import { FieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-controls-react/lib/FieldCollectionData';
import NoSuggestionTagPicker from './NoSuggestionTagPicker';
import { isEqual } from '@microsoft/sp-lodash-subset';

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
	/*************************************************************************************
	 * Called immediately after updating occurs
	 *************************************************************************************/
	public componentDidUpdate(): void {

		if (!isEqual(this.props.refinerGroupsValue, this.state.refinerGroupsValue)) {
			this.props.onChanged(this.state.refinerGroupsValue);
		}
	}

	public render() {
		return (

			<FieldCollectionData
				key={"FieldCollectionData"}
				manageBtnLabel={"Manage"}
				saveAndAddBtnLabel={"Save and Add"}
				disabled={this.props.disabled}
				onChanged={(value) => {
					// Remove the key property before setting the state as we don't need it
					this.setState({ refinerGroupsValue: value.map(({ advanced, fql, label, sortIdx }) => ({ advanced, fql, label, sortIdx })) });
				}}
				panelHeader={"Manage Groups"}
				enableSorting={true}
				itemsPerPage={10}
				fields={[
					{ id: "label", title: "Group Label", type: CustomCollectionFieldType.string, required: true },
					{ id: "advanced", title: "Advanced", type: CustomCollectionFieldType.boolean, defaultValue: false },
					{
						id: "fql",
						title: "Values",
						type: CustomCollectionFieldType.custom,
						onCustomRender: (field, value, onUpdate, item, itemId, onError) => {

							const valueChanged = (newValue: string) => {

								if (!newValue) {
									onError(field.id, field.title);
								} else {
									onError(field.id, "");
									onUpdate(field.id, newValue);
								}
							};

							return (
								!item.advanced ?
									<NoSuggestionTagPicker key={itemId} value={value ?? ''} onChanged={valueChanged} />
									:
									<TextField key={itemId} multiline value={value} onChange={(_, newValue: string) => valueChanged(newValue)} />
							);
						}
					}
				]}
				value={this.state.refinerGroupsValue}
			/>
		);
	}
}
