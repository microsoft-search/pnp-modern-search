import { IStyle, ThemeProvider } from "@fluentui/react-theme-provider";
import { Action, ActionProperty, BoolProperty, Choice, EnumProperty, Input, InputTextStyle, NumProperty, property, SerializableObject, SerializableObjectCollectionProperty, StringProperty, Strings, TimeProperty, ValidationEvent, ValidationResults, ValueSetProperty, Versions } from "adaptivecards";
import { Button, DefaultButton, IconButton } from "office-ui-fabric-react/lib/Button";
import { Checkbox, ICheckbox } from "office-ui-fabric-react/lib/Checkbox";
import { ChoiceGroup, IChoiceGroup, IChoiceGroupOption } from "office-ui-fabric-react/lib/ChoiceGroup";
import { ComboBox, IComboBox, IComboBoxOption } from "office-ui-fabric-react/lib/ComboBox";
import { DatePicker, IDatePicker } from "office-ui-fabric-react/lib/DatePicker";
import { IDropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { ISpinButton, SpinButton } from "office-ui-fabric-react/lib/SpinButton";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { ITheme } from "office-ui-fabric-react/lib/Styling";
import { ITextField, TextField } from "office-ui-fabric-react/lib/TextField";
import { IToggle, Toggle } from "office-ui-fabric-react/lib/Toggle";
import * as React from "react";
import { getFluentUIThemeFromHostCapability, hostCapabilitiesFluentUIThemeKey } from "./FluentUI";
import { internalRender } from "./Shared";

const inlineButtonRootStyle: IStyle = {
    marginLeft: 8,
};

export class FluentUIChoiceSetInput extends Input {
    public static readonly valueProperty = new StringProperty(Versions.v1_0, "value");
    public static readonly choicesProperty = new SerializableObjectCollectionProperty(
        Versions.v1_0,
        "choices",
        Choice
    );
    public static readonly styleProperty = new ValueSetProperty(
        Versions.v1_0,
        "style",
        [
            { value: "compact" },
            { value: "expanded" },
            { value: "filtered", targetVersion: Versions.v1_5 }
        ],
        "compact"
    );
    public static readonly isMultiSelectProperty = new BoolProperty(Versions.v1_0, "isMultiSelect", false);
    public static readonly placeholderProperty = new StringProperty(Versions.v1_0, "placeholder");
    public static readonly wrapProperty = new BoolProperty(Versions.v1_2, "wrap", false);

    @property(FluentUIChoiceSetInput.valueProperty)
    public defaultValue?: string;

    @property(FluentUIChoiceSetInput.styleProperty)
    public style?: "compact" | "expanded" | "filtered";

    public get isCompact(): boolean {
        return !this.style || this.style === "compact";
    }

    public set isCompact(value: boolean) {
        this.style = value ? undefined : "expanded";
    }

    @property(FluentUIChoiceSetInput.isMultiSelectProperty)
    public isMultiSelect: boolean = false;

    @property(FluentUIChoiceSetInput.placeholderProperty)
    public placeholder?: string;

    @property(FluentUIChoiceSetInput.wrapProperty)
    public wrap: boolean = false;

    @property(FluentUIChoiceSetInput.choicesProperty)
    public choices: Choice[] = [];

    private element: HTMLElement | undefined;
    private refControl: IDropdown | IComboBox | IChoiceGroup | ICheckbox;
    private selectedValues: string[] = [];
    private defaultSelectedValues: string[] = [];

    private updateSelectedValues = (key: any, isMultiSelect: boolean, selected: boolean): void => {
        if (isMultiSelect) {
            // eslint-disable-next-line no-unused-expressions
            selected ? this.selectedValues.push(key) : this.removeItemFromArray(this.selectedValues, key);
        }
        else {
            this.selectedValues = [];
            this.selectedValues.push(key);
        }
    }

    private removeItemFromArray = (arr: any[], item: any): void => {
        const index = arr.indexOf(item);
        arr.splice(index, 1);
    }

    protected internalRender(): HTMLElement | undefined {
        let theme: ITheme = getFluentUIThemeFromHostCapability(this.hostConfig);

        if (this.defaultValue) {
            this.defaultSelectedValues = this.defaultValue.split(this.hostConfig.choiceSetInputValueSeparator);
            this.selectedValues = this.defaultSelectedValues;
        }

        const optionsChoiceGroup: IChoiceGroupOption[] = (this.choices) ?
            this.choices.map((x, index) => {
                return {
                    key: x.value, text: x.title,
                    styles: { root: { marginTop: index > 0 ? this.hostConfig.spacing.default : 0 } }
                };
            })
            : [];

        const options: IDropdownOption[] | IComboBoxOption[] = (this.choices) ?
            this.choices.map(x => { return { key: x.value, text: x.title }; })
            : [];

        let control = () =>
            <>
                {this.isMultiSelect == false && this.style === "expanded" &&
                    <ThemeProvider theme={theme} style={{ backgroundColor: "transparent" }}>
                        <ChoiceGroup
                            defaultSelectedKey={this.defaultValue}
                            options={optionsChoiceGroup}
                            onChange={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
                                this.updateSelectedValues(option.key, this.isMultiSelect, true);
                                this.valueChanged();
                            }}
                            componentRef={(input) => this.refControl = input}
                        />
                    </ThemeProvider>
                }

                {this.isMultiSelect == true && this.style === "expanded" &&
                    <Stack tokens={{ childrenGap: this.hostConfig.spacing.default }}>
                        {this.choices.map((x, index) => {
                            let defaultChecked = this.defaultSelectedValues.indexOf(x.value) > -1;
                            return <ThemeProvider theme={theme} key={'t' + x.value} style={{ backgroundColor: "transparent" }}>
                                <Checkbox title={x.title}
                                    key={x.value}
                                    defaultChecked={defaultChecked}
                                    label={x.title}
                                    onChange={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
                                        this.updateSelectedValues(x.value, this.isMultiSelect, checked);
                                        this.valueChanged();
                                    }}
                                    componentRef={(input) => {
                                        if (index == 0)
                                            this.refControl = input;
                                    }}
                                />
                            </ThemeProvider>;
                        })}
                    </Stack>
                }

                {(this.style === "compact" || this.style === "filtered") &&
                    <ThemeProvider theme={theme} style={{ backgroundColor: "transparent" }}>
                        <ComboBox
                            placeholder={this.placeholder}
                            multiSelect={this.isMultiSelect}
                            defaultSelectedKey={this.defaultSelectedValues}
                            allowFreeform={false}
                            autoComplete={(this.style === "filtered") ? "on" : "off"}
                            options={options as IComboBoxOption[]}
                            onChange={(ev: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
                                this.updateSelectedValues(option.key, this.isMultiSelect, (this.isMultiSelect) ? option.selected : true);
                                this.valueChanged();
                            }}
                            componentRef={(input) => this.refControl = input}
                        />
                    </ThemeProvider>
                }
            </>;

        this.element = internalRender(control);
        this.element.style.width = "100%";
        return this.element;
    }

    public getJsonTypeName(): string {
        return "Input.ChoiceSet";
    }

    public focus() {
        if (this.refControl)
            this.refControl.focus();
    }

    public internalValidateProperties(context: ValidationResults) {
        super.internalValidateProperties(context);

        if (this.choices.length === 0) {
            context.addFailure(
                this,
                ValidationEvent.CollectionCantBeEmpty,
                Strings.errors.choiceSetMustHaveAtLeastOneChoice()
            );
        }

        for (const choice of this.choices) {
            if (!choice.title || !choice.value) {
                context.addFailure(
                    this,
                    ValidationEvent.PropertyCantBeNull,
                    Strings.errors.choiceSetChoicesMustHaveTitleAndValue()
                );
            }
        }
    }

    public isSet(): boolean {
        return this.value ? true : false;
    }

    public isValid(): boolean {
        if (!this.value) {
            return !this.isRequired;
        }

        return true;
    }

    public get value(): string | undefined {
        if (this.selectedValues) {
            let result: string = "";
            this.selectedValues.map(x => {
                if (result !== "") {
                    result += this.hostConfig.choiceSetInputValueSeparator;
                }

                result += x;
            });

            return result;
        }
        else {
            return undefined;
        }
    }
}

