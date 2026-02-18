/**
 * Extended handlebars helpers — lazy-loaded webpack chunk.
 *
 * Loaded on first template render to minimize initial bundle size.
 * Core helpers (~40) are in HandlebarsHelpers.ts and registered synchronously.
 * This file adds ~120 additional helpers covering all browser-safe categories
 * from the original handlebars-helpers package.
 *
 * Categories included:
 *   array, code, collection, date (dayjs), html, i18n, inflection, match,
 *   math, misc, number, object, regex, string, url
 *
 * Excluded per docs: logging, markdown
 * Excluded (Node.js only): fs, path
 *
 * Original source: https://github.com/helpers/handlebars-helpers (MIT)
 */

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// ─── Shared utility layer ─────────────────────────────────────────────────────

function isOptions(
    val: any
): val is {
    hash: Record<string, any>;
    fn?: (ctx: any) => string;
    inverse?: (ctx: any) => string;
} {
    return val != null && typeof val === "object" && typeof val.hash === "object";
}

function isBlock(
    options: any
): options is { fn: (ctx: any) => string; inverse: (ctx: any) => string } {
    return (
        isOptions(options) &&
        typeof options.fn === "function" &&
        typeof options.inverse === "function"
    );
}

function value(val: any, context: any, options: any): any {
    if (isOptions(context)) {
        options = context;
        context = {};
    }
    if (isBlock(options)) {
        return val ? options.fn(context) : options.inverse(context);
    }
    return val;
}

function isString(val: any): val is string {
    return typeof val === "string";
}

function isNum(val: any): boolean {
    if (typeof val === "number") return val - val === 0;
    if (typeof val === "string" && val.trim() !== "")
        return Number.isFinite(Number(val));
    return false;
}

// ─── Array helpers ────────────────────────────────────────────────────────────

function helperAfter(array: any[], n: any): any[] {
    if (!Array.isArray(array)) return [];
    return array.slice(Number(n));
}

function helperArrayify(val: any): any[] {
    if (val == null) return [];
    return Array.isArray(val) ? val : [val];
}

function helperBefore(array: any[], n: any): any[] {
    if (!Array.isArray(array)) return [];
    return array.slice(0, -Number(n));
}

function helperEachIndex(array: any[], options: any): string {
    let result = "";
    if (Array.isArray(array)) {
        for (let i = 0; i < array.length; i++) {
            result += options.fn({ item: array[i], index: i });
        }
    }
    return result;
}

function helperFilter(array: any[], val: any, options: any): string {
    if (!Array.isArray(array)) return "";
    const prop = options?.hash?.property;
    const filtered = array.filter((item) =>
        prop ? item?.[prop] === val : item === val
    );
    let result = "";
    for (const item of filtered) result += options.fn(item);
    return result;
}

function helperFirst(array: any[], n: any): any {
    if (!Array.isArray(array)) return "";
    if (!isNum(n)) return array[0];
    return array.slice(0, Number(n));
}

function helperForEach(array: any[], options: any): string {
    let result = "";
    if (Array.isArray(array)) {
        for (let i = 0; i < array.length; i++) {
            result += options.fn(array[i], {
                data: { index: i, first: i === 0, last: i === array.length - 1 },
            });
        }
    }
    return result;
}

function helperInArray(this: any, array: any[], val: any, options: any): any {
    if (isOptions(val)) {
        options = val;
        val = undefined;
    }
    if (!Array.isArray(array))
        return isBlock(options) ? options.inverse(this) : false;
    return value(array.indexOf(val) > -1, this, options);
}

function helperIsArray(this: any, val: any, options: any): any {
    return value(Array.isArray(val), this, options);
}

function helperJoin(array: any[], separator: any): string {
    if (!Array.isArray(array)) return "";
    if (typeof separator !== "string") separator = ", ";
    return array.join(separator);
}

function helperEqualsLength(
    this: any,
    val: any,
    length: any,
    options: any
): any {
    if (Array.isArray(val))
        return value(val.length === Number(length), this, options);
    if (isString(val))
        return value(val.length === Number(length), this, options);
    return value(false, this, options);
}

