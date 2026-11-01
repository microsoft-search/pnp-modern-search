import { PeoplePickerDomainHelper } from './PeoplePickerDomainHelper';

describe('PeoplePickerDomainHelper', () => {
    it.each([undefined, null, '', '  ', '; , '])('leaves an empty setting unrestricted (%s)', value => {
        expect(PeoplePickerDomainHelper.parse(value)).toEqual({ configured: false, valid: true, domains: [] });
    });

    it('normalizes, sorts and deduplicates comma- and semicolon-separated domains', () => {
        expect(PeoplePickerDomainHelper.parse(' Fabrikam.COM; contoso.com, CONTOSO.COM; ')).toEqual({
            configured: true,
            valid: true,
            domains: ['contoso.com', 'fabrikam.com']
        });
    });

    it('normalizes internationalized domain names to their ASCII form', () => {
        const allowlist = PeoplePickerDomainHelper.parse('BÜCHER.example');
        expect(allowlist.domains).toEqual(['xn--bcher-kva.example']);
        expect(PeoplePickerDomainHelper.getStatus({ secondaryText: 'reader@bücher.example' }, allowlist)).toBe('allowed');
        expect(PeoplePickerDomainHelper.getStatus({ secondaryText: 'reader@xn--bcher-kva.example' }, allowlist)).toBe('allowed');
    });

    it.each([
        123,
        '@contoso.com',
        '*.contoso.com',
        'https://contoso.com',
        'contoso.com; not_a_domain',
        'contoso..com',
        '-contoso.com',
        'contoso.com.'
    ])('rejects invalid configuration without making it unrestricted (%s)', value => {
        const allowlist = PeoplePickerDomainHelper.parse(value);
        expect(allowlist).toEqual({ configured: true, valid: false, domains: [] });
        expect(PeoplePickerDomainHelper.filterSuggestions([{ secondaryText: 'person@contoso.com' }], allowlist)).toEqual([]);
    });

    it('matches email domains exactly and without regard to case', () => {
        const allowlist = PeoplePickerDomainHelper.parse('contoso.com');
        expect(PeoplePickerDomainHelper.getStatus({ secondaryText: 'Person+tag@CONTOSO.COM' }, allowlist)).toBe('allowed');
        expect(PeoplePickerDomainHelper.getStatus({ secondaryText: 'person@subsidiary.contoso.com' }, allowlist)).toBe('disallowed');
        expect(PeoplePickerDomainHelper.getStatus({ secondaryText: 'person@contoso.com.example' }, allowlist)).toBe('disallowed');
    });

    it.each([
        '',
        'Alex Smith',
        'person@',
        'person@@contoso.com',
        'i:0#.f|membership|person@contoso.com',
        'person_external.com#EXT#@contoso.com',
        'person_external.com%23EXT%23@contoso.com'
    ])('treats a missing, invalid or encoded guest identity as unverified (%s)', value => {
        const allowlist = PeoplePickerDomainHelper.parse('contoso.com');
        expect(PeoplePickerDomainHelper.getStatus({ secondaryText: value }, allowlist)).toBe('unverified');
        expect(PeoplePickerDomainHelper.filterSuggestions([{ secondaryText: value }], allowlist)).toEqual([]);
    });

    it('filters suggestions only when a restriction is configured', () => {
        const people = [
            { text: 'Allowed', secondaryText: 'allowed@contoso.com' },
            { text: 'Other', secondaryText: 'other@fabrikam.com' },
            { text: 'Missing email' }
        ];
        expect(PeoplePickerDomainHelper.filterSuggestions(people, PeoplePickerDomainHelper.parse(''))).toBe(people);
        expect(PeoplePickerDomainHelper.filterSuggestions(people, PeoplePickerDomainHelper.parse('contoso.com'))).toEqual([people[0]]);
    });
});
