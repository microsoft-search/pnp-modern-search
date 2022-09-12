import * as ReactDOM from "react-dom";

export const createDiv = (): HTMLDivElement => document.createElement("div");

export const internalRender = (renderReact: () => JSX.Element): HTMLElement => {
    const div = createDiv();
    ReactDOM.render(renderReact(), div);
    return div;
};