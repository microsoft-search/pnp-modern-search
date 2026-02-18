import * as React from 'react';
import { WebPartTitle, IWebPartTitleProps } from '@pnp/spfx-controls-react/lib/WebPartTitle';

export interface IStyledWebPartTitleProps {
    instanceId: string;
    titleFont?: string;
    titleFontSize?: number;
    titleFontColor?: string;
    webPartTitleProps: IWebPartTitleProps;
    /** Optional test ID attribute for the wrapper div */
    testId?: string;
}

// Sanitize font value by stripping characters that can break out of CSS context
const sanitizeFont = (font: string): string => (font || '').replace(/[{};<>\\"']/g, '');

// Clamp font size to the allowed slider range
const sanitizeFontSize = (size: number | undefined): number | undefined => {
    if (size === undefined) return undefined;
    const n = Number(size);
    return isNaN(n) ? undefined : Math.floor(Math.min(Math.max(n, 10), 48));
};

// Only allow hex and rgba color values
const sanitizeColor = (color: string): string =>
    /^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s,.]+\))$/.test(color || '') ? color : '';

export const StyledWebPartTitle: React.FC<IStyledWebPartTitleProps> = (props) => {
    const { instanceId, titleFont, titleFontSize, titleFontColor, webPartTitleProps, testId } = props;
    const hasCustomStyling = titleFont || titleFontSize !== undefined || titleFontColor;

    if (!hasCustomStyling) {
        return testId
            ? <div data-ui-test-id={testId}><WebPartTitle {...webPartTitleProps} /></div>
            : <WebPartTitle {...webPartTitleProps} />;
    }

    const safeFont = sanitizeFont(titleFont);
    const safeFontSize = sanitizeFontSize(titleFontSize);
    const safeColor = sanitizeColor(titleFontColor);
    const titleWrapperClass = `custom-title-wrapper-${instanceId || 'default'}`;

    const styleString = `
        .${titleWrapperClass} *,
        .${titleWrapperClass} div,
        .${titleWrapperClass} span,
        .${titleWrapperClass} h2,
        .${titleWrapperClass} textarea {
            ${safeFont ? `font-family: ${safeFont} !important;` : ''}
            ${safeFontSize !== undefined ? `font-size: ${safeFontSize}px !important;` : ''}
            ${safeColor ? `color: ${safeColor} !important;` : ''}
        }
    `;

    return (
        <div className={titleWrapperClass} {...(testId ? { 'data-ui-test-id': testId } : {})}>
            <style key={`title-style-${safeFont}-${safeFontSize}-${safeColor}`}>{styleString}</style>
            <WebPartTitle {...webPartTitleProps} />
        </div>
    );
};
