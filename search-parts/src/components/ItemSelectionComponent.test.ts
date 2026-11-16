jest.mock('./ItemSelectionComponent.module.scss', () => ({
    root: 'selection-root',
    selected: 'selected'
}), { virtual: true });
jest.mock('@pnp/modern-search-extensibility', () => ({
    BaseWebComponent: class extends HTMLElement {
        protected resolveAttributes() {
            return {
                enabled: true,
                index: this.getAttribute('data-index'),
                isSelected: this.getAttribute('data-is-selected') === 'true'
            };
        }
    }
}));
jest.mock('@fluentui/react', () => ({ Check: () => null }));

import { ItemSelectionWebComponent } from './ItemSelectionComponent';

describe('ItemSelectionWebComponent scrolling', () => {
    const components: ItemSelectionWebComponent[] = [];

    beforeAll(() => {
        customElements.define('test-item-selection', ItemSelectionWebComponent);
    });

    afterEach(() => {
        components.forEach(component => component['onDispose']());
        components.length = 0;
    });

    async function renderItem(index: number, selected: boolean): Promise<jest.Mock> {
        const component = new ItemSelectionWebComponent();
        components.push(component);
        component.setAttribute('data-index', index.toString());
        component.setAttribute('data-is-selected', selected.toString());
        component.innerHTML = '<template id="content"><span>Result</span></template>';
        const scrollIntoView = jest.fn();
        component.scrollIntoView = scrollIntoView;

        await component.connectedCallback();

        expect(component.querySelector('[data-selection-index]')?.getAttribute('data-selection-index')).toBe(index.toString());
        expect(component.querySelector('.selected') !== null).toBe(selected);
        expect(component.textContent).toBe('Result');
        return scrollIntoView;
    }

    it('renders the first selected item without scrolling', async () => {
        const scrollIntoView = await renderItem(0, true);

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('does not scroll any item when the template is rebuilt for another selection', async () => {
        const scrollCalls = await Promise.all([
            renderItem(0, true),
            renderItem(1, true),
            renderItem(2, false)
        ]);

        scrollCalls.forEach(scrollIntoView => expect(scrollIntoView).not.toHaveBeenCalled());
    });
});
