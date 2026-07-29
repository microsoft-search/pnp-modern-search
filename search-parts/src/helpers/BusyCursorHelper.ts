const GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';

export class BusyCursorHelper {

    /**
     * Switches the page to a progress cursor straight away, before the (potentially slow)
     * filter update is processed, so the interaction feels acknowledged. The cursor is
     * reset by the filters container once the results update completes.
     */
    public static setImmediateProgressCursor(): void {
        if (!globalThis.document) {
            return;
        }

        if (globalThis.document.documentElement) {
            globalThis.document.documentElement.style.setProperty('cursor', 'progress', 'important');
        }

        if (globalThis.document.body) {
            globalThis.document.body.style.setProperty('cursor', 'progress', 'important');
        }

        if (!globalThis.document.getElementById(GLOBAL_BUSY_CURSOR_STYLE_ID)) {
            const styleElement = globalThis.document.createElement('style');
            styleElement.id = GLOBAL_BUSY_CURSOR_STYLE_ID;
            styleElement.textContent = '* { cursor: progress !important; }';
            globalThis.document.head.appendChild(styleElement);
        }
    }
}
