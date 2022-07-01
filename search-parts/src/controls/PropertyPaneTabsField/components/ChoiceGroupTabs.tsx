
import * as React from 'react';
import { IChoiceGroupTabsProps } from "./IChoiceGroupTabsProps";
import { ChoiceGroup, DefaultButton, IButtonStyles, IChoiceGroupOption, PrimaryButton } from 'office-ui-fabric-react';

export interface IChoiceGroupTabsState {
    selectedKey: string;
}

export class ChoiceGroupTabs extends React.Component<IChoiceGroupTabsProps,IChoiceGroupTabsState> {


    public constructor(props: IChoiceGroupTabsProps) {
        super(props);

        this.state = {
            selectedKey: props.defaultSelectedKey
        };
    }

    public render() {
    
        const styles: IButtonStyles = { 
            root:  { 
                width: '100%',
                borderRadius: 0,
                selectors: {    
                    '.ms-Button': { width: '100%', borderRadius: 0 }
                }
            }
        };

        const onRenderField = (option: IChoiceGroupOption): JSX.Element => {

            const onClick = () => {
                this.setState({
                    selectedKey: option.key
                });

                this.props.onChange(option.key);
            };

            if (option.key === this.state.selectedKey) {
                return <PrimaryButton styles={styles} ariaLabel={option.text} onClick={onClick} title={option.title}>{option.text} </PrimaryButton>;
            } else {
                return <DefaultButton styles={styles} ariaLabel={option.text} onClick={onClick} title={option.title}>{option.text} </DefaultButton>;
            }
            
        };

        // Add custon render method for each provided options
        const options: IChoiceGroupOption[] = this.props.options.map(option => {
            option.onRenderField =  (props?: IChoiceGroupOption, defaultRender?: (props?: IChoiceGroupOption) => JSX.Element | null) => { 
                return onRenderField(option);
            };
            return option;
        });

        return  <ChoiceGroup selectedKey={this.state.selectedKey} options={options} styles={{
                    root: {
                        marginBottom: 15
                    },
                    flexContainer: {
                        display: 'flex',
                        justifyContent: 'space-around',
                        selectors: {
                            '.ms-ChoiceField, .ms-ChoiceField-wrapper': {
                                width: '100%'
                            }
                        }
                    }
                }}/>;
    }

}
