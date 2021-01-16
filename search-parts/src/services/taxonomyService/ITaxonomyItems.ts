/**
 * Interfaces for Term store, groups and term sets
 */
export enum TaxonomyItemType {
    TermStore = 'SP.Taxonomy.TermStore',
    TermGroup = 'SP.Taxonomy.TermGroup',
    TermGroupCollection = 'SP.Taxonomy.TermGroupCollection',
    TermSet = 'SP.Taxonomy.TermSet',
    TermSetCollection = 'SP.Taxonomy.TermSetCollection',
    Term = 'SP.Taxonomy.Term',
    TermCollection = 'SP.Taxonomy.TermCollection'
}

export interface ITaxonomyItem {
    _ObjectType_: TaxonomyItemType;
    _ObjectIdentity_: string;
    ParentId?: string;
    Id: string;
    Name: string;
    Children: ITaxonomyItem[];
}

export interface ITermStore extends ITaxonomyItem {
    Groups: IGroups;
}

export interface IGroups {
    _ObjectType_: TaxonomyItemType.TermGroupCollection; 
    _Child_Items_: IGroup[];
}

export interface IGroup extends ITaxonomyItem {
    TermSets: ITermSets;
    IsSystemGroup: boolean;
}

export interface ITermSets {
    _ObjectType_: TaxonomyItemType.TermSetCollection;
    _Child_Items_: ITermSet[];
}

export interface ITermSet extends ITaxonomyItem {
    CustomSortOrder?:string;
    Description: string;
    Names: ITermSetNames;
    Terms?: ITerm[];
}

export interface ITermSetNames {
    [locale: string]: string;
}

/**
 * Interfaces for the terms
 */
export interface ITerms {
    _ObjectType_: TaxonomyItemType.TermCollection;
    _Child_Items_: ITerm[];
}

/**
 * Term
 */
export interface ITerm extends ITaxonomyItem {
    Description: string;
    IsDeprecated: boolean;
    IsAvailableForTagging: boolean;
    IsRoot: boolean;
    PathOfTerm: string;
    TermSet: ITaxonomyItem;
    CustomSortOrderIndex?: number;
    PathDepth?: number;
    LocalCustomProperties?: {
        [property: string]: any
    };
}