function helperLast(array: any[], n: any): any {
    if (!Array.isArray(array)) return "";
    if (!isNum(n)) return array[array.length - 1];
    return array.slice(-Number(n));
}

function helperLength(val: any): number {
    if (Array.isArray(val)) return val.length;
    if (isString(val)) return val.length;
    if (val != null && typeof val === "object") return Object.keys(val).length;
    return 0;
}

function helperLengthEqual(
    this: any,
    val: any,
    length: any,
    options: any
): any {
    return helperEqualsLength.call(this, val, length, options);
}

function helperMap(array: any[], prop: any): any[] {
    if (!Array.isArray(array)) return [];
    if (typeof prop === "string") return array.map((item) => item?.[prop]);
    return array;
}

function helperPluck(array: any[], prop: string): any[] {
    if (!Array.isArray(array)) return [];
    return array.map((item) => item?.[prop]);
}

function helperReverse(val: any): any {
    if (Array.isArray(val)) return val.slice().reverse();
    if (isString(val)) return val.split("").reverse().join("");
    return val;
}

function helperSome(this: any, array: any[], cb: any, options: any): any {
    if (isOptions(cb)) {
        options = cb;
        cb = undefined;
    }
    if (!Array.isArray(array))
        return isBlock(options) ? options.inverse(this) : false;

    const result =
        typeof cb === "function"
            ? array.some((item, i) => cb(item, i, array))
            : array.some(Boolean);

    if (isBlock(options)) return result ? options.fn(this) : options.inverse(this);
    return result;
}

function helperSortBy(array: any[], ...args: any[]): any[] {
    if (!Array.isArray(array)) return [];
    const options = args.pop();
    const prop = args[0];
    const sorted = array.slice();
    if (typeof prop === "string") {
        sorted.sort((a, b) => {
            const va = a?.[prop];
            const vb = b?.[prop];
            if (va < vb) return -1;
            if (va > vb) return 1;
            return 0;
        });
    } else if (typeof prop === "function") {
        sorted.sort(prop);
    } else {
        sorted.sort();
    }
    if (options?.hash?.reverse) sorted.reverse();
    return sorted;
}

function helperWithAfter(array: any[], idx: any, options: any): string {
    if (!Array.isArray(array)) return "";
    return array
        .slice(Number(idx))
        .map((item) => options.fn(item))
        .join("");
}

function helperWithBefore(array: any[], idx: any, options: any): string {
    if (!Array.isArray(array)) return "";
    return array
        .slice(0, -Number(idx))
        .map((item) => options.fn(item))
        .join("");
}

function helperWithFirst(
    this: any,
    array: any[],
    count: any,
    options: any
): string {
    if (isOptions(count)) {
        options = count;
        count = 1;
    }
    if (!Array.isArray(array) || array.length === 0)
        return options?.inverse?.(this) ?? "";
    return array
        .slice(0, Number(count) || 1)
        .map((item) => options.fn(item))
        .join("");
}

function helperWithGroup(array: any[], size: any, options: any): string {
    if (!Array.isArray(array)) return "";
    let result = "";
    const n = Number(size) || 1;
    for (let i = 0; i < array.length; i += n) {
        result += options.fn(array.slice(i, i + n));
    }
    return result;
}

function helperWithLast(
    this: any,
    array: any[],
    count: any,
    options: any
): string {
    if (isOptions(count)) {
        options = count;
        count = 1;
    }
    if (!Array.isArray(array) || array.length === 0)
        return options?.inverse?.(this) ?? "";
    return array
        .slice(-(Number(count) || 1))
        .map((item) => options.fn(item))
        .join("");
}

function helperWithSort(
    this: any,
    array: any[],
    prop: any,
    options: any
): string {
    if (isOptions(prop)) {
        options = prop;
        prop = undefined;
    }
    if (!Array.isArray(array)) return "";
    const sorted = array.slice();
    if (typeof prop === "string") {
        sorted.sort((a, b) => {
            const va = a?.[prop];
            const vb = b?.[prop];
            return va < vb ? -1 : va > vb ? 1 : 0;
        });
    } else {
        sorted.sort();
    }
    return sorted.map((item) => options.fn(item)).join("");
}

