import * as ReactDOM from "react-dom";

export const createDiv = (): HTMLDivElement => document.createElement("div");

/**
 * Unmount a React tree previously rendered into a container element.
 * Safe to call even if the container was never rendered into.
 */
export const unmountReact = (container: HTMLElement | undefined): void => {
    if (container) {
        ReactDOM.unmountComponentAtNode(container);
    }
};

export const internalRender = (renderReact: () => JSX.Element, previousContainer?: HTMLElement): HTMLElement => {
    unmountReact(previousContainer);
    const div = createDiv();
    // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
    ReactDOM.render(renderReact() as any, div);
    return div;
};