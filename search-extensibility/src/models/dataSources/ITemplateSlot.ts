/**
 * List of available slot values for Handlebars templates
 */
export enum BuiltinTemplateSlots {
    Title = 'Title',
    Path = 'Path',
    Summary = 'Summary',
    Date = 'Date',
    FileType = 'FileType',
    PreviewImageUrl = 'PreviewImageUrl',
    PreviewUrl = 'PreviewUrl',
    Author = 'Author',
    Tags = 'Tags',
    SiteId = 'SiteId',
    ListId = 'ListId',
    ItemId = 'ItemId',
    IsFolder = 'IsFolder',
    PersonQuery = 'PersonQuery',
    UserDisplayName = 'UserDisplayName',
    UserEmail = 'UserEmail',
    ContentClass = 'contentclass',
    DriveId = "DriveId",
}

export interface ITemplateSlot {

    /**
     * Name of the slot to be used in the Handlebars templates (ex: 'Title'). This will be accessible using \{{@slots.<name>}} in templates
     */
    slotName: BuiltinTemplateSlots | string;

    /**
     * The data source field associated with that slot
     */
    slotField: string;
} 