export class FluentUIDateInput extends Input {
    public static readonly valueProperty = new StringProperty(Versions.v1_0, "value");
    public static readonly placeholderProperty = new StringProperty(Versions.v1_0, "placeholder");
    public static readonly minProperty = new StringProperty(Versions.v1_0, "min");
    public static readonly maxProperty = new StringProperty(Versions.v1_0, "max");

    @property(FluentUIDateInput.valueProperty)
    public defaultValue?: string;

    @property(FluentUIDateInput.minProperty)
    public min?: string;

    @property(FluentUIDateInput.maxProperty)
    public max?: string;

    @property(FluentUIDateInput.placeholderProperty)
    public placeholder?: string;

    private _value?: Date;
    private refControl: IDatePicker;
    private element: HTMLElement | undefined;

    protected internalRender(): HTMLElement | undefined {
        let theme: ITheme = getFluentUIThemeFromHostCapability(this.hostConfig);

        let control = () =>
            <ThemeProvider theme={theme}>
                <DatePicker
                    id={this.id}
                    placeholder={this.placeholder}
                    minDate={this.convertStringToDate(this.min)}
                    maxDate={this.convertStringToDate(this.max)}
                    onSelectDate={(date: Date | null | undefined) => {
                        this._value = date;
                        this.valueChanged();
                    }}
                    theme={theme}
                    componentRef={(input) => this.refControl = input}
                />
            </ThemeProvider>;

        this.element = internalRender(control);
        this.element.style.width = "100%";
        return this.element;
    }

