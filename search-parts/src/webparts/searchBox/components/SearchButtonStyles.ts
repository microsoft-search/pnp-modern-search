import { IButtonStyles } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

/**
 * Builds the search button color styles, falling back to the theme primary button colors.
 * Colors are applied through Fluent UI styles (not CSS) so they take precedence over the
 * Fluent button defaults in every state without needing !important.
 * @param themeVariant the current theme variant
 * @param buttonColor custom button background color
 * @param textColor custom button text and icon color
 */
export function getSearchButtonColorStyles(themeVariant: IReadonlyTheme | undefined, buttonColor?: string, textColor?: string): IButtonStyles {

    const semanticColors = themeVariant?.semanticColors;
    const background = buttonColor || semanticColors?.primaryButtonBackground || '#0078d7';
    const backgroundHovered = buttonColor || semanticColors?.primaryButtonBackgroundHovered || '#0078d7';
    const text = textColor || semanticColors?.primaryButtonText || '#ffffff';
    const textHovered = textColor || semanticColors?.primaryButtonTextHovered || '#ffffff';

    return {
        root: { backgroundColor: background, color: text },
        rootHovered: { backgroundColor: backgroundHovered, color: textHovered },
        rootPressed: { backgroundColor: backgroundHovered, color: textHovered },
        icon: { color: text },
        iconHovered: { color: textHovered },
        iconPressed: { color: textHovered },
        label: { color: text },
        labelHovered: { color: textHovered }
    };
}
