jest.mock('react-dom', () => ({}));
jest.mock('@pnp/modern-search-extensibility', () => ({ BaseWebComponent: class {} }));
jest.mock('@fluentui/react', () => ({
    ActionButton: 'button',
    MessageBar: 'div',
    MessageBarType: { error: 1 },
    getTheme: () => ({ semanticColors: {} })
}));
jest.mock('CommonStrings', () => ({
    Controls: {
        DownloadCurrentDataAsCSVButtonText: 'Export Search result',
        ExportSearchResultsError: 'Export failed. Try again.',
        ExportSearchResultsDismissError: 'Dismiss export error'
    }
}), { virtual: true });

import { ExportCurrentResultsButtonComponent } from './ExportCurrentResultsButtonComponent';

describe('ExportCurrentResultsButtonComponent error feedback', () => {
    function createComponent(): ExportCurrentResultsButtonComponent {
        const component = new ExportCurrentResultsButtonComponent({
            items: [{ Title: 'Example' }],
            exportColumns: { Title: 'Title' }
        });
        jest.spyOn(component, 'setState').mockImplementation(update => {
            Object.assign(component.state, update);
        });
        return component;
    }

    afterEach(() => jest.restoreAllMocks());

    it('does not show a status message before export', () => {
        const component = createComponent();
        expect(component.render().props.children[1]).toBe('');
    });

    it('shows a localized, dismissible alert on failure and retains diagnostics', async () => {
        const component = createComponent();
        const error = new Error('Throttled');
        jest.spyOn(component as any, '_requestCurrentData').mockRejectedValue(error);
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

    it('does not update the UI after the export action unmounts', async () => {
        const component = createComponent();
        jest.spyOn(component as any, '_requestCurrentData').mockImplementation(async () => {
            component.componentWillUnmount();
            return [{ Title: 'Example' }];
        });

        await component['_downloadCurrentData']();

        expect(component.setState).toHaveBeenCalledTimes(1);
        expect(component.state.errorMessage).toBe('');
    });
});