    private convertStringToDate(value: string): Date {
        if (value) {
            try {
                return new Date(value);
            }
            catch {
                return null;
            }
        }
        else { return null; }
    }

    public getJsonTypeName(): string {
        return "Input.Date";
    }

    public focus() {
        if (this.refControl)
            this.refControl.focus();
    }

    protected updateInputControlAriaLabelledBy() {
        if (this.element) {
            let joinedLabelIds = this.getAllLabelIds().join(" ");

            if (joinedLabelIds) {
                this.element.setAttribute("aria-labelledby", joinedLabelIds);
            } else {
                this.element.removeAttribute("aria-labelledby");
            }
        }
    }

    public isSet(): boolean {
        return this.value ? true : false;
    }

    public isValid(): boolean {
        if (!this.value) {
            return !this.isRequired;
        }

        const valueAsDate = new Date(this.value);

        let result = true;

        if (this.min) {
            const minDate = new Date(this.min);

            result = result && valueAsDate >= minDate;
        }

        if (this.max) {
            const maxDate = new Date(this.max);

            result = result && valueAsDate <= maxDate;
        }

        return result;
    }

    public get value(): string | undefined {
        if (this._value) {
            const offset = this._value.getTimezoneOffset();
            let value = new Date(this._value.getTime() - (offset * 60 * 1000));
            return value.toISOString().split('T')[0];
        }
        else {
            return undefined;
        }
    }
}

export class FluentUINumberInput extends Input {
    public static readonly valueProperty = new NumProperty(Versions.v1_0, "value");
    public static readonly placeholderProperty = new StringProperty(Versions.v1_0, "placeholder");
    public static readonly minProperty = new NumProperty(Versions.v1_0, "min");
    public static readonly maxProperty = new NumProperty(Versions.v1_0, "max");

    @property(FluentUINumberInput.valueProperty)
    public defaultValue?: number;

    @property(FluentUINumberInput.minProperty)
    public min?: number;

    @property(FluentUINumberInput.maxProperty)
    public max?: number;

    @property(FluentUINumberInput.placeholderProperty)
    public placeholder?: string;

    private refControl: ISpinButton;
    private element: HTMLElement | undefined;

