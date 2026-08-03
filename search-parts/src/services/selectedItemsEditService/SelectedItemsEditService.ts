import { Log, ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { IODataBasePermission } from '@microsoft/sp-odata-types';
import { PageContext, SPPermission } from '@microsoft/sp-page-context';
import { SPHttpClient } from '@microsoft/sp-http';
import { TaxonomyHelper } from '../../helpers/TaxonomyHelper';
import {
    ISelectedItemsEditPreparationResult,
    IEditableFieldDescriptor,
    IItemEditCapability,
    ISelectedItemsEditService,
    ISelectedSharePointItemRef,
    SelectedItemsEditIneligibleReason,
} from './ISelectedItemsEditService';

const SelectedItemsEditServiceKey = 'pnpSearchResults:SelectedItemsEditService';
const LogSource = 'SelectedItemsEditService';

interface IResolvedSelectedItemRef {
    ref?: ISelectedSharePointItemRef;
    reason?: SelectedItemsEditIneligibleReason;
}

interface ISharePointFieldResponse {
    InternalName: string;
    Title: string;
    TypeAsString: string;
    Hidden: boolean;
    ReadOnlyField: boolean;
    Sealed: boolean;
    Required: boolean;
    SchemaXml?: string;
    Choices?: { results?: string[] } | string[];
    AllowMultipleValues?: boolean;
    LookupList?: string;
    LookupField?: string;
}

interface IPreparedItemValues {
    itemKey: string;
    values: Record<string, unknown>;
}

export class SelectedItemsEditService implements ISelectedItemsEditService {

    public static readonly ServiceKey: ServiceKey<ISelectedItemsEditService> = ServiceKey.create(SelectedItemsEditServiceKey, SelectedItemsEditService);

    private pageContext: PageContext;
    private spHttpClient: SPHttpClient;
    private readonly fieldCache = new Map<string, Promise<IEditableFieldDescriptor[]>>();

    constructor(private readonly serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
            this.spHttpClient = serviceScope.consume<SPHttpClient>(SPHttpClient.serviceKey);
        });
    }

    public async prepareSelectedItemsEdit(items: { [key: string]: any }[]): Promise<ISelectedItemsEditPreparationResult> {
        const ineligibleItems: IItemEditCapability[] = [];
        const normalizedItems: ISelectedSharePointItemRef[] = [];

        for (const item of items ?? []) {
            const resolvedItem = this.toSelectedSharePointItemRef(item);

            if (resolvedItem.ref) {
                normalizedItems.push(resolvedItem.ref);
            } else {
                ineligibleItems.push({
                    itemKey: String(item?.key ?? item?.Id ?? ''),
                    canEdit: false,
                    reason: resolvedItem.reason ?? 'unsupported-source',
                });
            }
        }

        if (normalizedItems.length === 0) {
            return {
                eligibleItems: [],
                ineligibleItems,
                commonEditableFields: [],
                requiresSingleList: false,
                listScopes: [],
            };
        }

        const itemsByScope = new Map<string, ISelectedSharePointItemRef[]>();
        normalizedItems.forEach((item) => {
            const scopeKey = this.getScopeKey(item.webUrl, item.listId);
            const scopedItems = itemsByScope.get(scopeKey) ?? [];
            scopedItems.push(item);
            itemsByScope.set(scopeKey, scopedItems);
        });

        const listScopes = Array.from(itemsByScope.values()).map((scopedItems) => ({
            webUrl: scopedItems[0].webUrl,
            listId: scopedItems[0].listId,
            itemCount: scopedItems.length,
        }));

        const fieldEntries = await Promise.all(Array.from(itemsByScope.entries()).map(async ([scopeKey, scopedItems]) => {
            const fields = await this.getListEditableFields(scopedItems[0].webUrl, scopedItems[0].listId);
            return [scopeKey, fields] as const;
        }));
        const fieldsByScope = new Map<string, IEditableFieldDescriptor[]>(fieldEntries);

        const editCapabilities = await Promise.all(normalizedItems.map(async (item) => {
            return {
                item,
                capability: await this.canEditItem(item),
            };
        }));

        const eligibleItems: ISelectedSharePointItemRef[] = [];
        editCapabilities.forEach(({ item, capability }) => {
            if (capability.canEdit) {
                eligibleItems.push(item);
            } else {
                ineligibleItems.push(capability);
            }
        });

        const eligibleScopeKeys = Array.from(new Set(eligibleItems.map((item) => this.getScopeKey(item.webUrl, item.listId))));
        let commonEditableFields = eligibleScopeKeys.length > 0
            ? this.intersectEditableFields(eligibleScopeKeys.map((scopeKey) => fieldsByScope.get(scopeKey) ?? []))
            : [];

        if (eligibleItems.length > 0 && commonEditableFields.length > 0) {
            const preparedItemValues = await Promise.all(eligibleItems.map(async (item) => this.getItemFieldValues(item, commonEditableFields)));
            commonEditableFields = this.withAvailableTags(commonEditableFields, preparedItemValues);
            commonEditableFields = this.withSharedValues(commonEditableFields, preparedItemValues);
        }

        return {
            eligibleItems,
            ineligibleItems,
            commonEditableFields,
            requiresSingleList: listScopes.length > 1,
            listScopes,
        };
    }

    public async applySelectedItemsEdit(items: ISelectedSharePointItemRef[], field: IEditableFieldDescriptor, value: unknown): Promise<void> {
        if (items.length === 0 || !field) {
            return;
        }

        const preparedValue = this.prepareFieldValueForUpdate(field, value);
        const updateResults = await Promise.allSettled(items.map(async (item) => {
            await this.updateItemFieldValue(item, field, preparedValue);
        }));

        const rejectedResults = updateResults.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

        if (rejectedResults.length > 0) {
            const firstError = rejectedResults[0].reason as Error;
            throw new Error(firstError?.message ?? `Updating selected items failed for ${rejectedResults.length} item(s).`);
        }
    }

    private toSelectedSharePointItemRef(item: { [key: string]: any }): IResolvedSelectedItemRef {
        const webUrlValue = this.resolveFieldValue(item, 'SPWebUrl')
            ?? this.resolveFieldValue(item, 'SPSiteURL')
            ?? this.resolveFieldValue(item, 'SitePath');
        const listIdValue = this.resolveFieldValue(item, 'ListId')
            ?? this.resolveFieldValue(item, 'NormListID')
            ?? this.resolveFieldValue(item, 'IdentityListId');
        const listItemIdValue = this.resolveFieldValue(item, 'ListItemID')
            ?? this.resolveFieldValue(item, 'Id');

        const uniqueIdValue = this.resolveFieldValue(item, 'UniqueID')
            ?? this.resolveFieldValue(item, 'NormUniqueID');

        if (!webUrlValue || !listIdValue || (!listItemIdValue && !uniqueIdValue)) {
            return { reason: 'missing-metadata' };
        }

        try {
            const webUrl = new URL(String(webUrlValue), this.pageContext?.web?.absoluteUrl ?? window.location.origin).toString();
            const currentOrigin = new URL(this.pageContext?.web?.absoluteUrl ?? window.location.origin).origin;

            if (new URL(webUrl).origin !== currentOrigin) {
                return { reason: 'cross-origin' };
            }

            const parsedItemId = listItemIdValue ? Number.parseInt(String(listItemIdValue), 10) : Number.NaN;
            const itemId = Number.isNaN(parsedItemId) ? undefined : parsedItemId;

            if (!itemId && !uniqueIdValue) {
                return { reason: 'missing-metadata' };
            }

            const normalizedListId = this.normalizeGuid(String(listIdValue));
            const normalizedUniqueId = uniqueIdValue ? this.normalizeGuid(String(uniqueIdValue)) : undefined;
            const fallbackItemKey = itemId !== undefined
                ? `${normalizedListId}:${itemId}`
                : `${normalizedListId}:${normalizedUniqueId}`;

            return {
                ref: {
                    key: String(item?.key ?? fallbackItemKey),
                    webUrl,
                    listId: normalizedListId,
                    itemId,
                    uniqueId: normalizedUniqueId,
                    title: this.resolveFieldValue(item, 'Title')
                        ?? this.resolveFieldValue(item, 'Filename')
                        ?? undefined,
                    contentTypeId: this.resolveFieldValue(item, 'ContentTypeId') ?? undefined,
                    rawItem: item,
                },
            };
        } catch {
            return { reason: 'unsupported-source' };
        }
    }

    private async getListEditableFields(webUrl: string, listId: string): Promise<IEditableFieldDescriptor[]> {
        const cacheKey = this.getScopeKey(webUrl, listId);

        if (!this.fieldCache.has(cacheKey)) {
            this.fieldCache.set(cacheKey, this.fetchListEditableFields(webUrl, listId));
        }

        return this.fieldCache.get(cacheKey)!;
    }

    private async fetchListEditableFields(webUrl: string, listId: string): Promise<IEditableFieldDescriptor[]> {
        const endpoint = `${webUrl.replace(/\/$/, '')}/_api/web/lists/GetById('${this.normalizeGuid(listId)}')/fields?$select=InternalName,Title,TypeAsString,Hidden,ReadOnlyField,Sealed,Required,SchemaXml,Choices,AllowMultipleValues,LookupList,LookupField`;
        const response = await this.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Selected item field discovery failed for list '${listId}'. ${errorMessage}`);
        }

        const payload = await response.json();
        const fields = (payload?.value ?? []) as ISharePointFieldResponse[];

        return fields
            .filter((field) => this.isSelectedItemsEditSupportedField(field))
            .map((field) => ({
                internalName: field.InternalName,
                title: field.Title || field.InternalName,
                typeAsString: field.TypeAsString,
                required: field.Required === true,
                schemaXml: field.SchemaXml,
                allowMultipleValues: field.AllowMultipleValues === true,
                choices: Array.isArray(field.Choices)
                    ? field.Choices
                    : field.Choices?.results ?? [],
                lookupListId: field.LookupList,
                lookupField: field.LookupField,
                termSetId: this.extractTermSetId(field.SchemaXml),
            }))
            .sort((left, right) => left.title.localeCompare(right.title));
    }

    private async canEditItem(item: ISelectedSharePointItemRef): Promise<IItemEditCapability> {
        try {
            const endpoint = this.buildItemPermissionsEndpoint(item);

            if (!endpoint) {
                return {
                    itemKey: item.key,
                    canEdit: false,
                    reason: 'missing-metadata',
                };
            }

            const response = await this.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

            if (!response.ok) {
                return {
                    itemKey: item.key,
                    canEdit: false,
                    reason: response.status === 401 || response.status === 403 ? 'permission-denied' : 'unsupported-source',
                };
            }

            const payload = await response.json();
            const permissions = new SPPermission(payload?.EffectiveBasePermissions as IODataBasePermission);

            return {
                itemKey: item.key,
                canEdit: permissions.hasPermission(SPPermission.editListItems),
                reason: permissions.hasPermission(SPPermission.editListItems) ? undefined : 'permission-denied',
            };
        } catch (error) {
            Log.error(LogSource, error as Error, this.serviceScope);

            return {
                itemKey: item.key,
                canEdit: false,
                reason: 'unsupported-source',
            };
        }
    }

    private buildItemPermissionsEndpoint(item: ISelectedSharePointItemRef): string | null {
        const baseUrl = item.webUrl.replace(/\/$/, '');

        if (item.itemId) {
            return `${baseUrl}/_api/web/lists/GetById('${this.normalizeGuid(item.listId)}')/items(${item.itemId})?$select=Id,EffectiveBasePermissions`;
        }

        if (item.uniqueId && this.isDocumentContentType(item.contentTypeId)) {
            return `${baseUrl}/_api/web/GetFileById(guid'${this.normalizeGuid(item.uniqueId)}')/ListItemAllFields?$select=Id,EffectiveBasePermissions`;
        }

        return null;
    }

    private async getItemFieldValues(item: ISelectedSharePointItemRef, fields: IEditableFieldDescriptor[]): Promise<IPreparedItemValues> {
        const endpoint = this.buildItemValuesEndpoint(item);

        if (!endpoint) {
            return {
                itemKey: item.key,
                values: {},
            };
        }

        const response = await this.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Selected item field value lookup failed for '${item.key}'. ${errorMessage}`);
        }

        const payload = await response.json();
        const values: Record<string, unknown> = {};

        fields.forEach((field) => {
            values[field.internalName] = payload?.[field.internalName];
        });

        return {
            itemKey: item.key,
            values,
        };
    }

    private buildItemValuesEndpoint(item: ISelectedSharePointItemRef): string | null {
        return this.buildItemUpdateEndpoint(item);
    }

    private async updateItemFieldValue(item: ISelectedSharePointItemRef, field: IEditableFieldDescriptor, value: unknown): Promise<void> {
        if (this.shouldUseValidateUpdateListItem(field)) {
            await this.updateComplexItemFieldValue(item, field, value);
            return;
        }

        const endpoint = this.buildItemUpdateEndpoint(item);

        if (!endpoint) {
            throw new Error(`Selected item edit endpoint could not be resolved for '${item.key}'.`);
        }

        const response = await this.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                Accept: 'application/json;odata=nometadata',
                'Content-Type': 'application/json;odata=nometadata',
                'IF-MATCH': '*',
                'X-HTTP-Method': 'MERGE',
            },
            body: JSON.stringify({
                [field.internalName]: value,
            }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Updating selected item '${item.title ?? item.key}' failed. ${errorMessage}`);
        }
    }

    private async updateComplexItemFieldValue(item: ISelectedSharePointItemRef, field: IEditableFieldDescriptor, value: unknown): Promise<void> {
        const endpoint = this.buildValidateUpdateItemEndpoint(item);
        const fieldValue = this.toValidateUpdateFieldValue(field, value);

        if (!endpoint) {
            throw new Error(`Selected item edit endpoint could not be resolved for '${item.key}'.`);
        }

        const response = await this.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                Accept: 'application/json;odata=nometadata',
                'Content-Type': 'application/json;odata=nometadata',
            },
            body: JSON.stringify({
                formValues: [{
                    FieldName: field.internalName,
                    FieldValue: fieldValue,
                }],
                bNewDocumentUpdate: false,
            }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Updating selected item '${item.title ?? item.key}' failed. ${errorMessage}`);
        }

        const payload = await response.json();
        const results = Array.isArray(payload)
            ? payload
            : payload?.value ?? payload?.d?.ValidateUpdateListItem?.results ?? [];
        const failedResult = results.find((result) => result?.HasException || !!result?.ErrorMessage);

        if (failedResult) {
            throw new Error(failedResult.ErrorMessage || `Updating selected item '${item.title ?? item.key}' failed.`);
        }
    }

    private buildItemUpdateEndpoint(item: ISelectedSharePointItemRef): string | null {
        const baseUrl = item.webUrl.replace(/\/$/, '');

        if (item.itemId) {
            return `${baseUrl}/_api/web/lists/GetById('${this.normalizeGuid(item.listId)}')/items(${item.itemId})`;
        }

        if (item.uniqueId && this.isDocumentContentType(item.contentTypeId)) {
            return `${baseUrl}/_api/web/GetFileById(guid'${this.normalizeGuid(item.uniqueId)}')/ListItemAllFields`;
        }

        return null;
    }

    private buildValidateUpdateItemEndpoint(item: ISelectedSharePointItemRef): string | null {
        const baseUrl = item.webUrl.replace(/\/$/, '');

        if (item.itemId) {
            return `${baseUrl}/_api/web/lists/GetById('${this.normalizeGuid(item.listId)}')/items(${item.itemId})/validateupdatelistitem()`;
        }

        if (item.uniqueId && this.isDocumentContentType(item.contentTypeId)) {
            return `${baseUrl}/_api/web/GetFileById(guid'${this.normalizeGuid(item.uniqueId)}')/ListItemAllFields/validateupdatelistitem()`;
        }

        return null;
    }

    private prepareFieldValueForUpdate(field: IEditableFieldDescriptor, value: unknown): unknown {
        switch (field.typeAsString) {
            case 'Boolean':
                return this.toBooleanFieldValue(value);

            case 'Currency':
            case 'Number': {
                return this.toNumericFieldValue(field, value);
            }

            case 'DateTime': {
                return this.toDateFieldValue(field, value);
            }

            case 'User':
            case 'UserMulti': {
                return this.toUserFieldValue(value);
            }

            case 'TaxonomyFieldType':
            case 'TaxonomyFieldTypeMulti': {
                return this.toTaxonomyFieldValue(value);
            }

            case 'Choice':
            case 'Note':
            case 'Text':
            default:
                return value ?? '';
        }
    }

    private toUserFieldValue(value: unknown): string {
        const tags = this.toSelectedEditTags(value);

        if (tags.length === 0) {
            return '';
        }

        return JSON.stringify(tags.map((tag) => ({ Key: tag.key })));
    }

    private toTaxonomyFieldValue(value: unknown): string {
        const tags = this.toSelectedEditTags(value);

        if (tags.length === 0) {
            return '';
        }

        return tags.map((tag) => `${tag.name}|${this.normalizeGuid(tag.key)}`).join(';');
    }

    private toSelectedEditTags(value: unknown): Array<{ key: string; name: string }> {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .filter((entry) => !!entry && typeof entry === 'object')
            .map((entry) => ({
                key: `${(entry as { key?: string }).key ?? ''}`,
                name: `${(entry as { name?: string }).name ?? ''}`,
            }))
            .filter((entry) => !!entry.key && !!entry.name);
    }

    private toBooleanFieldValue(value: unknown): boolean {
        return value === true || value === 'true' || value === 1 || value === '1';
    }

    private toNumericFieldValue(field: IEditableFieldDescriptor, value: unknown): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new TypeError(`The value for '${field.title}' must be a valid number.`);
        }

        const parsedValue = Number(value);

        if (Number.isNaN(parsedValue)) {
            throw new TypeError(`The value for '${field.title}' must be a valid number.`);
        }

        return parsedValue;
    }

    private toDateFieldValue(field: IEditableFieldDescriptor, value: unknown): string | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
            throw new TypeError(`The value for '${field.title}' must be a valid date.`);
        }

        const dateInput: Date | string | number = value;
        const dateValue = dateInput instanceof Date ? dateInput : new Date(dateInput);

        if (Number.isNaN(dateValue.getTime())) {
            throw new TypeError(`The value for '${field.title}' must be a valid date.`);
        }

        if (this.isDateOnlyField(field)) {
            const year = dateValue.getFullYear();
            const month = `${dateValue.getMonth() + 1}`.padStart(2, '0');
            const day = `${dateValue.getDate()}`.padStart(2, '0');

            return `${year}-${month}-${day}`;
        }

        return dateValue.toISOString();
    }

    private toValidateUpdateFieldValue(field: IEditableFieldDescriptor, value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value !== 'string') {
            throw new TypeError(`The value for '${field.title}' must be a string when using validateUpdateListItem.`);
        }

        return value;
    }

    private isDateOnlyField(field: IEditableFieldDescriptor): boolean {
        return /\bFormat="DateOnly"\b/i.test(field.schemaXml ?? '');
    }

    private withSharedValues(fields: IEditableFieldDescriptor[], preparedItemValues: IPreparedItemValues[]): IEditableFieldDescriptor[] {
        return fields.map((field) => {
            const serializedValues = preparedItemValues.map((itemValue) => this.serializeFieldValue(itemValue.values[field.internalName]));
            const distinctValues = Array.from(new Set(serializedValues));
            const sharedValueRaw = distinctValues.length === 1 ? preparedItemValues[0]?.values[field.internalName] : undefined;

            return {
                ...field,
                sharedValue: distinctValues.length === 1 ? distinctValues[0] : undefined,
                sharedValueRaw,
            };
        });
    }

    private withAvailableTags(fields: IEditableFieldDescriptor[], preparedItemValues: IPreparedItemValues[]): IEditableFieldDescriptor[] {
        return fields.map((field) => {
            if (!['TaxonomyFieldType', 'TaxonomyFieldTypeMulti'].includes(field.typeAsString)) {
                return field;
            }

            const availableTags = this.extractAvailableTagsFromPreparedValues(field, preparedItemValues);

            return {
                ...field,
                availableTags,
            };
        });
    }

    private extractAvailableTagsFromPreparedValues(field: IEditableFieldDescriptor, preparedItemValues: IPreparedItemValues[]): Array<{ key: string; name: string }> {
        const tagsByKey = new Map<string, { key: string; name: string }>();

        preparedItemValues.forEach((itemValue) => {
            this.addTaxonomyTagsFromRawValue(itemValue.values[field.internalName], tagsByKey);
        });

        return Array.from(tagsByKey.values()).sort((left, right) => left.name.localeCompare(right.name));
    }

    private addTaxonomyTagsFromRawValue(rawValue: unknown, tagsByKey: Map<string, { key: string; name: string }>): void {
        if (rawValue === null || rawValue === undefined || rawValue === '') {
            return;
        }

        if (Array.isArray(rawValue)) {
            rawValue.forEach((entry) => this.addTaxonomyTagsFromRawValue(entry, tagsByKey));
            return;
        }

        if (typeof rawValue === 'object') {
            this.addTaxonomyTagsFromObject(rawValue as Record<string, unknown>, tagsByKey);
            return;
        }

        if (typeof rawValue !== 'string') {
            return;
        }

        this.addTaxonomyTagsFromString(rawValue, tagsByKey);
    }

    private addTaxonomyTagsFromObject(rawValue: Record<string, unknown>, tagsByKey: Map<string, { key: string; name: string }>): void {
        const guidCandidate = this.toStringCandidate(rawValue.TermGuid ?? rawValue.Id ?? rawValue.id) ?? '';
        const labelCandidate = (this.toStringCandidate(rawValue.Label ?? rawValue.Name ?? rawValue.name) ?? '').trim();
        const normalizedGuid = TaxonomyHelper.normalizeGuid(guidCandidate);

        if (normalizedGuid && labelCandidate && !tagsByKey.has(normalizedGuid)) {
            tagsByKey.set(normalizedGuid, { key: normalizedGuid, name: labelCandidate });
        }
    }

    private toStringCandidate(value: unknown): string | undefined {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }

        return undefined;
    }

    private addTaxonomyTagsFromString(rawValue: string, tagsByKey: Map<string, { key: string; name: string }>): void {
        const candidateValues = [rawValue, TaxonomyHelper.decodeHexString(rawValue)].filter(Boolean) as string[];
        const termPattern = /(?:GP0|GPP|L0)\|#0?([-0-9a-fA-F]{32,36})\|([^;]+)/g;

        candidateValues.forEach((candidateValue) => {
            let match: RegExpExecArray | null;
            while ((match = termPattern.exec(candidateValue)) !== null) {
                const normalizedGuid = TaxonomyHelper.normalizeGuid(match[1]);
                const label = `${match[2] ?? ''}`.trim();

                if (normalizedGuid && label && !tagsByKey.has(normalizedGuid)) {
                    tagsByKey.set(normalizedGuid, { key: normalizedGuid, name: label });
                }
            }
        });

        if (tagsByKey.size > 0) {
            return;
        }

        const fallbackGuids = TaxonomyHelper.extractGuidsFromFilterValue(rawValue);
        const fallbackLabel = TaxonomyHelper.extractTaxonomyLabel(rawValue);

        if (fallbackGuids.length > 0 && fallbackLabel && !tagsByKey.has(fallbackGuids[0])) {
            tagsByKey.set(fallbackGuids[0], { key: fallbackGuids[0], name: fallbackLabel });
        }
    }

    private intersectEditableFields(fieldSets: IEditableFieldDescriptor[][]): IEditableFieldDescriptor[] {
        if (fieldSets.length === 0) {
            return [];
        }

        const [firstFieldSet, ...remainingFieldSets] = fieldSets;

        return firstFieldSet.filter((field) => {
            return remainingFieldSets.every((fieldSet) => {
                const matchingField = fieldSet.find((candidate) => candidate.internalName === field.internalName);
                return !!matchingField && this.areFieldDescriptorsCompatible(field, matchingField);
            });
        });
    }

    private areFieldDescriptorsCompatible(left: IEditableFieldDescriptor, right: IEditableFieldDescriptor): boolean {
        return left.internalName === right.internalName
            && left.typeAsString === right.typeAsString
            && left.allowMultipleValues === right.allowMultipleValues
            && (left.termSetId ?? '') === (right.termSetId ?? '')
            && (left.lookupListId ?? '') === (right.lookupListId ?? '')
            && (left.lookupField ?? '') === (right.lookupField ?? '')
            && JSON.stringify(left.choices ?? []) === JSON.stringify(right.choices ?? []);
    }

    private isSelectedItemsEditSupportedField(field: ISharePointFieldResponse): boolean {
        if (!field || field.Hidden || field.ReadOnlyField || field.Sealed) {
            return false;
        }

        const unsupportedTypes = new Set([
            'Attachments',
            'Computed',
            'ContentTypeId',
            'Guid',
            'Lookup',
            'LookupMulti',
        ]);
        const unsupportedInternalNames = new Set([
            'Author',
            'Created',
            'Editor',
            'FileLeafRef',
            'FileRef',
            'File_x0020_Type',
            'FSObjType',
            'GUID',
            'ID',
            'Modified',
        ]);

        if (unsupportedTypes.has(field.TypeAsString) || unsupportedInternalNames.has(field.InternalName)) {
            return false;
        }

        return ['Boolean', 'Choice', 'Currency', 'DateTime', 'Note', 'Number', 'TaxonomyFieldType', 'TaxonomyFieldTypeMulti', 'Text', 'User', 'UserMulti'].includes(field.TypeAsString);
    }

    private shouldUseValidateUpdateListItem(field: IEditableFieldDescriptor): boolean {
        return ['TaxonomyFieldType', 'TaxonomyFieldTypeMulti', 'User', 'UserMulti'].includes(field.typeAsString);
    }

    private extractTermSetId(schemaXml = ''): string | undefined {
        const attributeMatch = /TermSetId="([0-9a-f{}-]+)"/i.exec(schemaXml);

        if (attributeMatch?.[1]) {
            return this.normalizeGuid(attributeMatch[1]);
        }

        const customizationMatch = /<Name>TermSetId<\/Name><Value[^>]*>([0-9a-f{}-]+)<\/Value>/i.exec(schemaXml);
        return customizationMatch?.[1] ? this.normalizeGuid(customizationMatch[1]) : undefined;
    }

    private resolveFieldValue(item: { [key: string]: any }, fieldName: string): any {
        return item?.resource?.fields?.[fieldName]
            ?? item?.resource?.properties?.[fieldName]
            ?? item?.resource?.[fieldName]
            ?? item?.[fieldName];
    }

    private getScopeKey(webUrl: string, listId: string): string {
        return `${webUrl.toLowerCase()}::${this.normalizeGuid(listId).toLowerCase()}`;
    }

    private isDocumentContentType(contentTypeId?: string): boolean {
        return `${contentTypeId ?? ''}`.startsWith('0x0101');
    }

    private serializeFieldValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (Array.isArray(value)) {
            return value.map((entry) => this.serializeFieldValue(entry)).join(', ');
        }

        if (typeof value === 'object') {
            const objectValue = value as Record<string, unknown>;
            const preferredValue = objectValue.Label ?? objectValue.Title ?? objectValue.lookupValue ?? objectValue.Email ?? objectValue.Url ?? objectValue.Description;

            if (preferredValue !== undefined) {
                return this.serializeFieldValue(preferredValue);
            }

            return JSON.stringify(objectValue);
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
            return `${value}`;
        }

        if (typeof value === 'symbol') {
            return value.description ?? value.toString();
        }

        return JSON.stringify(value);
    }

    private normalizeGuid(value: string): string {
        return `${value ?? ''}`.replace(/[{}]/g, '');
    }
}