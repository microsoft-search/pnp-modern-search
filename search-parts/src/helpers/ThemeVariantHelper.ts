import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IFontStyles, IRawStyle } from '@fluentui/react';

const THEME_VARIANT_ATTRIBUTE = 'data-theme-variant';
const BRAND_FONT_TOKEN_BY_STYLE: Partial<Record<keyof IFontStyles, number>> = {
    tiny: 100,
    xSmall: 200,
    small: 300,
    smallPlus: 400,
    medium: 600,
    mediumPlus: 700,
    large: 900,
    xLarge: 1000,
    xLargePlus: 1100,
    xxLarge: 1200,
    xxLargePlus: 1300,
    superLarge: 1500,
    mega: 1700
};

export class ThemeVariantHelper {

    /**
     * Parsed themes, keyed by the element carrying the serialized theme. A serialized
     * `IReadonlyTheme` is ~8.5 KB, so parsing it once per ancestor instead of once per
     * web component keeps templates with many web components (ex: a refiner with a few
     * hundred values) cheap to render.
     */
    private static readonly _parsedThemes: WeakMap<Element, IReadonlyTheme> = new WeakMap<Element, IReadonlyTheme>();

    /**
     * Uses the SharePoint Brand Center CSS custom properties documented for SPFx
     * components. Keeping the var() expression in the serialized theme lets
     * layouts and Fluent UI components resolve the current font in the page CSS
     * context, including after the user changes the selected font.
     */
    public static resolveThemeVariant(themeVariant: IReadonlyTheme | undefined): IReadonlyTheme | undefined {
        if (!themeVariant) {
            return themeVariant;
        }

        if (!themeVariant.fonts) {
            return themeVariant;
        }

        const fonts = { ...themeVariant.fonts } as IFontStyles;

        (Object.keys(BRAND_FONT_TOKEN_BY_STYLE) as (keyof IFontStyles)[]).forEach((styleName) => {
            const token = BRAND_FONT_TOKEN_BY_STYLE[styleName];
            const fontStyle = fonts[styleName] as IRawStyle;

            if (token && fontStyle) {
                fonts[styleName] = {
                    ...fontStyle,
                    fontFamily: `var(--fontFamilyCustomFont${token}, var(--fontFamilyBase))`
                };
            }
        });

        return {
            ...themeVariant,
            fonts
        };
    }

    /**
     * Resolves the theme variant from the closest ancestor carrying a `data-theme-variant`
     * attribute. Use this as a `getThemeVariant()` fallback in web components that can be
     * repeated many times inside a template, so the theme only needs to be serialized once
     * on an enclosing element instead of on every single instance.
     * @param element the web component to resolve the theme for
     * @returns the theme variant, or `undefined` when no ancestor provides one
     */
    public static resolveFromAncestors(element: Element): IReadonlyTheme | undefined {
        // Start from the parent: the element itself is only asked for a fallback when it
        // has no usable `data-theme-variant` attribute of its own.
        const themeHost = element?.parentElement?.closest(`[${THEME_VARIANT_ATTRIBUTE}]`);

        if (!themeHost) {
            return undefined;
        }

        if (ThemeVariantHelper._parsedThemes.has(themeHost)) {
            return ThemeVariantHelper._parsedThemes.get(themeHost);
        }

        const serializedTheme = themeHost.getAttribute(THEME_VARIANT_ATTRIBUTE);
        let themeVariant: IReadonlyTheme | undefined = undefined;

        try {
            themeVariant = serializedTheme ? JSON.parse(serializedTheme) : undefined;
        } catch {
            // An unparsable theme is treated as "no theme" so components fall back to their defaults
            themeVariant = undefined;
        }

        ThemeVariantHelper._parsedThemes.set(themeHost, themeVariant);

        return themeVariant;
    }
}