    protected internalRender(): HTMLElement | undefined {
        let theme: ITheme = getFluentUIThemeFromHostCapability(this.hostConfig);

        let control = () =>
            <SpinButton
                id={this.id}
                defaultValue={`${this.defaultValue}`}
                placeholder={this.placeholder}
                min={this.min}
                max={this.max}
                onChange={() => this.valueChanged()}
                theme={theme}
                componentRef={(input) => this.refControl = input}
            />;

        this.element = internalRender(control);
        this.element.style.width = "100%";
        return this.element;
    }

    public getJsonTypeName(): string {
        return "Input.Number";
    }

    public focus() {
        if (this.refControl)
            this.refControl.focus();
    }

    protected updateInputControlAriaLabelledBy() {
        if (this.element) {
            let joinedLabelIds = this.getAllLabelIds().join(" ");

            if (joinedLabelIds) {
                this.element.setAttribute("aria-labelledby", joinedLabelIds);
            } else {
                this.element.removeAttribute("aria-labelledby");
            }
        }
    }

    public isSet(): boolean {
        return this.value !== undefined && !isNaN(this.value);
    }

    public isValid(): boolean {
        if (!this.value) {
            return !this.isRequired;
        }

        let result = true;

        if (this.min !== undefined) {
            result = result && this.value >= this.min;
        }

        if (this.max !== undefined) {
            result = result && this.value <= this.max;
        }

        return result;
    }

    public get value(): number | undefined {
        if (this.refControl) {
            return Number(this.refControl.value);
        }
        else {
            return undefined;
        }
    }
}

export class FluentUITextInput extends Input {
    public static readonly valueProperty = new StringProperty(Versions.v1_0, "value");
    public static readonly maxLengthProperty = new NumProperty(Versions.v1_0, "maxLength");
    public static readonly isMultilineProperty = new BoolProperty(Versions.v1_0, "isMultiline", false);
    public static readonly placeholderProperty = new StringProperty(Versions.v1_0, "placeholder");
    public static readonly styleProperty = new EnumProperty(Versions.v1_0, "style", InputTextStyle, InputTextStyle.Text);
    public static readonly inlineActionProperty = new ActionProperty(Versions.v1_0, "inlineAction", ["Action.ShowCard"]);
    public static readonly regexProperty = new StringProperty(Versions.v1_3, "regex", true);

    @property(FluentUITextInput.valueProperty)
    public defaultValue?: string;

    @property(FluentUITextInput.maxLengthProperty)
    public maxLength?: number;

    @property(FluentUITextInput.isMultilineProperty)
    public isMultiline: boolean = false;

    @property(FluentUITextInput.placeholderProperty)
    public placeholder?: string;

    @property(FluentUITextInput.styleProperty)
    public style: InputTextStyle = InputTextStyle.Text;

    @property(FluentUITextInput.inlineActionProperty)
    public inlineAction?: Action;

    @property(FluentUITextInput.regexProperty)
    public regex?: string;

    private refControl: ITextField;
    private element: HTMLElement | undefined;

