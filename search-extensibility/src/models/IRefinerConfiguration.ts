import { RefinersSortOption } from './RefinersSortOption';
import { RefinerTemplateOption } from './RefinerTemplateOption';
import { RefinerSortDirection } from './RefinerSortDirection';

export interface IRefinerConfiguration {

    /**
     * The SharePoint refiner name
     */
    refinerName: string;


    /**
     * The refiner name to display in the UI
     */
    displayValue: string;

    /**
     * The selected template for this refiner
     */
    template: RefinerTemplateOption;

    /**
     * How the refiner values should be sorted
     */
    refinerSortType: RefinersSortOption;

    /**
     * Direction of sorting values
     */
    refinerSortDirection: RefinerSortDirection;

    /** 
     * Allow refiners to be expanded by default
     */
    showExpanded: boolean;

    /** 
     * Show filter textbox to search inside the refiner values
     */
    showValueFilter: boolean;

    /**
     * The handlebars template
     */
    customTemplate?:string;

    /**
     * The custom template URL
     */
    customTemplateUrl?:string;
    
}