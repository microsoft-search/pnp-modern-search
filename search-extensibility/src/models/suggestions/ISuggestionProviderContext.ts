import { IDataVertical } from '../verticals/IDataVertical';

/**
 * Provides contextual information for the current suggestion request.
 */
export interface ISuggestionProviderContext {

    /**
     * Information about the connected Search Verticals Web Part.
     */
    verticals?: {

        /**
         * The currently selected vertical, if any.
         */
        selectedVertical?: IDataVertical;
    };
}
