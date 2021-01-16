import * as React from 'react';
import { ComboBox, IComboBoxOption, IComboBoxProps, IComboBox, SelectableOptionMenuItemType, Label } from 'office-ui-fabric-react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { isEqual, isEmpty } from '@microsoft/sp-lodash-subset';
import update from 'immutability-helper';
import { IAsyncComboProps } from "./IAsyncComboProps";
import { IAsyncComboState } from "./IAsyncComboState";
import styles from './AsyncCombo.module.scss';

const LOADING_KEY = 'LOADING_ITEM';

export class AsyncCombo extends React.Component<IAsyncComboProps, IAsyncComboState> {

    private comboRef = React.createRef<IComboBox>();

    /**
     * Flag to avoid options asynchronous fetch overlap
     */
    private searchInProgress: boolean;

    public constructor(props: IAsyncComboProps) {
        super(props);

        this.state = {
            selectedOptionKeys: [],
            options: [],
            textDisplayValue: null,
        };

        this.getOptions = this.getOptions.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onChangeMulti = this.onChangeMulti.bind(this);
        this.onRenderOption = this.onRenderOption.bind(this);

        this.searchInProgress = false;
    }

    public render() {

        let comboProps: IComboBoxProps = {
            componentRef: this.comboRef,
            text: this.state.textDisplayValue,                 
            label: this.props.label,
            allowFreeform: this.props.allowFreeform ? this.props.allowFreeform : false,
            autoComplete:'on',
            disabled: this.props.disabled,
            styles: {
                input: {
                    backgroundColor: 'inherit'
                }
            },
            useComboBoxAsMenuWidth: true,                
            options: this.state.options,
            placeholder: this.props.placeholder, 
            onRenderOption: this.onRenderOption,
        };

        if (!this.props.allowMultiSelect) {

            comboProps.onChange = this.onChange;

            if (this.props.searchAsYouType && !this.props.onGetErrorMessage) {
                comboProps.onPendingValueChanged = async (option?: IComboBoxOption, index?: number, value?: string) => {

                    // Get options dynamically as user is typing
                    if (value && !this.searchInProgress) {

                        this.searchInProgress = true;

                        setTimeout( async () => {

                            // Open the combo box menu
                            this.comboRef.current.focus(true);

                            this.setState({
                                options: update(this.state.options, {$set: []})
                            });

                            await this.getOptions(value);
                            this.searchInProgress = false;
                        }, 1000);
                    }
                };

                comboProps.buttonIconProps = {
                    iconName: 'Search'
                };

                comboProps.caretDownButtonStyles = {
                    root: {
                        pointerEvents: 'none' // Disable button
                    }
                };
                
            } else {
                comboProps.onMenuOpen = this.getOptions;
            }
        } else {

            comboProps.onChange = this.onChangeMulti;
            comboProps.selectedKey = this.state.selectedOptionKeys;
            comboProps.multiSelect = true;
            comboProps.onMenuOpen = this.getOptions;
        }

        if (this.props.onGetErrorMessage && !this.props.searchAsYouType) {

            comboProps.onPendingValueChanged = (option?: IComboBoxOption, index?: number, value?: string) => {
                
                // If an option is selected, we assume this is already a correct value
                if (option) {
                    this.setState({
                        errorMessage: null
                    });
                } else {
                    setTimeout(() => {
                        if (value !== undefined) {
                            const errorMessage = this.props.onGetErrorMessage(value);
                            if (errorMessage !== '') {
                                this.setState({
                                    errorMessage: errorMessage,
                                });
                            } else {
                                this.setState({
                                    errorMessage: null
                                });
                            }
                        }
                    }, 300);
                }                    
            };
        }

        return  <div className={styles.asyncCombo}>
                    <ComboBox {...comboProps}/>
                    {this.props.description ? 
                        <Label styles={
                            {
                                root: {
                                    fontSize: 11,
                                    color:"#666666"
                                }
                            }
                        }>{this.props.description}</Label>
                        : null
                    }
                    { this.state.errorMessage ? 
                        <Label className={styles.errorMessage}>{this.state.errorMessage}</Label>: null
                    }                    
                </div>;
    }

    public componentDidMount() {
        
        this.setState({
            selectedOptionKeys: this.props.defaultSelectedKeys ? this.props.defaultSelectedKeys : [],
            options: this.props.availableOptions ? this.props.availableOptions : [],
            textDisplayValue: this.getTextDisplayValue()
        });
    }

    public componentDidUpdate(prevProps: IAsyncComboProps, prevState: IAsyncComboState) {

        if (this.props.availableOptions && !isEqual(this.props.availableOptions, prevProps.availableOptions) 
            || !isEqual(this.props.stateKey, prevProps.stateKey)) {

            this.setState({
                options: this.props.availableOptions.map(x => ({...x})),
                textDisplayValue: this.getTextDisplayValue()
            });
        }
    }

    public async onChange(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) {

        if (option) {

            this.setState({
                textDisplayValue: option.text,
            });

            this.props.onUpdate(option);
            
        } else {
                if (value !== undefined && !this.state.errorMessage) {

                this.setState({
                    textDisplayValue: value,
                    errorMessage: null
                });

                if (!this.props.searchAsYouType) {

                    // Case where the user starts to enter manual values without opening the dropdown values so the options are no fetched yet
                    if (this.props.availableOptions.length === 0) {
                        await this.getOptions();
                    }

                    const newOption: IComboBoxOption = { key: value, text: value };
                    let options = update(this.state.options, {$push: [newOption] });

                    options = this.sortOptions(options);

                    this.props.onUpdate(newOption);

                    if (this.props.onUpdateOptions) {
                        this.props.onUpdateOptions(options);
                    }

                    this.setState({
                        options: options.map(x => ({...x}))
                    });
                }
            } else {
                this.setState({
                    textDisplayValue: '',
                    errorMessage: null
                });
            }
        }
    }

