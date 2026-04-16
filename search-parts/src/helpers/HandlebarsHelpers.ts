import * as Handlebars from "handlebars";
import { Text } from "@microsoft/sp-core-library";
import * as strings from "CommonStrings";
import { isEmpty, uniqBy, uniq } from "@microsoft/sp-lodash-subset";
import { UrlHelper } from "./UrlHelper";
import { ObjectHelper } from "./ObjectHelper";

/**
 * Internalized subset of handlebars-helpers.
 *
 * Only the helpers actually used by the project are included.
 * This eliminates the heavyweight `handlebars-helpers` package
 * and its transitive dependency on `moment`.
 *
 * Original source: https://github.com/helpers/handlebars-helpers (MIT)
 *
 * Helper categories included:
 *  - comparison: and, or, not, eq, is, isnt, gt, gte, lt, lte, compare, contains, has, default, neither, startsWith
 *  - string: split, trim, startsWith
 *  - object: JSONstringify, JSONparse
 *  - array: sort, itemAt
 *  - url: urlParse
 *  - math: add, subtract, multiply, divide, ceil, floor, round, abs
 */

// ─── Tiny utility layer (replaces handlebars-utils) ───────────────────────────

function isOptions(val: any): val is { hash: Record<string, any>; fn?: (ctx: any) => string; inverse?: (ctx: any) => string } {
    return val != null && typeof val === 'object' && typeof val.hash === 'object';
}

function isBlock(options: any): options is { fn: (ctx: any) => string; inverse: (ctx: any) => string } {
    return isOptions(options) && typeof options.fn === 'function' && typeof options.inverse === 'function';
}

/** Return block/inverse/raw value depending on whether this is used as a block helper */
function value(val: any, context: any, options: any): any {
    if (isOptions(context)) { options = context; context = {}; }
    if (isBlock(options)) {
        return val ? options.fn(context) : options.inverse(context);
    }
    return val;
}

function isString(val: any): val is string {
    return typeof val === 'string';
}

function isNumber(val: any): boolean {
    if (typeof val === 'number') return val - val === 0;
    if (typeof val === 'string' && val.trim() !== '') return Number.isFinite(Number(val));
    return false;
}

function contains(collection: any, target: any, startIndex?: number): boolean {
    if (collection == null || target == null) return false;
    if (typeof collection.indexOf === 'function') return collection.indexOf(target, startIndex) !== -1;
    return false;
}

// ─── Comparison helpers ───────────────────────────────────────────────────────

function helperAnd(this: any, ...args: any[]): any {
    const options = args.pop();
    return value(args.every(Boolean), this, options);
}

function helperOr(this: any, ...args: any[]): any {
    const options = args.pop();
    return value(args.some(Boolean), this, options);
}

function helperNot(this: any, val: any, options: any): any {
    return value(!val, this, options);
}

function helperEq(this: any, a: any, b: any, options: any): any {
    if (arguments.length === 2) { options = b; b = options.hash.compare; }
    return value(a === b, this, options);
}

function helperIs(this: any, a: any, b: any, options: any): any {
    if (arguments.length === 2) { options = b; b = options.hash.compare; }
    // eslint-disable-next-line eqeqeq
    return value(a == b, this, options);
}

function helperIsnt(this: any, a: any, b: any, options: any): any {
    if (arguments.length === 2) { options = b; b = options.hash.compare; }
    // eslint-disable-next-line eqeqeq
    return value(a != b, this, options);
}

function helperGt(this: any, a: any, b: any, options: any): any {
    if (arguments.length === 2) { options = b; b = options.hash.compare; }
    return value(a > b, this, options);
}

function helperGte(this: any, a: any, b: any, options: any): any {
    if (arguments.length === 2) { options = b; b = options.hash.compare; }
    return value(a >= b, this, options);
}

function helperLt(this: any, a: any, b: any, options: any): any {
    if (arguments.length === 2) { options = b; b = options.hash.compare; }
    return value(a < b, this, options);
}

function helperLte(this: any, a: any, b: any, options: any): any {
    if (arguments.length === 2) { options = b; b = options.hash.compare; }
    return value(a <= b, this, options);
}