function helperUnique(array: any[], options: any): any[] {
    if (!Array.isArray(array)) return [];
    const prop = options?.hash?.property;
    if (prop) {
        const seen = new Set();
        return array.filter((item) => {
            const key = item?.[prop];
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    return Array.from(new Set(array));
}

// ─── Code helpers (browser-safe only) ─────────────────────────────────────────

function helperGist(id: string): string {
    return `<script src="https://gist.github.com/${id}.js"></script>`;
}

function helperJsfiddle(options: any): string {
    const h = options?.hash || {};
    const id = h.id || "";
    const tabs = h.tabs || "result,js,html,css";
    const skin = h.skin || "light";
    const height = h.height || "300";
    const width = h.width || "100%";
    return `<iframe width="${width}" height="${height}" src="https://jsfiddle.net/${id}/embedded/${tabs}/${skin}/"></iframe>`;
}

// ─── Collection helpers ───────────────────────────────────────────────────────

function helperIsEmpty(this: any, val: any, options: any): any {
    if (Array.isArray(val) && val.length === 0)
        return value(true, this, options);
    if (val != null && typeof val === "object" && Object.keys(val).length === 0)
        return value(true, this, options);
    if (val == null || val === "" || val === false)
        return value(true, this, options);
    return value(false, this, options);
}

function helperIterate(obj: any, options: any): string {
    if (obj == null) return "";
    let result = "";
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            result += options.fn(obj[i], {
                data: { index: i, key: i, first: i === 0, last: i === obj.length - 1 },
            });
        }
    } else if (typeof obj === "object") {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            result += options.fn(obj[keys[i]], {
                data: {
                    key: keys[i],
                    index: i,
                    first: i === 0,
                    last: i === keys.length - 1,
                },
            });
        }
    }
    return result;
}

// ─── Date helpers (dayjs-backed) ──────────────────────────────────────────────

function helperYear(): number {
    return new Date().getFullYear();
}

function helperDateFmt(str: any, pattern: any): string {
    if (isOptions(pattern)) pattern = "MMMM DD, YYYY";
    if (isOptions(str)) {
        str = undefined;
        pattern = "MMMM DD, YYYY";
    }
    const d = str ? dayjs(str) : dayjs();
    if (!d.isValid()) return String(str ?? "");
    return d.format(pattern);
}

/**
 * Exposes dayjs (moment-compatible) with hash-based chaining.
 * Usage: {{moment "2024-01-15" format="LL"}}
 *        {{moment subtract="7 days" format="YYYY-MM-DD"}}
 *        {{moment "2024-01-15" fromNow=true}}
 */
