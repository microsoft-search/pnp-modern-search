export class Constants {
    
    /**
     * Unique ID for the default extensibility SPFx library component
     */
    public static readonly DEFAULT_EXTENSIBILITY_LIBRARY_COMPONENT_ID = 'dc4f961b-dbe0-44b4-982d-5776bf99d015';

    /**
     * The default image content to show when 404 is returned for a image
     */
    public static readonly DEFAULT_IMAGE_CONTENT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOsAAAB5CAMAAADveiavAAAAMFBMVEX///+5ubnw8PDa2tq+vr7U1NT19fXq6ur8/PzBwcG2trbt7e3Hx8fOzs7Kysrg4OBtwFM/AAAChUlEQVR4nO2b67KCIBRGFbmn8v5ve5DyFAZmxExs+9afmmmGablxs7l1HQAAAAAAAAAAAAAAAAAAAAAnhTlRh0HJb7vso53pqzGrb+vsMtQz9ZiWZV1va7pac/m2URY2VlX1CP1tpxyKL65iqMLy3OzYan7SjntVU6k1ubgaVqm12uiQmcZazS2N8VazU11XDddG+GlXrZwv9QrTCylX7cbeergoGjgouWqxFlF2Lil/KLmKew1lx4J+TMiVReViQa1HyHWKS+P3A0vHVfJI1Q7vt0bGVcXzFZvvxDqTuOi4uo3rnHPVU+/SP5BxPRpXPVmblqXjetm8r+nYdTKkMO4ST4KOqz6Uh6W4/moSsnRc4/E104VX1SWyz63Rce2GB9k5Gda7am+fZSm5vqyH9V11YStLyXWZ59ideY4fbCK2kSXl6mGDcCoz2kxP66uxFzXXPMml5CgbU3A9tGbK5tSqeTTOnsWVzQnTzTt7Etd0VPsw9PxH9hyuWdUoskRdJXtMOrkOvJGl6apFtLf4Yjfa3vRIui7TNvsvK/nLfctrZCm6hhmPXf/0kS1aHqpngq7r5O56HoA9V0sJ19AJ6LnKVS5Edj8tEXeV9xVxL7s32JB3ldG0zRyKKlHXWPUwFF23a04ndi1VJeharErPtVyVnKsW5UfYqLm6D07rUXMd4ApXuMK1EWLXcqi5OsPfxnDj4WYkti4h1ftc1MXjP8KqIx3XCq3BtRF+z/VHzvuHexw9kzXQruk7K7f7Ob35kDGwtGSnZl1l+fz8kWtFEb6mDnk1gjJ1L5m1G1aPGm01W9u2aqfZUC20s2ta1aMlq4Rs910FAAAAAAAAAAAAAAAAANrkD0o1KjRxIes1AAAAAElFTkSuQmCC';

    /**
     * The client tag to append to all REST calls to SharePoint
     */
    public static readonly X_CLIENTSERVICE_CLIENTTAG = 'NonISV|PnP|ModernSearch';

    /**
     * The PnP Application Insights instrumentation key and events for stats tracking
     */
    public static readonly PNP_APP_INSIGHTS_INSTRUMENTATION_KEY = '0f0b9db6-680c-480c-804d-f75830e2c383';
    public static readonly PNP_APP_INSIGHTS_INSTRUMENTATION_KEY_FALLBACK = '0144990f-ee63-4e5b-83d2-f1e21d4f8785';
    public static readonly PNP_MODERN_SEARCH_EVENT_NAME = 'pnpModernSearchV4';
}

export enum AutoCalculatedDataSourceFields {
    AutoPreviewUrl = 'AutoPreviewUrl',
    AutoPreviewImageUrl = 'AutoPreviewImageUrl',
    AutoSiteId = 'AutoSiteId',
    AutoListId = 'AutoListId'
}

export class TestConstants {
    public static SearchResultsWebPart = "dataVisualizerWebPart";
    public static SearchResultsErrorMessage = "dataVisualizerErrorMessage";
    public static SearchResultsLoadingOverlay = "dataVisualizerLoadingOverlay";
    public static SearchResultsWebPartTitle = "dataVisualizerWebPartTitle";
    public static SearchResultsLicenseMessageBar = "dataVisualizerLicenseMessageBar";
    public static PreviewCallout = "previewCallout";
    public static DocumentCardFileIcon = "documentCardFileIcon";
    public static ResultDocumentCard = "resultCard";
    public static FakeDocumentCard = "fakeCard";
    public static CheckBoxFilterCount = "filterCount";
    public static SelectedFiltersClearFilter = "clearFilter";
}