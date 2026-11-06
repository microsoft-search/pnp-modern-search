import { flattenMissingResourceRootProperties } from './MicrosoftSearchDataSourceHelper';

describe('MicrosoftSearchDataSource resource field flattening', () => {
    it('uses nested list-item fields first and falls back to resource-level properties', () => {
        const hit: any = {
            Title: 'Nested title',
            resource: {
                fields: { Title: 'Nested title' },
                Title: 'Root title',
                webUrl: 'https://example.test/item'
            }
        };

        flattenMissingResourceRootProperties(hit, (target, fieldName, value) => {
            if (!(fieldName in target)) {
                target[fieldName] = value;
            }
        });

        expect(hit.Title).toBe('Nested title');
        expect(hit.webUrl).toBe('https://example.test/item');
    });
});