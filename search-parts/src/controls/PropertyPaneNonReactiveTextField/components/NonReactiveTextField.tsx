import * as React from 'react';
import { INonReactiveTextFieldProps } from './INonReactiveTextFieldProps';
import { INonReactiveTextFieldState } from './INonReactiveTextFieldState';
import { TextField, PrimaryButton, IButtonProps } from "office-ui-fabric-react";
import { isEqual } from '@microsoft/sp-lodash-subset';

export class NonReactiveTextField extends React.Component<INonReactiveTextFieldProps, INonReactiveTextFieldState> {

    public constructor(props: INonReactiveTextFieldProps) {
        super(props);

        this.state = {
            value: props.defaultValue,
            iconName: null
        };

        this._onChange = this._onChange.bind(this);
        this._onApply = this._onApply.bind(this);
    }

    public render() {

        const iconProps: IButtonProps = this.state.iconName ? {iconProps:{iconName: this.state.iconName}} : null;
        let isDisabled = (!this.state.value && !this.props.allowEmptyValue) || isEqual(this.state.value, this.props.defaultValue);

        return  <>
                    <TextField
                        defaultValue={this.props.defaultValue}
                        label={this.props.label}
                        placeholder={this.props.placeholderText}
                        description={this.props.description}
                        multiline={this.props.multiline}
                        autoAdjustHeight={this.props.multiline}
                        rows={this.props.rows ? this.props.rows : 4}
                        onChange={this._onChange}
                    />
                    <PrimaryButton
                        toggle
                        styles={{root: {marginTop: 8}}} 
                        text={this.props.applyBtnText} 
                        onClick={this._onApply} 
                        allowDisabledFocus 
                        disabled={isDisabled} 
                        checked={true} 
                        {...iconProps}
                    />
                </>;
    }


    public componentDidUpdate(prevProps: INonReactiveTextFieldProps, prevState: INonReactiveTextFieldState) {
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            this.setState({
                value: this.props.defaultValue
            });
        }
    }

    public _onChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) {

        this.setState({
            value: newValue,
            iconName: newValue !== this.props.defaultValue ? 'Save' : null           
        });
    }

    public _onApply() {
        this.props.onUpdate(this.state.value);

        this.setState({
            iconName: 'Accept'
        });
    }
}