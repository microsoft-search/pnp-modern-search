import { DomPurifyHelper } from './DomPurifyHelper';

const escapeAttribute = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/=/g, '&#x3D;');

const parse = (html: string): HTMLElement =>
    new DOMParser().parseFromString(html, 'text/html').body;

describe('DomPurifyHelper web component data-* attributes', () => {
    const columns = [
        { name: 'Title', value: '<style>.title { color: red; }</style><span class="title">{{Title}}</span>' }
    ];
    const context = {
        instanceId: '8aae9799-e652-4962-8abe-b39c36b68717',
        properties: { layoutProperties: { detailsListColumns: columns } }
    };

    it('keeps JSON data-* attributes whose value contains </style> (details list column with a <style> tag)', () => {
        const html =
            `<pnp-detailslist ` +
            `data-columns-configuration="${escapeAttribute(JSON.stringify(columns))}" ` +
            `data-context="${escapeAttribute(JSON.stringify(context))}" ` +
            `data-instance-id="${context.instanceId}"></pnp-detailslist>`;

        const element = parse(DomPurifyHelper.sanitize(html)).querySelector('pnp-detailslist');

        expect(element).not.toBeNull();
        expect(JSON.parse(element.getAttribute('data-columns-configuration'))).toEqual(columns);
        expect(JSON.parse(element.getAttribute('data-context'))).toEqual(context);
        expect(element.getAttribute('data-instance-id')).toBe(context.instanceId);
    });

    it('keeps data-* attributes containing the other sequences rejected by SAFE_FOR_XML', () => {
        const values = ['a --> b', 'a --!> b', 'x]> y', '</script>', '</textarea>', '</title>', '</noscript>', '</iframe>'];

        values.forEach((value) => {
            const element = parse(
                DomPurifyHelper.sanitize(`<pnp-custom data-value="${escapeAttribute(value)}"></pnp-custom>`)
            ).querySelector('pnp-custom');

            expect(element.getAttribute('data-value')).toBe(value);
        });
    });

    it('still blocks event handlers and dangerous URI attributes on web components', () => {
        const element = parse(
            DomPurifyHelper.sanitize(
                `<pnp-custom data-ok="1" onclick="alert(1)" href="javascript:alert(1)" src="javascript:alert(1)"></pnp-custom>`
            )
        ).querySelector('pnp-custom');

        expect(element.getAttribute('data-ok')).toBe('1');
        expect(element.hasAttribute('onclick')).toBe(false);
        expect(element.hasAttribute('href')).toBe(false);
        expect(element.hasAttribute('src')).toBe(false);
    });

    it('does not preserve such values on regular HTML elements', () => {
        const element = parse(
            DomPurifyHelper.sanitize(`<div data-value="${escapeAttribute('</style><img src=x onerror=alert(1)>')}"></div>`)
        ).querySelector('div');

        expect(element).not.toBeNull();
        expect(element.hasAttribute('data-value')).toBe(false);
    });

    it('does not preserve such values on custom elements inside SVG foreign content', () => {
        const sanitized = DomPurifyHelper.sanitize(
            `<svg><style><pnp-custom data-value="${escapeAttribute('</style><img src=x onerror=alert(1)>')}"></pnp-custom></style></svg>`
        );

        expect(sanitized).not.toContain('</style><img');
        expect(sanitized).not.toContain('onerror');
    });
});
