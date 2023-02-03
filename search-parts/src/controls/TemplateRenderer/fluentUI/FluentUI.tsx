import { Action, CardElement, CardObjectRegistry, HostConfig } from "adaptivecards";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { createTheme, getTheme, ITheme } from "@fluentui/react/lib/Styling";
import { FluentUIExecuteAction, FluentUIOpenUrlAction, FluentUIShowCardAction, FluentUISubmitAction, FluentUIToggleVisibilityAction } from "./Actions";
import { FluentUIChoiceSetInput, FluentUIDateInput, FluentUINumberInput, FluentUITextInput, FluentUITimeInput, FluentUIToggleInput } from "./Elements";

let iconsInitialized = false;

export const hostCapabilitiesFluentUIThemeKey = "fluentUITheme";

export function useLocalFluentUI(elementsRegistry: CardObjectRegistry<CardElement>, actionsRegistry: CardObjectRegistry<Action>) {
    if (!iconsInitialized) {
        initializeIcons();
        iconsInitialized = true;
    }

    elementsRegistry.register("Input.Text", FluentUITextInput);
    elementsRegistry.register("Input.Number", FluentUINumberInput);
    elementsRegistry.register("Input.Time", FluentUITimeInput);
    elementsRegistry.register("Input.Date", FluentUIDateInput);
    elementsRegistry.register("Input.Toggle", FluentUIToggleInput);
    elementsRegistry.register("Input.ChoiceSet", FluentUIChoiceSetInput);

    actionsRegistry.register("Action.Submit", FluentUISubmitAction);
    actionsRegistry.register("Action.OpenUrl", FluentUIOpenUrlAction);
    actionsRegistry.register("Action.ShowCard", FluentUIShowCardAction);
    actionsRegistry.register("Action.ToggleVisibility", FluentUIToggleVisibilityAction);
    actionsRegistry.register("Action.Execute", FluentUIExecuteAction);
}

export const getDefaultFluentUITheme = (): ITheme => {
    let currentTheme;
    const themeColorsFromWindow: any = (window as any).__themeState__.theme;
    if (themeColorsFromWindow) {
        currentTheme = createTheme({
            palette: themeColorsFromWindow
        });
    }
    else
        currentTheme = getTheme();

    return currentTheme;
};

export const setFluentUIThemeAsHostCapability = (hostConfig: HostConfig, theme: ITheme) => {
    hostConfig.hostCapabilities.setCustomProperty(hostCapabilitiesFluentUIThemeKey, theme);
};

export const getFluentUIThemeFromHostCapability = (hostConfig: HostConfig): ITheme => {
    let theme: ITheme = hostConfig.hostCapabilities.getCustomProperty(hostCapabilitiesFluentUIThemeKey);
    if (!theme) {
        theme = getDefaultFluentUITheme();
    }

    return theme;
};

export const createDefaultTeamsTheme = (): ITheme => {
    let theme: ITheme;

    theme = createTheme({
        ...{ palette: require("../themes/teamsDefaultPalette.json") }
    });

    return theme;
};

export const createDarkTeamsTheme = (): ITheme => {
    let theme: ITheme;

    theme = createTheme({
        ...{ palette: require("../themes/teamsDarkPalette.json") }
    });
    theme.semanticColors.primaryButtonText = theme.semanticColors.buttonText;
    theme.semanticColors.primaryButtonTextHovered = theme.semanticColors.buttonTextHovered;
    theme.semanticColors.primaryButtonTextPressed = theme.semanticColors.buttonTextPressed;

    return theme;
};

export const createHighContrastTeamsTheme = (): ITheme => {
    let theme: ITheme;

    theme = createTheme({
        ...{ palette: require("../themes/teamsHighContrastPalette.json") }
    });

    return theme;
};