    protected internalRender(): HTMLElement | undefined {
        let theme: ITheme = getFluentUIThemeFromHostCapability(this.hostConfig);

        let control = () =>
            <TextField
                id={this.id}
                type={InputTextStyle[this.style].toLowerCase()}
                defaultValue={this.defaultValue}
                multiline={this.isMultiline}
                maxLength={this.maxLength}
                placeholder={this.placeholder}
                pattern={this.regex}
                onChange={() => this.valueChanged()}
                onKeyDown={this.handleKeyDown}
                theme={theme}
                componentRef={(input) => this.refControl = input}
            />;

        this.element = internalRender(control);
        this.element.style.width = "100%";
        return this.element;
    }

    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        // Enter pressed
        if (e.key === 'Enter' && this.inlineAction) {
            this.inlineAction.execute();
        }
    }

    protected overrideInternalRender(): HTMLElement {
        let inputControl = super.overrideInternalRender();

        if (this.inlineAction) {
            this.inputControlContainerElement.appendChild(this.buildInlineActionButton());
        }
        return inputControl;
    }

    private buildInlineActionButton = (): HTMLElement => {
        return internalRender(
            (this.inlineAction.iconUrl) ?
                this.inlineIconActionButton :
                this.buildTextOnlyInlineActionActionButton
        );
    }

    private inlineActionClickHandler = (e: React.MouseEvent<Button>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.inlineAction.execute();
    }

    private inlineIconActionButton = (): JSX.Element => {
        let theme = this.hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);

        return <IconButton
            default={true}
            text={this.inlineAction.title}
            ariaDescription={this.inlineAction.title}
            className={this.hostConfig.makeCssClassName("ac-inlineActionButton", "iconOnly")}
            theme={theme}
            styles={{
                icon: {
                    height: `100%`,
                },
                root: inlineButtonRootStyle,
            }}
            iconProps={{
                imageProps: {
                    height: "100%",
                    src: this.inlineAction.iconUrl,
                },
            }}
            onClick={this.inlineActionClickHandler}
        />;
    }

    private buildTextOnlyInlineActionActionButton = (): JSX.Element => {
        let theme = this.hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);

        return <DefaultButton
            className={this.hostConfig.makeCssClassName("ac-inlineActionButton", "textOnly")}
            text={this.inlineAction.title}
            ariaDescription={this.inlineAction.title}
            onClick={this.inlineActionClickHandler}
            styles={{
                root: inlineButtonRootStyle,
            }}
            theme={theme}
        />;
    }

    public getJsonTypeName(): string {
        return "Input.Text";
    }

    public focus() {
        if (this.refControl)
            this.refControl.focus();
    }

    protected updateInputControlAriaLabelledBy() {
        if (this.element) {
            let joinedLabelIds = this.getAllLabelIds().join(" ");

            if (joinedLabelIds) {
                this.element.setAttribute("aria-labelledby", joinedLabelIds);
            } else {
                this.element.removeAttribute("aria-labelledby");
            }
        }
    }

    public getActionById(id: string) {
        let result = super.getActionById(id);

        if (!result && this.inlineAction) {
            result = this.inlineAction.getActionById(id);
        }

        return result;
    }

    public isSet(): boolean {
        return this.value ? true : false;
    }

    public isValid(): boolean {
        if (!this.value) {
            return !this.isRequired;
        }

        if (this.regex) {
            return new RegExp(this.regex, "g").test(this.value);
        }

        return true;
    }

    public get value(): string | undefined {
        if (this.renderedInputControlElement) {
            return this.refControl.value;
        }
        else {
            return undefined;
        }
    }
}

export class FluentUITimeInput extends Input {
    private static convertTimeStringToDate(timeString: string): Date {
        return new Date("1973-09-04T" + timeString + ":00Z");
    }

    public static readonly valueProperty = new TimeProperty(Versions.v1_0, "value");
    public static readonly placeholderProperty = new StringProperty(Versions.v1_0, "placeholder");
    public static readonly minProperty = new TimeProperty(Versions.v1_0, "min");
    public static readonly maxProperty = new TimeProperty(Versions.v1_0, "max");

    @property(FluentUITimeInput.valueProperty)
    public defaultValue?: string;

    @property(FluentUITimeInput.minProperty)
    public min?: string;

    @property(FluentUITimeInput.maxProperty)
    public max?: string;

    @property(FluentUITimeInput.placeholderProperty)
    public placeholder?: string;

    private refControl: ITextField;
    private element: HTMLElement | undefined;

    protected internalRender(): HTMLElement | undefined {
        let theme: ITheme = getFluentUIThemeFromHostCapability(this.hostConfig);

        let control = () =>
            <TextField
                id={this.id}
                type="time"
                defaultValue={this.defaultValue}
                min={this.min}
                max={this.max}
                placeholder={this.placeholder}
                onChange={() => this.valueChanged()}
                theme={theme}
                componentRef={(input) => this.refControl = input}
            />;

        this.element = internalRender(control);
        this.element.style.width = "100%";
        return this.element;
    }

    public getJsonTypeName(): string {
        return "Input.Time";
    }

    public focus() {
        if (this.refControl)
            this.refControl.focus();
    }