function helperCompare(this: any, a: any, operator: string, b: any, options: any): any {
    if (arguments.length < 4) throw new Error('{{compare}} expects 4 arguments');
    let result: boolean;
    switch (operator) {
        // eslint-disable-next-line eqeqeq
        case '==': result = a == b; break;
        case '===': result = a === b; break;
        // eslint-disable-next-line eqeqeq
        case '!=': result = a != b; break;
        case '!==': result = a !== b; break;
        case '<': result = a < b; break;
        case '>': result = a > b; break;
        case '<=': result = a <= b; break;
        case '>=': result = a >= b; break;
        case 'typeof': result = typeof a === b; break;
        default: throw new Error(`{{compare}}: invalid operator: \`${operator}\``);
    }
    return value(result, this, options);
}

function helperContains(this: any, collection: any, val: any, startIndex: any, options: any): any {
    if (typeof startIndex === 'object') { options = startIndex; startIndex = undefined; }
    return value(contains(collection, val, startIndex), this, options);
}

function helperHas(this: any, val: any, pattern: any, options: any): any {
    if (isOptions(val)) { options = val; pattern = null; val = null; }
    if (isOptions(pattern)) { options = pattern; pattern = null; }
    if (val === null) return value(false, this, options);
    if (arguments.length === 2) return value(val != null, this, options);
    if ((Array.isArray(val) || isString(val)) && isString(pattern)) {
        if (val.indexOf(pattern) > -1) return isBlock(options) ? options.fn(this) : true;
    }
    if (val != null && typeof val === 'object' && isString(pattern) && pattern in val) {
        return isBlock(options) ? options.fn(this) : true;
    }
    return isBlock(options) ? options.inverse(this) : false;
}

function helperDefault(this: any, ...args: any[]): any {
    for (let i = 0; i < args.length - 1; i++) {
        if (args[i] != null) return args[i];
    }
    return '';
}

function helperNeither(this: any, a: any, b: any, options: any): any {
    return value(!a && !b, this, options);
}

function helperUnlessEq(this: any, a: any, b: any, options: any): any {
    if (isOptions(b)) { options = b; b = options.hash.compare; }
    return value(a !== b, this, options);
}

function helperUnlessGt(this: any, a: any, b: any, options: any): any {
    if (isOptions(b)) { options = b; b = options.hash.compare; }
    return value(a <= b, this, options);
}

function helperUnlessLt(this: any, a: any, b: any, options: any): any {
    if (isOptions(b)) { options = b; b = options.hash.compare; }
    return value(a >= b, this, options);
}

function helperUnlessGteq(this: any, a: any, b: any, options: any): any {
    if (isOptions(b)) { options = b; b = options.hash.compare; }
    return value(a < b, this, options);
}

function helperUnlessLteq(this: any, a: any, b: any, options: any): any {
    if (isOptions(b)) { options = b; b = options.hash.compare; }
    return value(a > b, this, options);
}

function helperIfEven(this: any, num: any, options: any): any {
    return value(isNumber(num) && Number(num) % 2 === 0, this, options);
}

function helperIfOdd(this: any, num: any, options: any): any {
    return value(isNumber(num) && Number(num) % 2 !== 0, this, options);
}

function helperIfNth(this: any, a: any, b: any, options: any): any {
    return value(isNumber(a) && isNumber(b) && Number(b) % Number(a) === 0, this, options);
}

function helperIsFalsey(this: any, val: any, options: any): any {
    return value(!val, this, options);
}

function helperIsTruthy(this: any, val: any, options: any): any {
    return value(!!val, this, options);
}

// ─── String helpers ───────────────────────────────────────────────────────────

function helperSplit(_str: any, ch: any): any {
    if (!isString(_str)) return '';
    if (!isString(ch)) ch = ',';
    return _str.split(ch);
}

function helperTrim(str: any): string {
    return typeof str === 'string' ? str.trim() : '';
}

function helperStartsWith(this: any, prefix: string, str: string, options: any): any {
    if (isString(str) && str.indexOf(prefix) === 0) {
        return options.fn(this);
    }
    return typeof options.inverse === 'function' ? options.inverse(this) : '';
}

// ─── Object helpers ───────────────────────────────────────────────────────────

function helperJSONstringify(obj: any, indent: any): string {
    if (!isNumber(indent)) indent = 0;
    return JSON.stringify(obj, null, indent);
}

function helperJSONparse(str: string): any {
    return JSON.parse(str);
}

// ─── Array helpers ────────────────────────────────────────────────────────────

function helperSort(array: any[], options: any): any {
    if (!Array.isArray(array)) return '';
    if (options && options.hash && options.hash.reverse) {
        return array.slice().sort().reverse();
    }
    return array.slice().sort();
}

