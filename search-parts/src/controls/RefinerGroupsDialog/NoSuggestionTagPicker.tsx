import * as React from 'react';
import { TagPicker, ITag } from 'office-ui-fabric-react';

export interface INoSuggestionTagPickerProps {
	onChanged: (text: string) => void;		
	value: string;
}

export interface INoSuggestionTagPickerState {
	options: ITag[];
}


export default class NoSuggestionTagPicker extends React.Component<INoSuggestionTagPickerProps, INoSuggestionTagPickerState> {

	/*************************************************************************************
	 * Component's constructor
	 * @param props 
	 * @param state 
	 *************************************************************************************/
	constructor(props: INoSuggestionTagPickerProps, state: INoSuggestionTagPickerState) {
		super(props);
		this.state = {
			options: this.getDialogOptions()
		};
	}

	private getDialogOptions() {
		return this.props.value.split(',').filter((value, index, self) => {
			return self.indexOf(value) === index && value !== '';
		}).map(_ => { return { key: _, name: _, selected: true }; }) ?? [];
	}

	/*************************************************************************************
	 * Called immediately after updating occurs
	 *************************************************************************************/
	public componentDidUpdate(prevProps: INoSuggestionTagPickerProps, prevState: INoSuggestionTagPickerState): void {
		if (this.props.value !== prevProps.value) {
			this.setState({ options: this.getDialogOptions() ?? [] });
		}

		if (prevState.options !== this.state.options) {
			this.props.onChanged(this.state.options.map(_ => _.name).join(','));
		}
	}

	public componentDidMount(): void {
		if (this.state.options.length === 0) {
			this.props.onChanged('');
		}
	}

	private listContainsTagList = (tagKey: string, tagList?: ITag[]) => {
		if (!tagList || !tagList.length || tagList.length === 0) {
			return false;
		}
		return tagList.some(compareTag => compareTag.key === tagKey);
	}

	private filterSuggestedTags = (filterText: string, tagList: ITag[]): ITag[] => {
		return filterText && !this.listContainsTagList(filterText, tagList)
			? [{
				name: filterText,
				key: filterText
			}]
			: [];
	}

	public render() {
		return (
			<TagPicker onResolveSuggestions={this.filterSuggestedTags}
				selectedItems={this.state.options}
				onChange={(items) => {
					this.setState({ options: items });
				}}
			/>
		);
	}
}