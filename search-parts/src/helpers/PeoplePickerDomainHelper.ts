import type { IPersonaProps } from '@fluentui/react/lib/Persona';

export interface IAllowedEmailDomains {
    configured: boolean;
    valid: boolean;
    domains: string[];
}

export type PeoplePickerDomainStatus = 'allowed' | 'disallowed' | 'unverified';

export class PeoplePickerDomainHelper {
    private static normalizeDomain(value: string): string | undefined {
        const domain = value.trim().toLowerCase();
        if (!domain || /\s/.test(domain) || !/^[a-z0-9\u0080-\uffff.-]+$/i.test(domain) || domain.endsWith('.')) {
            return undefined;
        }

        try {
            const hostname = new URL(`https://${domain}`).hostname;
            if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
                return undefined;
            }
            const labels = hostname.split('.');
            const validLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
            return hostname.length <= 253 && labels.length > 1 && labels.every(label => validLabel.test(label))
                ? hostname
                : undefined;
        } catch (error) {
            if (error instanceof TypeError) {
                return undefined;
            }
            throw error;
        }
    }

    public static parse(value: unknown): IAllowedEmailDomains {
        if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
            return { configured: false, valid: true, domains: [] };
        }

        if (typeof value !== 'string') {
            return { configured: true, valid: false, domains: [] };
        }

        const entries = value.split(/[;,]/).map(entry => entry.trim()).filter(Boolean);
        if (entries.length === 0) {
            return { configured: false, valid: true, domains: [] };
        }

        const domains = entries.map(entry => this.normalizeDomain(entry));
        if (domains.some(domain => !domain)) {
            return { configured: true, valid: false, domains: [] };
        }

        return { configured: true, valid: true, domains: Array.from(new Set(domains)).sort((left, right) => left.localeCompare(right, 'en')) };
    }

    public static getEmailDomain(value: unknown): string | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }

        const match = /^([^\s@|/\\:<>"(),;]+)@([^\s@]+)$/.exec(value.trim());
        if (!match || /(?:#|%23)ext(?:#|%23)/i.test(match[1])) {
            return undefined;
        }

        return this.normalizeDomain(match[2]);
    }

    public static getStatus(person: IPersonaProps, allowlist: IAllowedEmailDomains): PeoplePickerDomainStatus {
        if (!allowlist.configured) {
            return 'allowed';
        }

        const domain = this.getEmailDomain(person?.secondaryText);
        if (!allowlist.valid || !domain) {
            return 'unverified';
        }

        return allowlist.domains.includes(domain) ? 'allowed' : 'disallowed';
    }

    public static filterSuggestions(people: IPersonaProps[], allowlist: IAllowedEmailDomains): IPersonaProps[] {
        if (!allowlist.configured) {
            return people;
        }

        return people.filter(person => this.getStatus(person, allowlist) === 'allowed');
    }
}