function helperItemAt(array: any, idx: any): any {
    if (typeof array === 'function') array = array();
    if (!Array.isArray(array)) return undefined;
    idx = isNumber(idx) ? Number(idx) : 0;
    return idx < 0 ? array[array.length + idx] : array[idx];
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

function helperUrlParse(str: string): any {
    try { return new URL(str); } catch { return {}; }
}

// ─── Group-by helper (replaces handlebars-group-by package) ───────────────────

function deepGet(obj: any, prop: string): any {
    const parts = prop.split('.');
    const last = parts.pop()!;
    for (const part of parts) {
        obj = obj?.[part];
        if (obj == null) return undefined;
    }
    return obj?.[last];
}

/**
 * Block helper that groups an array by a property.
 * Usage: {{#group items by="category"}}...{{value}} {{items}}...{{/group}}
 */
function helperGroup(this: any, list: any[], options: any): string {
    const fn = options?.fn || (() => '');
    const inverse = options?.inverse || (() => '');
    const prop = options?.hash?.by;

    if (!prop || !list || !list.length) return inverse(this);

    const keys: string[] = [];
    const groups: Record<string, { value: string; items: any[] }> = {};

    for (const item of list) {
        const key = String(deepGet(item, prop) ?? '');
        if (keys.indexOf(key) === -1) keys.push(key);
        if (!groups[key]) groups[key] = { value: key, items: [] };
        groups[key].items.push(item);
    }

    return keys.reduce((buf, key) => buf + fn(groups[key]), '');
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function helperAdd(a: any, b: any): number { return Number(a) + Number(b); }
function helperSubtract(a: any, b: any): number { return Number(a) - Number(b); }
function helperMultiply(a: any, b: any): number { return Number(a) * Number(b); }
function helperDivide(a: any, b: any): number { return Number(a) / Number(b); }
function helperCeil(a: any): number { return Math.ceil(Number(a)); }
function helperFloor(a: any): number { return Math.floor(Number(a)); }
function helperRound(a: any): number { return Math.round(Number(a)); }
function helperAbs(a: any): number { return Math.abs(Number(a)); }

// ─── Custom project helpers (moved from TemplateService) ──────────────────────

function helperTruncateContext(context: any): any {
    const { data, ...newContext } = context;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { items, ...newData } = data;
    newContext.data = newData;
    return newContext;
}

function helperGetGraphPreviewUrl(url: any, _context?: any): any {
    return new Handlebars.SafeString(UrlHelper.getGraphPreviewUrl(url));
}

function helperGetCountMessage(totalRows: string, inputQuery?: string): any {
    let countResultMessage: string;
    if (inputQuery) {
        const safeQuery = Handlebars.escapeExpression(inputQuery);
        countResultMessage = Text.format(
            strings.HandlebarsHelpers.CountMessageLong,
            totalRows,
            safeQuery
        );
    } else {
        countResultMessage = Text.format(
            strings.HandlebarsHelpers.CountMessageShort,
            totalRows
        );
    }
    return new Handlebars.SafeString(countResultMessage);
}

function helperGetSummary(hitHighlightedSummary: string): any {
    if (!isEmpty(hitHighlightedSummary)) {
        return new Handlebars.SafeString(
            hitHighlightedSummary
                .replace(/<c0\>/g, "<strong>")
                .replace(/<\/c0\>/g, "</strong>")
                .replace(/<ddd\/>/g, "&#8230;")
                .replace(
                    /[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/g,
                    ""
                )
        );
    }
}

function helperGetTagName(tag: string): any {
    if (!isEmpty(tag)) {
        return new Handlebars.SafeString(tag.split("|").pop());
    }
}

function helperGetUrlField(urlField: string, fieldValue: "URL" | "Title"): any {
    if (!isEmpty(urlField)) {
        const separatorPos = urlField.indexOf(",");
        if (separatorPos === -1) {
            return urlField;
        }
        if (fieldValue === "URL") {
            return urlField.substr(0, separatorPos);
        }
        return urlField.substr(separatorPos + 1).trim();
    }
    return new Handlebars.SafeString(urlField);
}

function helperGetUniqueCount(array: any[], property: string): number {
    if (!Array.isArray(array)) return 0;
    if (array.length === 0) return 0;
    return (property ? uniqBy(array, property) : uniq(array)).length;
}

function helperGetUnique(array: any[], property: string): any {
    if (!Array.isArray(array)) return 0;
    if (array.length === 0) return 0;
    return property ? uniqBy(array, property) : uniq(array);
}

function helperTimes(n: number, block: any): string {
    let accumulator = "";
    for (let i = 0; i < n; ++i) accumulator += block.fn(i);
    return accumulator;
}

function helperGetUrlParameter(name: string, url?: any): string {
    if (!url || typeof url === "object") {
        url = window.location.href;
    }
    const search = new URL(url).search;
    const queryParameters = new URLSearchParams(search);
    return Handlebars.escapeExpression(queryParameters.get(name));
}

function helperRegex(regx: string, str: string): string {
    const rx = new RegExp(regx);
    const match = rx.exec(str);
    if (!match || match.length === 0) return "-";
    return match[0];
}

function helperSlot(item: any, propertyPath: string): any {
    if (propertyPath && !isEmpty(propertyPath)) {
        return ObjectHelper.byPath(item, propertyPath);
    }
}

function helperGetUserEmail(expr: string): any {
    if (!isEmpty(expr)) {
        const matches = expr.match(
            /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/gi
        );
        if (matches) {
            return matches[0];
        } else {
            return expr;
        }
    }
}

function helperGetAttachments(attachmentValue: string, options: any): string {
    let out = "";
    if (!isEmpty(attachmentValue)) {
        const splitArr: string[] = attachmentValue.split(/\n+/);
        if (splitArr && splitArr.length > 0) {
            let index = 0;
            for (const item of splitArr) {
                const pos = item.lastIndexOf("/");
                if (pos !== -1) {
                    const fileName = item.substring(pos + 1);
                    out += options.fn({ url: item, fileName, index });
                    index++;
                }
            }
        }
    }
    return out;
}

function helperIsItemSelected(selectedKeys: any[], itemIndex: any, options: any): boolean {
    if (Array.isArray(selectedKeys) && selectedKeys.length > 0) {
        return selectedKeys.indexOf(
            `${options.data.root.paging.currentPageNumber}${itemIndex}`
        ) !== -1;
    }
    return false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a dictionary of all internalized helpers.
 * Drop-in replacement for the old `handlebarsHelpers()` call.
 */
export function getHandlebarsHelpers(): Record<string, (...args: any[]) => any> {
    return {
        // comparison
        and: helperAnd,
        or: helperOr,
        not: helperNot,
        eq: helperEq,
        is: helperIs,
        isnt: helperIsnt,
        gt: helperGt,
        gte: helperGte,
        lt: helperLt,
        lte: helperLte,
        compare: helperCompare,
        contains: helperContains,
        has: helperHas,
        default: helperDefault,
        neither: helperNeither,
        unlessEq: helperUnlessEq,
        unlessGt: helperUnlessGt,
        unlessLt: helperUnlessLt,
        unlessGteq: helperUnlessGteq,
        unlessLteq: helperUnlessLteq,
        ifEven: helperIfEven,
        ifOdd: helperIfOdd,
        ifNth: helperIfNth,
        isFalsey: helperIsFalsey,
        isTruthy: helperIsTruthy,

        // string
        split: helperSplit,
        trim: helperTrim,
        startsWith: helperStartsWith,

        // object
        JSONstringify: helperJSONstringify,
        JSONparse: helperJSONparse,

        // array
        sort: helperSort,
        itemAt: helperItemAt,

        // group-by
        group: helperGroup,

        // url
        urlParse: helperUrlParse,

        // math
        add: helperAdd,
        subtract: helperSubtract,
        multiply: helperMultiply,
        divide: helperDivide,
        ceil: helperCeil,
        floor: helperFloor,
        round: helperRound,
        abs: helperAbs,

        // custom (moved from TemplateService)
        truncateContext: helperTruncateContext,
        getGraphPreviewUrl: helperGetGraphPreviewUrl,
        getCountMessage: helperGetCountMessage,
        getSummary: helperGetSummary,
        getTagName: helperGetTagName,
        getUrlField: helperGetUrlField,
        getUniqueCount: helperGetUniqueCount,
        getUnique: helperGetUnique,
        times: helperTimes,
        getUrlParameter: helperGetUrlParameter,
        regex: helperRegex,
        slot: helperSlot,
        getUserEmail: helperGetUserEmail,
        getAttachments: helperGetAttachments,
        isItemSelected: helperIsItemSelected,
    };
}
