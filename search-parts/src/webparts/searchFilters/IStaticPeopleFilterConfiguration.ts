import type { IDataFilterConfiguration, IDataFilterInfo } from '@pnp/modern-search-extensibility';

export interface IStaticPeopleFilterConfiguration extends IDataFilterConfiguration {
    allowedEmailDomains?: string;
}

export interface IStaticPeopleFilterEventInfo extends IDataFilterInfo {
    reconcileAllowedEmailDomains?: boolean;
}
