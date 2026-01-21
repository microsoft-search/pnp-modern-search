import { ActionButtonState, ActionIconPlacement, ExecuteAction, OpenUrlAction, ShowCardAction, SubmitAction, ToggleVisibilityAction } from "adaptivecards";
import { BaseButton, Button, CompoundButton, DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { createTheme, ITheme } from '@fluentui/react/lib/Styling';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { getDefaultFluentUITheme, hostCapabilitiesFluentUIThemeKey } from "./FluentUI";
import { createDiv } from "./Shared";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redFluentUIPalette = require("../themes/redPalette.json");

const ActionButton = (props: ActionButtonProps) => {
    let control;
    let theme = (props.theme) ? props.theme : getDefaultFluentUITheme();

    if (props.iconUrl) {
        control =
            <CompoundButton
                className={props.className}
                onClick={props.actionClickHandler}
                theme={theme}>
                <div style={
                    {
                        display: "flex",
                        flexDirection: props.iconPlacement === ActionIconPlacement.LeftOfTitle ? "row" : "column",
                        justifyContent: "center",
                    }
                }><img src={props.iconUrl}
                    style={
                        {
                            alignSelf: "center",
                            width: props.iconSize,
                            height: props.iconSize,
                            flex: "0 0 auto",
                        }
                    } />
                    <span style={{ alignSelf: "center" }}>{props.text}</span>
                </div>
            </CompoundButton>;
    } else {
        if (props.style.toLocaleLowerCase().trim() == 'positive') {
            control = <PrimaryButton
                className={props.className}
                text={props.text}
                theme={theme}
                onClick={props.actionClickHandler} />;
        } else if (props.style.toLocaleLowerCase().trim() == 'destructive') {
            const dangerButtonTheme: ITheme = createTheme({ palette: redFluentUIPalette });
            control = <PrimaryButton
                className={props.className}
                text={props.text}
                theme={dangerButtonTheme}
                onClick={props.actionClickHandler} />;
        } else {
            control = <DefaultButton
                className={props.className}
                text={props.text}
                theme={theme}
                onClick={props.actionClickHandler} />;
        }
    }

    return control;
};

const createActionDiv = (
    title: string,
    iconUrl: string,
    baseCssClass: string,
    iconPlacement: ActionIconPlacement,
    iconSize: number,
    actionClickHandler: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement>) => void,
    style: string,
    theme?: ITheme,
    previousElement?: HTMLElement): HTMLDivElement => {
    if (previousElement) {
        ReactDOM.unmountComponentAtNode(previousElement);
    }
    const div = createDiv();
    div.className = "fluentUI";
    ReactDOM.render(
        <ActionButton
            text={title}
            className={baseCssClass}
            iconUrl={iconUrl}
            iconPlacement={iconPlacement}
            iconSize={iconSize}
            actionClickHandler={actionClickHandler}
            style={style}
            theme={theme}
        /> as any, div);
    return div;
};

export class FluentUIExecuteAction extends ExecuteAction {
    protected updateCssClasses() {
    }

    private actionClickHandler = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.execute();
    }

    public render(baseCssClass?: string): void {
        let theme = this.hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);
        let actionsConfig = this.parent.hostConfig.actions;
        this._renderedElement = createActionDiv(
            this.title,
            this.iconUrl,
            baseCssClass,
            actionsConfig.iconPlacement,
            actionsConfig.iconSize,
            this.actionClickHandler,
            this.style,
            theme,
            this._renderedElement);
    }
}

export class FluentUIOpenUrlAction extends OpenUrlAction {
    protected updateCssClasses() {
    }

    private actionClickHandler = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.execute();
    }

    public render(baseCssClass?: string): void {
        let theme = this.hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);
        let actionsConfig = this.parent.hostConfig.actions;
        this._renderedElement = createActionDiv(
            this.title,
            this.iconUrl,
            baseCssClass,
            actionsConfig.iconPlacement,
            actionsConfig.iconSize,
            this.actionClickHandler,
            this.style,
            theme,
            this._renderedElement);
    }
}

export class FluentUIShowCardAction extends ShowCardAction {
    protected updateCssClasses() {
        if (this.renderedElement) {
            this.renderedElement.setAttribute(
                "aria-expanded",
                (this.state === ActionButtonState.Expanded).toString()
            );
        }
    }

    private actionClickHandler = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.execute();
    }

    public render(baseCssClass?: string): void {
        let theme = this.hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);
        let actionsConfig = this.parent.hostConfig.actions;
        this._renderedElement = createActionDiv(
            this.title,
            this.iconUrl,
            baseCssClass,
            actionsConfig.iconPlacement,
            actionsConfig.iconSize,
            this.actionClickHandler,
            this.style,
            theme,
            this._renderedElement);
    }
}

export class FluentUISubmitAction extends SubmitAction {
    protected updateCssClasses() {
    }

    private actionClickHandler = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.execute();
    }

    public render(baseCssClass?: string): void {
        let theme = this.hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);
        let actionsConfig = this.parent.hostConfig.actions;
        this._renderedElement = createActionDiv(
            this.title,
            this.iconUrl,
            baseCssClass,
            actionsConfig.iconPlacement,
            actionsConfig.iconSize,
            this.actionClickHandler,
            this.style,
            theme,
            this._renderedElement);
    }
}

export class FluentUIToggleVisibilityAction extends ToggleVisibilityAction {
    protected updateCssClasses() {
        if (this.renderedElement) {
            this.renderedElement.setAttribute(
                "aria-expanded",
                (this.state === ActionButtonState.Expanded).toString()
            );
        }
    }

    private actionClickHandler = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.execute();
    }

    public render(baseCssClass?: string): void {
        let theme = this.hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);
        let actionsConfig = this.parent.hostConfig.actions;
        this._renderedElement = createActionDiv(
            this.title,
            this.iconUrl,
            baseCssClass,
            actionsConfig.iconPlacement,
            actionsConfig.iconSize,
            this.actionClickHandler,
            this.style,
            theme,
            this._renderedElement);
    }
}

interface ActionButtonProps {
    text: string;
    className?: string;
    iconUrl?: string;
    iconPlacement?: ActionIconPlacement;
    iconSize?: number;
    actionClickHandler: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement>) => void;
    style: string;
    theme?: ITheme;
}