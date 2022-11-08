import * as ReactDOM from "react-dom";

export const createDiv = (): HTMLDivElement => document.createElement("div");

export const internalRender = (renderReact: () => JSX.Element): HTMLElement => {
    const div = createDiv();
    // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
    ReactDOM.render(renderReact(), div);
    return div;
};