    protected updateInputControlAriaLabelledBy() {
        if (this.element) {
            let joinedLabelIds = this.getAllLabelIds().join(" ");

            if (joinedLabelIds) {
                this.element.setAttribute("aria-labelledby", joinedLabelIds);
            } else {
                this.element.removeAttribute("aria-labelledby");
            }
        }
    }

    public isSet(): boolean {
        return this.value ? true : false;
    }

    public isValid(): boolean {
        if (!this.value) {
            return !this.isRequired;
        }

        const valueAsDate = FluentUITimeInput.convertTimeStringToDate(this.value);

        let result = true;

        if (this.min) {
            const minDate = FluentUITimeInput.convertTimeStringToDate(this.min);

            result = result && valueAsDate >= minDate;
        }

        if (this.max) {
            const maxDate = FluentUITimeInput.convertTimeStringToDate(this.max);

            result = result && valueAsDate <= maxDate;
        }

        return result;
    }

    public get value(): string | undefined {
        if (this.renderedInputControlElement) {
            return this.refControl.value;
        }
        else {
            return undefined;
        }
    }
}

export class FluentUIToggleInput extends Input {
    public static readonly valueProperty = new StringProperty(Versions.v1_0, "value");
    public static readonly titleProperty = new StringProperty(Versions.v1_0, "title");
    public static readonly valueOnProperty = new StringProperty(
        Versions.v1_0,
        "valueOn",
        true,
        undefined,
        "true",
        (_sender: SerializableObject) => {
            return "true";
        }
    );
    public static readonly valueOffProperty = new StringProperty(
        Versions.v1_0,
        "valueOff",
        true,
        undefined,
        "false",
        (_sender: SerializableObject) => {
            return "false";
        }
    );
    public static readonly wrapProperty = new BoolProperty(Versions.v1_2, "wrap", false);

    @property(FluentUIToggleInput.valueProperty)
    public defaultValue?: string;

    @property(FluentUIToggleInput.titleProperty)
    public title?: string;

    @property(FluentUIToggleInput.valueOnProperty)
    public valueOn: string = "true";

    @property(FluentUIToggleInput.valueOffProperty)
    public valueOff: string = "false";

    @property(FluentUIToggleInput.wrapProperty)
    public wrap: boolean = false;

    private _value?: boolean;
    private refControl: IToggle;
    private element: HTMLElement | undefined;

    protected internalRender(): HTMLElement | undefined {
        let theme: ITheme = getFluentUIThemeFromHostCapability(this.hostConfig);

        let control = () =>
            <ThemeProvider theme={theme} style={{ backgroundColor: "transparent" }}>
                <Toggle
                    id={this.id}
                    inlineLabel={true}
                    onText={this.title}
                    offText={this.title}
                    onChange={(event: React.MouseEvent<HTMLElement, MouseEvent>, checked?: boolean) => {
                        this._value = checked;
                        this.valueChanged();
                    }}
                    defaultChecked={this.defaultValue === this.valueOn}
                    styles={{ root: { marginBottom: 0, marginTop: 0 } }}
                    componentRef={(input) => this.refControl = input}
                />
            </ThemeProvider>;

        this.element = internalRender(control);
        this.element.style.width = "100%";
        return this.element;
    }

    protected get isNullable(): boolean {
        return false;
    }

    public getJsonTypeName(): string {
        return "Input.Toggle";
    }

    public focus() {
        if (this.refControl)
            this.refControl.focus();
    }

    protected updateInputControlAriaLabelledBy() {
        if (this.element) {
            let joinedLabelIds = this.getAllLabelIds().join(" ");

            if (joinedLabelIds) {
                this.element.setAttribute("aria-labelledby", joinedLabelIds);
            } else {
                this.element.removeAttribute("aria-labelledby");
            }
        }
    }

    public isSet(): boolean {
        if (this.isRequired) {
            return this.value === this.valueOn;
        }

        return this.value ? true : false;
    }

    public get value(): string | undefined {
        if (this._value != null && this._value != undefined) {
            return this._value ? this.valueOn : this.valueOff;
        } else {
            if (this.isRequired) {
                return undefined;
            }
            else {
                return this.valueOff;
            }
        }
    }
}