    public async onChangeMulti(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) {

        let selectedKeys = this.state.selectedOptionKeys;

        if (option) {
            const selectedKeyIdx = this.state.selectedOptionKeys.indexOf(option.key as string);

            if (option.selected && selectedKeyIdx === -1) {
                selectedKeys = update(this.state.selectedOptionKeys, {$push: [option.key as string] });
            } else {
                selectedKeys = update(this.state.selectedOptionKeys, { $splice: [[selectedKeyIdx, 1]] });
            }

            let selectedOptions: IComboBoxOption[] = [];
            this.state.options.forEach((comboOption) => {
                if (selectedKeys.indexOf(comboOption.key as string) !== -1) {
                    selectedOptions.push(comboOption);
                }
            });

            this.setState({
                selectedOptionKeys: selectedKeys,
                textDisplayValue: selectedOptions.map(o => o.text).join(',')
            });

            this.props.onUpdate(selectedOptions);

        } else { 
        
            if (value !== undefined && !this.props.searchAsYouType && !this.state.errorMessage) {

                // Case where the user starts to enter manual values without opening the dropdown values so the options are no fetched yet
                if (this.props.availableOptions.length === 0) {
                    await this.getOptions();
                }

                const newOption: IComboBoxOption = { key: value, text: value };
                selectedKeys = update(this.state.selectedOptionKeys, {$push: [newOption.key as string] });
                let options = update(this.state.options, {$push: [newOption] });

                options = this.sortOptions(options);

                let selectedOptions: IComboBoxOption[] = [];
                options.forEach((comboOption) => {
                    if (selectedKeys.indexOf(comboOption.key as string) !== -1) {
                        selectedOptions.push(comboOption);
                    }
                });

                this.setState({
                    options: options.map(x => ({...x})),
                    textDisplayValue: selectedOptions.map(o => o.text).join(','),
                    selectedOptionKeys: selectedKeys
                });

                this.props.onUpdate(selectedOptions);

                if (this.props.onUpdateOptions) {
                    this.props.onUpdateOptions(options);
                }

            } else {
                this.setState({
                    textDisplayValue: '',
                    errorMessage: null
                });
            }
        }
    }

    private onRenderOption(option: IComboBoxOption, defaultRender?: (renderProps?: IComboBoxOption) => JSX.Element): JSX.Element {

        if (this.props.onRenderOption) {
            return this.props.onRenderOption(option, defaultRender);
        } else {
            if (option.key === LOADING_KEY) {
                return  <div className={styles.spinner} style={{height: "100%"}}>
                            <Spinner styles={{root: { height: "100%"}}} key={option.key} size={SpinnerSize.small}/>
                        </div>;
            } else {
                return defaultRender(option);
            }
        }
    }

    /**
     * Retrieves all available options from the provided method
     * @param inputText if 'searchAsYouType' flag is enabled, pass the curren combo box text
     */
    private async getOptions(inputText?: string): Promise<void> {

        // Case when user opens the dropdown multiple times on the same field
        if (this.state.options.length > 0 && !this.props.searchAsYouType) {
            return;
        } else {

            let options: IComboBoxOption[] = [];

            this.setState({
                options: [
                    {
                        key: LOADING_KEY,
                        text: '',
                        disabled: true,
                        itemType: SelectableOptionMenuItemType.Header                        
                    } as IComboBoxOption
                ]
            });

            if (this.props.onLoadOptions) {
                options = await this.props.onLoadOptions(inputText);
            } else {
                options = [];
            }
    
            if (!this.props.searchAsYouType) {

                if (!this.props.allowMultiSelect) {
                    
                    if (options.filter(e => { return e.key === this.props.defaultSelectedKey; }).length === 0) {
                        options.push({
                            key: this.props.defaultSelectedKey,
                            text: this.props.textDisplayValue ? this.props.textDisplayValue : this.props.defaultSelectedKey as string
                        });
                    }
                } else {

                    this.props.defaultSelectedKeys.map(defaultKey => {
    
                        if (options.filter(e => { return e.key === defaultKey; }).length === 0) {
                            options.push({
                                key: defaultKey,
                                text: defaultKey as string,
                            });
                        }
                    });
                }
            }

            options = this.sortOptions(options.filter((elt) => { return !isEmpty(elt.key) != null && !isEmpty(elt.key); }));
            
            this.setState({
                options: options,
                selectedOptionKeys: this.props.defaultSelectedKeys,
            });

            if (this.props.onUpdateOptions) {
                this.props.onUpdateOptions(options);
            }
        }
    }

    private getTextDisplayValue(): string {

        let initialValue: string = null;

        if (this.props.textDisplayValue) {

            initialValue = this.props.textDisplayValue;

        } else {
            if (this.props.allowMultiSelect) {
                initialValue = this.props.defaultSelectedKeys ? this.props.defaultSelectedKeys.toString() : '';
            } else {
                if (this.props.defaultSelectedKey) {
                    initialValue = this.props.defaultSelectedKey;
                } else {
                    initialValue = this.state.textDisplayValue;
                }
            }
        }
        
        return initialValue;
    }

    private sortOptions(options: IComboBoxOption[]): IComboBoxOption[] {
        return options.sort((a, b) => {

            const aValue = a.text ? a.text : a.key ? a.key.toString() : null;
            const bValue = b.text ? b.text : b.key ? b.key.toString() : null;

            if (aValue && bValue) {
                if (aValue.toLowerCase() > bValue.toLowerCase()) return 1;
                if (bValue.toLowerCase() > aValue.toLowerCase()) return -1;
            } 

            return 0;
        });
    }
}