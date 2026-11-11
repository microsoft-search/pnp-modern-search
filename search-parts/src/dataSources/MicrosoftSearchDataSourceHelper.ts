export function flattenMissingResourceRootProperties(
    hit: any,
    copyFieldWithAliases: (target: any, fieldName: string, value: any) => void
): void {
    Object.keys(hit.resource).forEach(field => {
        if (field !== '@odata.type' && field !== 'fields' && !(field in hit)) {
            copyFieldWithAliases(hit, field, hit.resource[field]);
        }
    });
}