import * as Handlebars from 'handlebars';

const readFileSync: (path: string, encoding: string) => string = require('fs').readFileSync;
const resolve: (...paths: string[]) => string = require('path').resolve;
const currentDirectory: () => string = require('process').cwd;

describe('static People picker layouts', () => {
    it.each(['vertical', 'horizontal', 'panel'])('passes escaped domain settings and warnings through the %s layout', layout => {
        const path = resolve(currentDirectory(), 'src', 'layouts', 'filters', layout, `${layout}.html`);
        const template = readFileSync(path, 'utf8');
        const peopleElement = template.match(/<pnp-peoplefilter\b[\s\S]*?<\/pnp-peoplefilter>/i)?.[0];
        expect(peopleElement).toBeDefined();

        const handlebars = Handlebars.create();
        handlebars.registerHelper('JSONstringify', value => JSON.stringify(value));
        const domains = 'contoso.com; "invalid"';
        const markup = handlebars.compile(peopleElement)({
            instanceId: 'instance',
            theme: {},
            filter: {
                filterName: 'Owner',
                isMulti: true,
                allowedEmailDomains: domains,
                domainSelectionRemoved: true,
                values: []
            }
        });
        const host = document.createElement('div');
        host.innerHTML = markup;
        const element = host.querySelector('pnp-peoplefilter');

        expect(element?.getAttribute('data-allowed-email-domains')).toBe(domains);
        expect(element?.getAttribute('data-domain-selection-removed')).toBe('true');
        expect(element?.getAttribute('data-static-picker')).toBe('true');
    });
});
