import { ISearchResults } from '../search-extensibility';
import IResultService from '../../../services/ResultService/IResultService';

export default interface ISearchResultProps {
    searchResults: ISearchResults;
    componentId: string;
    webServerRelativeUrl: string;
    secondaryTextField: string;
    tertiaryTextField: string;
}