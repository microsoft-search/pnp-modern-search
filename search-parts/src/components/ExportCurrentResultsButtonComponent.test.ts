jest.mock('react-dom', () => ({}));
jest.mock('@pnp/modern-search-extensibility', () => ({ BaseWebComponent: class {} }));
jest.mock('@fluentui/react', () => ({
    ActionButton: 'button',
    MessageBar: 'div',
    MessageBarType: { error: 1, warning: 2 },
    getTheme: () => ({ semanticColors: {} })
}));
jest.mock('CommonStrings', () => ({
    Controls: {
        DownloadCurrentDataAsCSVButtonText: 'Export Search result',
        ExportSearchResultsError: 'Export failed. Try again.',
        ExportSearchResultsDismissError: 'Dismiss export error',
        ExportSearchResultsMissingColumnsWarning: 'Configure export columns.',
        ExportSearchResultsInvalidColumnsWarning: 'Correct the export column configuration.'
    }
}), { virtual: true });

import { ExportCurrentResultsButtonComponent } from './ExportCurrentResultsButtonComponent';
import { CsvExportController, EXPORT_CURRENT_DATA_REQUEST_EVENT, IExportCurrentDataRequest } from '../helpers/CsvExportHelper';

describe('ExportCurrentResultsButtonComponent error feedback', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    function createComponent(controller = new CsvExportController(async () => []), isAvailable = true,
        exportColumns: string | Record<string, string> = { Title: 'Title' }): ExportCurrentResultsButtonComponent {
        controller.setAvailable(isAvailable);
        const component = new ExportCurrentResultsButtonComponent({
            items: [{ Title: 'Example' }],
            exportColumns
        });
        jest.spyOn(component, 'setState').mockImplementation(update => {
            Object.assign(component.state, update);
        });
        const host = document.createElement('div');
        const root = document.createElement('div');
        host.appendChild(root);
        host.addEventListener(EXPORT_CURRENT_DATA_REQUEST_EVENT, event => {
            (event as CustomEvent<IExportCurrentDataRequest>).detail.resolve(controller);
        });
        (component as any)._rootRef.current = root;
        component.componentDidMount();
        return component;
    }

    beforeEach(() => {
        jest.useFakeTimers();
        URL.createObjectURL = jest.fn(() => 'blob:test-export');
        URL.revokeObjectURL = jest.fn();
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('does not show a status message before export', () => {
        const component = createComponent();
        expect(component.render().props.children[1]).toBe('');
    });

    it.each(['', '  ', '{}'])('explains missing export columns for configuration %j', config => {
        const component = createComponent(undefined, true, config);
        const children = component.render().props.children;
        expect(children[0].props.disabled).toBe(true);
        expect(children[2].props.children).toBe('Configure export columns.');
        expect(children[2].props.role).toBe('status');
        expect(children[2].props.messageBarType).toBe(2);
    });

    it.each(['{', '[]', 'null', '{"Title":42}', '{" ":"Header"}'])('explains an unusable export configuration %j', config => {
        const component = createComponent(undefined, true, config);
        const children = component.render().props.children;
        expect(children[0].props.disabled).toBe(true);
        expect(children[2].props.children).toBe('Correct the export column configuration.');
    });

    it('explains omitted configuration without confusing it with an export request failure', () => {
        const component = new ExportCurrentResultsButtonComponent({ items: [{ Title: 'Example' }] });
        const children = component.render().props.children;
        expect(children[1]).toBe('');
        expect(children[2].props.children).toBe('Configure export columns.');
    });

    it('preserves export behavior for usable mappings and removes the configuration warning', () => {
        const component = createComponent(undefined, true, '{"Title":"Title","Ignored":42}');
        const children = component.render().props.children;
        expect(children[0].props.disabled).toBe(false);
        expect(children[2]).toBeUndefined();
    });

    it('blocks export while results are loading', async () => {
        const fetchItems = jest.fn(async () => []);
        const component = createComponent(new CsvExportController(fetchItems), false);

        expect(component.render().props.children[0].props.disabled).toBe(true);
        expect(component.render().props.children[2]).toBeUndefined();
        await component['_downloadCurrentData']();
        expect(fetchItems).not.toHaveBeenCalled();
    });

    it('does not show a configuration warning when disabled only because there are no results', () => {
        const component = new ExportCurrentResultsButtonComponent({ items: [], exportColumns: { Title: 'Title' } });
        expect(component.render().props.children[0].props.disabled).toBe(true);
        expect(component.render().props.children[2]).toBeUndefined();
    });

    it('shows a localized, dismissible alert on failure and retains diagnostics', async () => {
        const error = new Error('Throttled');
        const component = createComponent(new CsvExportController(async () => { throw error; }));
        const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        await component['_downloadCurrentData']();

        expect(component.state.isExporting).toBe(false);
        const alert = component.render().props.children[1];
        expect(alert.props.role).toBe('alert');
        expect(alert.props.children).toBe('Export failed. Try again.');
        expect(alert.props.dismissButtonAriaLabel).toBe('Dismiss export error');
        expect(log).toHaveBeenCalledWith(expect.any(String), error);
        alert.props.onDismiss();
        expect(component.state.errorMessage).toBe('');
    });

    it('finishes one download and retains busy state when selection replaces the button', async () => {
        let complete: (items: Record<string, unknown>[]) => void = () => undefined;
        const fetchItems = jest.fn(() => new Promise<Record<string, unknown>[]>(resolve => { complete = resolve; }));
        const controller = new CsvExportController(fetchItems);
        const firstButton = createComponent(controller);
        const exporting = firstButton['_downloadCurrentData']();
        firstButton.componentWillUnmount();
        const previousUpdates = (firstButton.setState as jest.Mock).mock.calls.length;
        const replacement = createComponent(controller);

        expect(replacement.state.isExporting).toBe(true);
        expect(replacement.render().props.children[0].props.disabled).toBe(true);
        await replacement['_downloadCurrentData']();
        expect(fetchItems).toHaveBeenCalledTimes(1);

        complete([{ Title: 'Example' }]);
        await exporting;

        expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
        expect(replacement.state.isExporting).toBe(false);
        expect(replacement.state.errorMessage).toBe('');
        expect(firstButton.setState).toHaveBeenCalledTimes(previousUpdates);
    });

    it('retains a failure and its dismissal across button replacements', async () => {
        let fail: (error: Error) => void = () => undefined;
        const controller = new CsvExportController(() => new Promise((_resolve, reject) => { fail = reject; }));
        const firstButton = createComponent(controller);
        const exporting = firstButton['_downloadCurrentData']();
        firstButton.componentWillUnmount();
        const replacement = createComponent(controller);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        fail(new Error('Search context changed during export.'));
        await exporting;

        expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
        expect(replacement.state.errorMessage).toBe('Export failed. Try again.');
        replacement.componentWillUnmount();
        const nextButton = createComponent(controller);
        expect(nextButton.state.errorMessage).toBe('Export failed. Try again.');
        nextButton.render().props.children[1].props.onDismiss();
        expect(nextButton.state.errorMessage).toBe('');
    });

    it('does not download or notify a button after the owning Results container is disposed', async () => {
        let complete: (items: Record<string, unknown>[]) => void = () => undefined;
        const controller = new CsvExportController(() => new Promise(resolve => { complete = resolve; }));
        const component = createComponent(controller);
        const exporting = component['_downloadCurrentData']();
        component.componentWillUnmount();
        const previousUpdates = (component.setState as jest.Mock).mock.calls.length;
        controller.dispose();

        complete([{ Title: 'Example' }]);
        await exporting;

        expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
        expect(component.setState).toHaveBeenCalledTimes(previousUpdates);
    });
});