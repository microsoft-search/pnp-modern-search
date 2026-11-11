jest.mock('@pnp/modern-search-extensibility', () => {
    class BaseComponent {
        public properties: object;
        public editMode: boolean;

        public constructor(protected serviceScope: object) { }
    }

    return {
        BaseDataSource: BaseComponent,
        BaseLayout: BaseComponent,
        BuiltinTemplateSlots: {},
        FilterBehavior: { Static: 0, Dynamic: 1 },
        FilterType: { Refiner: 'Refiner', StaticFilter: 'StaticFilter' },
        PagingBehavior: { Static: 0, Dynamic: 1 },
        SortFieldDirection: { Ascending: 1, Descending: 2 }
    };
});

jest.mock('@microsoft/sp-core-library', () => ({
    ServiceScope: class {
        public static startNewRoot() {
            return new this();
        }

        public whenFinished(callback: () => void): void {
            callback();
        }

        public consume(): object {
            return {
                cultureInfo: { currentUICultureName: 'en-us' },
                moment: jest.fn().mockResolvedValue(undefined),
                getAvailableQueryLanguages: jest.fn().mockResolvedValue([])
            };
        }
    },
    Guid: {},
    Text: { format: (text: string) => text }
}));

jest.mock('@microsoft/sp-page-context', () => ({ PageContext: { serviceKey: 'page' } }));
jest.mock('@microsoft/sp-http', () => ({ SPHttpClient: { serviceKey: 'http' } }));
jest.mock('@microsoft/sp-property-pane', () => {
    const field = (targetProperty: string, properties: object) => ({ targetProperty, properties });
    return {
        PropertyPaneLabel: field,
        PropertyPaneToggle: field,
        PropertyPaneDropdown: field,
        PropertyPaneSlider: field,
        PropertyPaneButton: field,
        PropertyPaneTextField: field,
        PropertyPaneHorizontalRule: field,
        PropertyPaneButtonType: { Command: 0 },
        PropertyPaneDropdownOptionType: { Header: 0 }
    };
});

// Resolves any localized string key, e.g. commonStrings.DataSources.SharePointSearch.SourceName
jest.mock('CommonStrings', () => {
    const strings = (): object => new Proxy({}, {
        get: (_target, key) => key === Symbol.toPrimitive ? () => 'test string' : strings()
    });
    return strings();
}, { virtual: true });

jest.mock('@fluentui/react', () => ({}));
jest.mock('@pnp/common/storage', () => ({ PnPClientStorage: class { } }));
jest.mock('../helpers/DateHelper', () => ({ DateHelper: { ServiceKey: 'date' } }));
jest.mock('../helpers/LocalizationHelper', () => ({
    __esModule: true,
    default: {
        getTranslatedCultureFromUrl: () => undefined,
        getLocaleId: () => 1033
    }
}));
jest.mock('../services/tokenService/TokenService', () => ({ TokenService: { ServiceKey: 'tokens' } }));
jest.mock('../services/taxonomyService/TaxonomyService', () => ({ TaxonomyService: { ServiceKey: 'taxonomy' } }));
jest.mock('../services/searchService/SharePointSearchService', () => ({ SharePointSearchService: { ServiceKey: 'search' } }));
jest.mock('../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo', () => ({ PropertyPaneAsyncCombo: class { } }));
jest.mock('../controls/PropertyPaneAsyncCombo/components/AsyncCombo', () => ({ AsyncCombo: () => null }));
jest.mock('../controls/PropertyPaneNonReactiveTextField/PropertyPaneNonReactiveTextField', () => ({ PropertyPaneNonReactiveTextField: class { } }));
jest.mock('../controls/TemplateValueFieldEditor/TemplateValueFieldEditor', () => ({ TemplateValueFieldEditor: () => null }));

jest.mock('@pnp/spfx-property-controls/lib/PropertyPaneWebPartInformation', () => ({
    PropertyPaneWebPartInformation: (properties: object) => ({ properties })
}));
jest.mock('@pnp/spfx-property-controls/lib/PropertyFieldCollectionData', () => ({
    PropertyFieldCollectionData: (targetProperty: string, properties: object) => ({ targetProperty, properties }),
    CustomCollectionFieldType: { string: 0, number: 1, boolean: 2, custom: 3 }
}));
jest.mock('@pnp/spfx-property-controls/lib/PropertyFieldNumber', () => ({
    PropertyFieldNumber: (targetProperty: string, properties: object) => ({ targetProperty, properties })
}));

import { ServiceScope } from '@microsoft/sp-core-library';
import { SharePointSearchDataSource } from './SharePointSearchDataSource';
import { MicrosoftSearchDataSource } from './MicrosoftSearchDataSource';
import { DetailsListLayout } from '../layouts/results/detailsList/DetailListLayout';

const createSharePointSearchDataSource = () => {
    const component = new SharePointSearchDataSource(ServiceScope.startNewRoot());
    return { component, getPropertyPaneFields: () => component.getPropertyPaneGroupsConfiguration() };
};

const createMicrosoftSearchDataSource = () => {
    const component = new MicrosoftSearchDataSource(ServiceScope.startNewRoot());
    return { component, getPropertyPaneFields: () => component.getPropertyPaneGroupsConfiguration() };
};

const createDetailsListLayout = () => {
    const component = new DetailsListLayout(ServiceScope.startNewRoot());
    return { component, getPropertyPaneFields: () => component.getPropertyPaneFieldsConfiguration(['Title']) };
};

describe.each([
    ['SharePoint Search data source', createSharePointSearchDataSource],
    ['Microsoft Search data source', createMicrosoftSearchDataSource],
    ['Details List layout', createDetailsListLayout]
] as const)('%s', (_name, create) => {

    it('loads its property pane controls on demand when initialized in read mode', async () => {
        const { component, getPropertyPaneFields } = create();
        component.properties = {} as any;
        component.editMode = false;
        await component.onInit();

        // Happens when the property pane opens on a single-part app page
        expect(getPropertyPaneFields).toThrow(TypeError);

        await component.loadPropertyPaneResources();

        expect(getPropertyPaneFields()).not.toHaveLength(0);
        expect(component.editMode).toBe(false);
    });

    it('loads its property pane controls during initialization in edit mode', async () => {
        const { component, getPropertyPaneFields } = create();
        component.properties = {} as any;
        component.editMode = true;
        await component.onInit();

        expect(getPropertyPaneFields()).not.toHaveLength(0);
    });
});
