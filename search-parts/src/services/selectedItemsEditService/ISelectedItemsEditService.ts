export type SelectedItemsEditIneligibleReason = 'missing-metadata' | 'cross-origin' | 'permission-denied' | 'unsupported-source';

export interface ISelectedSharePointItemRef {
    key: string;
    webUrl: string;
    listId: string;
    itemId?: number;
    uniqueId?: string;
    title?: string;
    contentTypeId?: string;
    rawItem: { [key: string]: any };
}

export interface IEditableFieldDescriptor {
    internalName: string;
    title: string;
    typeAsString: string;
    required: boolean;
    schemaXml?: string;
    allowMultipleValues?: boolean;
    choices?: string[];
    lookupListId?: string;
    lookupField?: string;
    termSetId?: string;
    availableTags?: Array<{ key: string; name: string }>;
    sharedValue?: string;
    sharedValueRaw?: unknown;
}

export interface IItemEditCapability {
    itemKey: string;
    canEdit: boolean;
    reason?: SelectedItemsEditIneligibleReason;
}

export interface ISelectedItemsEditListScope {
    webUrl: string;
    listId: string;
    itemCount: number;
}

export interface ISelectedItemsEditPreparationResult {
    eligibleItems: ISelectedSharePointItemRef[];
    ineligibleItems: IItemEditCapability[];
    commonEditableFields: IEditableFieldDescriptor[];
    requiresSingleList: boolean;
    listScopes: ISelectedItemsEditListScope[];
}

export interface ISelectedItemsEditService {
    prepareSelectedItemsEdit(items: { [key: string]: any }[]): Promise<ISelectedItemsEditPreparationResult>;
    applySelectedItemsEdit(items: ISelectedSharePointItemRef[], field: IEditableFieldDescriptor, value: unknown): Promise<void>;
}