function helperMomentCompat(...args: any[]): any {
    const options = args[args.length - 1];
    if (isOptions(options)) args.pop();
    const hash = options?.hash || {};

    let d = args.length > 0 ? dayjs(args[0]) : dayjs();

    if (hash.add) {
        const parts = String(hash.add).split(/\s+/);
        d = d.add(Number(parts[0]), parts[1] as dayjs.ManipulateType);
    }
    if (hash.subtract) {
        const parts = String(hash.subtract).split(/\s+/);
        d = d.subtract(Number(parts[0]), parts[1] as dayjs.ManipulateType);
    }

    if (hash.fromNow) return d.fromNow();
    if (hash.utc) return d.toISOString();
    return d.format(hash.format || "MMMM DD, YYYY");
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function helperAttr(options: any): string {
    const hash = options?.hash || {};
    return Object.entries(hash)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
}

function helperCss(array: any, options: any): string {
    if (isOptions(array)) {
        options = array;
        array = [];
    }
    if (isString(array)) array = [array];
    if (!Array.isArray(array)) return "";
    const rel = options?.hash?.rel || "stylesheet";
    return array
        .map(
            (href: string) =>
                `<link type="text/css" rel="${rel}" href="${isString(href) ? href : (href as any).href}">`
        )
        .join("\n");
}

function helperJs(array: any, options: any): string {
    if (isOptions(array)) {
        options = array;
        array = [];
    }
    if (isString(array)) array = [array];
    if (!Array.isArray(array)) return "";
    return array.map((src: string) => `<script src="${src}"></script>`).join("\n");
}

function helperSanitize(str: string): string {
    if (!isString(str)) return "";
    return str.replace(/<\/?[^>]+(>|$)/g, "");
}

function helperUl(array: any[], options: any): string {
    if (!Array.isArray(array)) return "";
    const cls = options?.hash?.class ? ` class="${options.hash.class}"` : "";
    const items = array
        .map(
            (item) =>
                `  <li>${options?.fn ? options.fn(item) : String(item)}</li>`
        )
        .join("\n");
    return `<ul${cls}>\n${items}\n</ul>`;
}

function helperOl(array: any[], options: any): string {
    if (!Array.isArray(array)) return "";
    const cls = options?.hash?.class ? ` class="${options.hash.class}"` : "";
    const items = array
        .map(
            (item) =>
                `  <li>${options?.fn ? options.fn(item) : String(item)}</li>`
        )
        .join("\n");
    return `<ol${cls}>\n${items}\n</ol>`;
}

function helperThumbnailImage(options: any): string {
    const h = options?.hash || {};
    let img = `<img src="${h.src || ""}" alt="${h.alt || ""}"`;
    if (h.width) img += ` width="${h.width}"`;
    if (h.height) img += ` height="${h.height}"`;
    return img + ">";
}

// ─── i18n helper ──────────────────────────────────────────────────────────────

function helperI18n(key: string, options: any): string {
    const language = options?.hash?.language || "en";
    const data = options?.data?.root?.i18n;
    if (data?.[language]?.[key]) return data[language][key];
    return key;
}

// ─── Inflection helpers ───────────────────────────────────────────────────────

function helperInflect(
    count: any,
    singular: string,
    plural: string,
    includeCount: any
): string {
    const n = Number(count);
    const word = n === 1 ? singular : plural;
    return includeCount === true || includeCount === "true"
        ? `${n} ${word}`
        : word;
}

function helperOrdinalize(num: any): string {
    const n = Math.abs(Math.round(Number(num)));
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// ─── Match helpers (basic glob matching, no micromatch dependency) ─────────────

function globToRegex(pattern: string): RegExp {
    const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*\*/g, "{{GLOBSTAR}}")
        .replace(/\*/g, "[^/]*")
        .replace(/\?/g, "[^/]")
        .replace(/\{\{GLOBSTAR\}\}/g, ".*");
    return new RegExp(`^${escaped}$`);
}

function helperMatch(
    this: any,
    val: string,
    pattern: string,
    options: any
): any {
    if (!isString(val) || !isString(pattern)) return [];
    const result = globToRegex(pattern).test(val) ? [val] : [];
    if (isBlock(options))
        return result.length ? options.fn(this) : options.inverse(this);
    return result;
}

function helperIsMatch(
    this: any,
    val: string,
    pattern: string,
    options: any
): any {
    if (!isString(val) || !isString(pattern))
        return value(false, this, options);
    return value(globToRegex(pattern).test(val), this, options);
}

// ─── Math helpers (extended — core has add/subtract/multiply/divide/ceil/floor/round/abs) ─

function helperAvg(...args: any[]): number {
    args.pop(); // options
    const flat =
        args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    const nums = flat.map(Number).filter((n: number) => !isNaN(n));
    return nums.length ? nums.reduce((a: number, b: number) => a + b, 0) / nums.length : 0;
}

function helperModulo(a: any, b: any): number {
    return Number(a) % Number(b);
}

function helperRandom(min: any, max: any): number {
    const lo = Number(min) || 0;
    const hi = Number(max) || 1;
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function helperSum(...args: any[]): number {
    args.pop(); // options
    const flat =
        args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    return flat.reduce((a: number, b: any) => a + Number(b), 0);
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function helperFrame(options: any): string {
    return options?.fn?.(options?.data) ?? "";
}

function helperOption(prop: string, options: any): any {
    const hash = options?.hash || {};
    if (prop in hash) return hash[prop];
    return options?.data?.root?.[prop] ?? "";
}

function helperNoop(this: any, options: any): string {
    return options?.fn?.(this) ?? "";
}

function helperTypeOf(val: any): string {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    return typeof val;
}

function helperWithHash(this: any, options: any): string {
    if (options?.hash && Object.keys(options.hash).length) {
        return options.fn(options.hash);
    }
    return options?.inverse?.(this) ?? "";
}

// ─── Number helpers ───────────────────────────────────────────────────────────

function helperBytes(num: any, ...args: any[]): string {
    const options = args.pop();
    const precision =
        args[0] != null ? Number(args[0]) : (options?.hash?.precision ?? 2);
    const n = Number(num);
    if (isNaN(n) || !isFinite(n)) return "0 B";
    if (n === 0) return "0 B";
    const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const exp = Math.min(
        Math.floor(Math.log(Math.abs(n)) / Math.log(1024)),
        units.length - 1
    );
    if (exp === 0) return `${n} ${units[0]}`;
    return `${(n / Math.pow(1024, exp)).toFixed(precision)} ${units[exp]}`;
}

function helperAddCommas(num: any): string {
    const n = Number(num);
    if (isNaN(n)) return String(num);
    return n.toLocaleString("en-US");
}

function helperPhoneNumber(num: any): string {
    const str = String(num).replace(/\D/g, "");
    if (str.length === 10)
        return `(${str.slice(0, 3)}) ${str.slice(3, 6)}-${str.slice(6)}`;
    if (str.length === 11)
        return `${str[0]} (${str.slice(1, 4)}) ${str.slice(4, 7)}-${str.slice(7)}`;
    return String(num);
}

function helperToAbbr(num: any, precision: any): string {
    const p = isNum(precision) ? Number(precision) : 1;
    const n = Number(num);
    if (isNaN(n)) return String(num);
    if (n >= 1e12) return `${(n / 1e12).toFixed(p)}t`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(p)}b`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(p)}m`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(p)}k`;
    return String(n);
}

function helperToExponential(num: any, digits: any): string {
    const n = Number(num);
    return isNum(digits) ? n.toExponential(Number(digits)) : n.toExponential();
}

function helperToFixed(num: any, digits: any): string {
    return Number(num).toFixed(Number(digits) || 0);
}

function helperToFloat(val: any): number {
    return parseFloat(val);
}

function helperToInt(val: any): number {
    return parseInt(val, 10);
}

function helperToPrecision(num: any, precision: any): string {
    return Number(num).toPrecision(Number(precision) || undefined);
}

// ─── Object helpers (extended — core has JSONstringify/JSONparse) ──────────────

function helperExtend(...args: any[]): any {
    args.pop(); // options
    return Object.assign({}, ...args);
}

function helperForIn(obj: any, options: any): string {
    if (obj == null || typeof obj !== "object") return "";
    let result = "";
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result += options.fn({ key, value: obj[key] });
        }
    }
    return result;
}

function helperForOwn(obj: any, options: any): string {
    if (obj == null || typeof obj !== "object") return "";
    let result = "";
    for (const key of Object.keys(obj)) {
        result += options.fn({ key, value: obj[key] });
    }
    return result;
}

function helperToPath(...args: any[]): string {
    args.pop(); // options
    return args.filter(isString).join(".");
}

function helperGet(prop: string, obj: any): any {
    if (!isString(prop) || obj == null) return "";
    let current = obj;
    for (const part of prop.split(".")) {
        if (current == null) return "";
        current = current[part];
    }
    return current ?? "";
}

function helperGetObject(prop: string, obj: any): any {
    return helperGet(prop, obj);
}

function helperHasOwn(this: any, obj: any, key: string, options: any): any {
    if (isOptions(key)) {
        options = key;
        return value(false, this, options);
    }
    return value(
        obj != null && Object.prototype.hasOwnProperty.call(obj, key),
        this,
        options
    );
}

function helperIsObject(this: any, val: any, options: any): any {
    return value(
        val != null && typeof val === "object" && !Array.isArray(val),
        this,
        options
    );
}

function helperMerge(...args: any[]): any {
    args.pop(); // options
    return Object.assign({}, ...args);
}

function helperParseJSON(str: string): any {
    return JSON.parse(str);
}

function helperPick(this: any, props: any, obj: any, options: any): any {
    if (isOptions(obj)) {
        options = obj;
        obj = undefined;
    }
    const result: any = {};
    if (obj == null || typeof obj !== "object") return result;
    const keys = isString(props) ? props.split(/[, ]+/) : Array.isArray(props) ? props : [];
    for (const key of keys) {
        if (key in obj) result[key] = obj[key];
    }
    if (isBlock(options)) return options.fn(result);
    return result;
}

function helperStringify(obj: any, indent: any): string {
    return JSON.stringify(obj, null, isNum(indent) ? Number(indent) : 0);
}

// ─── Regex helpers ────────────────────────────────────────────────────────────

function helperToRegex(str: string, locals: any, options: any): RegExp {
    if (isOptions(locals)) {
        options = locals;
    }
    const flags = options?.hash?.flags || "";
    return new RegExp(str, flags);
}

function helperTest(this: any, str: string, regex: any, options: any): any {
    if (isOptions(regex)) {
        options = regex;
        regex = options.hash?.regex;
    }
    if (typeof regex === "string") regex = new RegExp(regex);
    if (!(regex instanceof RegExp)) return value(false, this, options);
    return value(regex.test(str), this, options);
}

// ─── String helpers (extended — core has split/trim/startsWith) ────────────────

function helperAppend(str: any, suffix: string): string {
    return isString(str) ? str + suffix : "";
}

function helperCamelcase(str: any): string {
    if (!isString(str)) return "";
    return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
}

function helperCapitalize(str: any): string {
    if (!isString(str)) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function helperCapitalizeAll(str: any): string {
    if (!isString(str)) return "";
    return str.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.slice(1)
    );
}

function helperCenter(str: any, spaces: any): string {
    if (!isString(str)) return "";
    const pad = " ".repeat(Number(spaces) || 0);
    return `${pad}${str}${pad}`;
}

function helperChop(str: any): string {
    if (!isString(str)) return "";
    return str.trim().replace(/\s+/g, " ");
}

function helperDashcase(str: any): string {
    if (!isString(str)) return "";
    return str
        .replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
        .replace(/[\s_]+/g, "-")
        .replace(/^-/, "");
}

function helperDotcase(str: any): string {
    if (!isString(str)) return "";
    return str
        .replace(/[A-Z]/g, (c) => `.${c.toLowerCase()}`)
        .replace(/[\s_-]+/g, ".")
        .replace(/^\./, "");
}

function helperDowncase(str: any): string {
    return isString(str) ? str.toLowerCase() : "";
}

function helperEllipsis(str: any, limit: any): string {
    if (!isString(str)) return "";
    const n = Number(limit) || str.length;
    return str.length <= n ? str : str.slice(0, n) + "\u2026";
}

function helperHyphenate(str: any): string {
    if (!isString(str)) return "";
    return str.replace(/\s+/g, "-");
}

function helperIsStringHelper(this: any, val: any, options: any): any {
    return value(typeof val === "string", this, options);
}

function helperLowercase(str: any): string {
    return isString(str) ? str.toLowerCase() : "";
}

function helperOccurrences(str: any, substring: any): number {
    if (!isString(str) || !isString(substring)) return 0;
    let count = 0;
    let pos = 0;
    while ((pos = str.indexOf(substring, pos)) !== -1) {
        count++;
        pos += substring.length;
    }
    return count;
}

function helperPascalcase(str: any): string {
    if (!isString(str)) return "";
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function helperPathcase(str: any): string {
    if (!isString(str)) return "";
    return str
        .replace(/[A-Z]/g, (c) => `/${c.toLowerCase()}`)
        .replace(/[\s_.-]+/g, "/")
        .replace(/^\//, "");
}

function helperPlusify(str: any): string {
    return isString(str) ? str.replace(/\s/g, "+") : "";
}

function helperPrepend(str: any, prefix: string): string {
    return isString(str) ? prefix + str : "";
}

function helperRaw(options: any): string {
    return options?.fn?.() ?? "";
}

function helperRemove(str: any, substring: any): string {
    if (!isString(str)) return "";
    return str.split(substring).join("");
}

function helperRemoveFirst(str: any, substring: any): string {
    if (!isString(str)) return "";
    const idx = str.indexOf(substring);
    if (idx === -1) return str;
    return str.slice(0, idx) + str.slice(idx + String(substring).length);
}

function helperReplace(str: any, a: any, b: any): string {
    if (!isString(str)) return "";
    if (isOptions(b)) b = "";
    return str.split(a).join(b);
}

function helperReplaceFirst(str: any, a: string, b: string): string {
    if (!isString(str)) return "";
    if (isOptions(b as any)) b = "";
    const idx = str.indexOf(a);
    if (idx === -1) return str;
    return str.slice(0, idx) + b + str.slice(idx + a.length);
}

function helperStringReverse(str: any): string {
    return isString(str) ? str.split("").reverse().join("") : "";
}

function helperSentence(str: any): string {
    if (!isString(str)) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function helperSnakecase(str: any): string {
    if (!isString(str)) return "";
    return str
        .replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
        .replace(/[\s-]+/g, "_")
        .replace(/^_/, "");
}

function helperTitleize(str: any): string {
    if (!isString(str)) return "";
    return str.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
}

function helperTrimLeft(str: any): string {
    return isString(str) ? str.replace(/^\s+/, "") : "";
}

function helperTrimRight(str: any): string {
    return isString(str) ? str.replace(/\s+$/, "") : "";
}

function helperTruncate(str: any, limit: any, suffix: any): string {
    if (!isString(str)) return "";
    if (isOptions(suffix)) suffix = "\u2026";
    const n = Number(limit) || str.length;
    if (str.length <= n) return str;
    return str.slice(0, n) + (suffix || "");
}

function helperTruncateWords(str: any, count: any, suffix: any): string {
    if (!isString(str)) return "";
    if (isOptions(suffix)) suffix = "\u2026";
    const words = str.split(/\s+/);
    const n = Number(count) || words.length;
    if (words.length <= n) return str;
    return words.slice(0, n).join(" ") + (suffix || "");
}

function helperUpcase(str: any): string {
    return isString(str) ? str.toUpperCase() : "";
}

function helperUppercase(str: any): string {
    return isString(str) ? str.toUpperCase() : "";
}

// ─── URL helpers (extended — core has urlParse) ───────────────────────────────

function helperEncodeURI(str: string): string {
    return encodeURIComponent(str);
}

function helperEscape(str: string): string {
    return encodeURIComponent(str);
}

function helperDecodeURI(str: string): string {
    return decodeURIComponent(str);
}

function helperUrlEncode(str: string): string {
    return encodeURIComponent(str);
}

function helperUrlDecode(str: string): string {
    return decodeURIComponent(str);
}

function helperUrlResolve(base: string, href: string): string {
    try {
        return new URL(href, base).toString();
    } catch {
        return href;
    }
}

function helperStripQuerystring(url: string): string {
    return isString(url) ? url.split("?")[0] : "";
}

function helperStripProtocol(url: string): string {
    return isString(url) ? url.replace(/^https?:\/\//, "") : "";
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a dictionary of all extended helpers.
 * Loaded as a webpack chunk and registered on first template render.
 * Does not include helpers already in core (HandlebarsHelpers.ts).
 */
export function getExtendedHandlebarsHelpers(): Record<
    string,
    (...args: any[]) => any
> {
    return {
        // ── array ──
        after: helperAfter,
        arrayify: helperArrayify,
        before: helperBefore,
        eachIndex: helperEachIndex,
        filter: helperFilter,
        first: helperFirst,
        forEach: helperForEach,
        inArray: helperInArray,
        isArray: helperIsArray,
        join: helperJoin,
        equalsLength: helperEqualsLength,
        last: helperLast,
        length: helperLength,
        lengthEqual: helperLengthEqual,
        map: helperMap,
        pluck: helperPluck,
        reverse: helperReverse,
        some: helperSome,
        sortBy: helperSortBy,
        withAfter: helperWithAfter,
        withBefore: helperWithBefore,
        withFirst: helperWithFirst,
        withGroup: helperWithGroup,
        withLast: helperWithLast,
        withSort: helperWithSort,
        unique: helperUnique,

        // ── code ──
        gist: helperGist,
        jsfiddle: helperJsfiddle,

        // ── collection ──
        isEmpty: helperIsEmpty,
        iterate: helperIterate,

        // ── date (dayjs-backed) ──
        year: helperYear,
        date: helperDateFmt,
        moment: helperMomentCompat,

        // ── html ──
        attr: helperAttr,
        css: helperCss,
        js: helperJs,
        sanitize: helperSanitize,
        ul: helperUl,
        ol: helperOl,
        thumbnailImage: helperThumbnailImage,

        // ── i18n ──
        i18n: helperI18n,

        // ── inflection ──
        inflect: helperInflect,
        ordinalize: helperOrdinalize,

        // ── match ──
        match: helperMatch,
        isMatch: helperIsMatch,

        // ── math (aliases + extended) ──
        avg: helperAvg,
        minus: (a: any, b: any): number => Number(a) - Number(b), // alias for subtract
        modulo: helperModulo,
        plus: (a: any, b: any): number => Number(a) + Number(b), // alias for add
        random: helperRandom,
        remainder: helperModulo, // alias for modulo
        sum: helperSum,

        // ── misc ──
        frame: helperFrame,
        option: helperOption,
        noop: helperNoop,
        typeOf: helperTypeOf,
        withHash: helperWithHash,

        // ── number ──
        bytes: helperBytes,
        addCommas: helperAddCommas,
        phoneNumber: helperPhoneNumber,
        toAbbr: helperToAbbr,
        toExponential: helperToExponential,
        toFixed: helperToFixed,
        toFloat: helperToFloat,
        toInt: helperToInt,
        toPrecision: helperToPrecision,

        // ── object ──
        extend: helperExtend,
        forIn: helperForIn,
        forOwn: helperForOwn,
        toPath: helperToPath,
        get: helperGet,
        getObject: helperGetObject,
        hasOwn: helperHasOwn,
        isObject: helperIsObject,
        merge: helperMerge,
        parseJSON: helperParseJSON,
        pick: helperPick,
        stringify: helperStringify,

        // ── regex ──
        toRegex: helperToRegex,
        test: helperTest,

        // ── string ──
        append: helperAppend,
        camelcase: helperCamelcase,
        capitalize: helperCapitalize,
        capitalizeAll: helperCapitalizeAll,
        center: helperCenter,
        chop: helperChop,
        dashcase: helperDashcase,
        dotcase: helperDotcase,
        downcase: helperDowncase,
        ellipsis: helperEllipsis,
        hyphenate: helperHyphenate,
        isString: helperIsStringHelper,
        lowercase: helperLowercase,
        occurrences: helperOccurrences,
        pascalcase: helperPascalcase,
        pathcase: helperPathcase,
        plusify: helperPlusify,
        prepend: helperPrepend,
        raw: helperRaw,
        remove: helperRemove,
        removeFirst: helperRemoveFirst,
        replace: helperReplace,
        replaceFirst: helperReplaceFirst,
        "reverse-string": helperStringReverse, // explicit name to avoid clash with array reverse
        sentence: helperSentence,
        snakecase: helperSnakecase,
        titleize: helperTitleize,
        trimLeft: helperTrimLeft,
        trimRight: helperTrimRight,
        truncate: helperTruncate,
        truncateWords: helperTruncateWords,
        upcase: helperUpcase,
        uppercase: helperUppercase,

        // ── url ──
        encodeURI: helperEncodeURI,
        escape: helperEscape,
        decodeURI: helperDecodeURI,
        url_encode: helperUrlEncode,
        url_decode: helperUrlDecode,
        urlResolve: helperUrlResolve,
        stripQuerystring: helperStripQuerystring,
        stripProtocol: helperStripProtocol,
    };
}
