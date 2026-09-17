import { IReadonlyTheme } from '@microsoft/sp-component-base';

const THEME_VARIANT_ATTRIBUTE = 'data-theme-variant';
const DEFAULT_FONT_FAMILY = "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

type FontStyleName = keyof NonNullable<IReadonlyTheme['fonts']>;

const BODY_FONT_STYLES: FontStyleName[] = ['tiny', 'xSmall', 'small', 'smallPlus', 'medium', 'mediumPlus'];
const HEADLINE_FONT_STYLES: FontStyleName[] = ['large', 'xLarge', 'xLargePlus', 'xxLarge', 'xxLargePlus', 'superLarge', 'mega'];

export class ThemeVariantHelper {

    /**
     * Parsed themes, keyed by the element carrying the serialized theme. A serialized
     * `IReadonlyTheme` is ~8.5 KB, so parsing it once per ancestor instead of once per
     * web component keeps templates with many web components (ex: a refiner with a few
     * hundred values) cheap to render.
     */
    private static readonly _parsedThemes: WeakMap<Element, IReadonlyTheme> = new WeakMap<Element, IReadonlyTheme>();

    /**
     * Copies the custom font families exposed by SharePoint Brand Center into the
     * Fluent UI font slots. SharePoint exposes these values as CSS custom
     * properties, while the serialized SPFx theme can retain the default
     * `fonts.*.fontFamily` values.
     */
    public static resolveThemeVariant(themeVariant: IReadonlyTheme | undefined, element?: Element): IReadonlyTheme | undefined {
        if (!themeVariant || typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
            return themeVariant;
        }

        const style = getComputedStyle(element || document.documentElement);
        const fontFamilies = this._getCustomFontFamilies(style, themeVariant);

        if (!fontFamilies.body && !fontFamilies.headline && !fontFamilies.title && !fontFamilies.interactive) {
            return themeVariant;
        }

        const fonts = { ...(themeVariant.fonts || {}) };
        const bodyFontFamily = fontFamilies.body || fontFamilies.interactive;
        const headlineFontFamily = fontFamilies.headline || bodyFontFamily;
        const titleFontFamily = fontFamilies.title || headlineFontFamily;

        BODY_FONT_STYLES.forEach((styleName) => {
            if (fonts[styleName]) {
                fonts[styleName] = { ...fonts[styleName], fontFamily: bodyFontFamily };
            }
        });

        HEADLINE_FONT_STYLES.forEach((styleName) => {
            if (fonts[styleName]) {
                fonts[styleName] = { ...fonts[styleName], fontFamily: styleName === 'mega' ? titleFontFamily : headlineFontFamily };
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

    private static _getCustomFontFamilies(style: CSSStyleDeclaration, themeVariant: IReadonlyTheme): {
        body?: string;
        headline?: string;
        title?: string;
        interactive?: string;
    } {
        const slotValues: { [slot: string]: string } = {};

        for (let slot = 100; slot <= 1700; slot += 100) {
            const customFont = style.getPropertyValue(`--fontFamilyCustomFont${slot}`).trim();
            if (customFont) {
                slotValues[`CustomFont${slot}`] = customFont;
            }
        }

        const themeSlots = (themeVariant as any).fontSlots;
        const themeFaces = (themeVariant as any).fontFaces;

        for (let slot = 100; slot <= 1700; slot += 100) {
            const slotName = `CustomFont${slot}`;
            slotValues[slotName] = slotValues[slotName] ||
                this._extractFontFamily(themeSlots?.[slotName]) ||
                this._extractFontFamily(themeFaces?.[slotName]);
        }

        const getFirst = (start: number, end: number): string | undefined => {
            for (let slot = start; slot <= end; slot += 100) {
                if (slotValues[`CustomFont${slot}`]) {
                    return slotValues[`CustomFont${slot}`];
                }
            }
            return undefined;
        };

        return {
            body: getFirst(100, 900),
            interactive: getFirst(400, 600),
            headline: getFirst(1000, 1400),
            title: getFirst(1500, 1700)
        };
    }

    private static _extractFontFamily(value: any): string | undefined {
        if (typeof value === 'string' && value.trim() && value !== DEFAULT_FONT_FAMILY) {
            return value.trim();
        }

        if (value && typeof value === 'object') {
            return this._extractFontFamily(value.fontFamily) ||
                this._extractFontFamily(value.family) ||
                this._extractFontFamily(value.value);
        }

        return undefined;
    }
}
