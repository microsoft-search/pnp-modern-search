import { ISynonymsService } from './ISynonymsService';
import { ISynonymsTableEntry } from '../../models/search/ISynonymsTableEntry';
import { IQueryTermToSynonymsEntry } from '../../models/search/IQueryTermToSynonymsEntry';

export class SynonymsService implements ISynonymsService {

    public async enrichQueryWithSynonyms(queryText: string, synonymsList: ISynonymsTableEntry[]): Promise<string> {
        // storing the original query to use for query expansion bulding...
        // wee are keeping the case of the queryText to keep AND, NOT,... in their case (operators have to be uppercase to be handled as operators!)
        let originalQuery: string = queryText;

        // initialize/set default return value to the original query (to be used if no synonyms found)
        let modifiedQuery: string = queryText;

        // only modify the query if it is not undefined, otherwise we would have the string 'undefined' in the query
        if (modifiedQuery != undefined) {

            // evaluating the raw query by stripping query operators and converting to lowercase...
            let rawQuery = originalQuery.replace(/((^|\s)-[\w-]+[\s$])|(-"\w+.*?")|(-?\w+[:=<>]+\w+)|(-?\w+[:=<>]+".*?")|((\w+)?\(.*?\))|(AND)|(OR)|(NOT)/g, " ").replace(/[ ]{2,}/, " ").toLocaleLowerCase().trim();

            // now prepare all term/word combinations from the raw query to get possible standing terms (like 'United States of America)
            // (each loop gets forward and backward combinations from the term/word)
            var termCombinations = [];
            if (rawQuery.length > 0 ) {
                // only do, if the raw query is not empty after rempoving all the operators...
                let queryTerms = rawQuery.split(" ");
                for (var i = 0; i < queryTerms.length; i++) {
                    termCombinations.push(<IQueryTermToSynonymsEntry>{ queryTerm: queryTerms[i]});
                    for (var j = i; j < queryTerms.length; j++)
                    {
                        if (j < queryTerms.length - 1) {
                            termCombinations.push(<IQueryTermToSynonymsEntry>{ queryTerm: termCombinations[termCombinations.length - 1].queryTerm + " " + queryTerms[j + 1]});
                        }
                    }
                }
            }

            // now looping through each term/word combination and check if there has been synonyms defined for this combination
            // (per default synonyms are handled mutual if not specified otherwise)
            // the synonyms counter us used for later decison if we have fond synonyms over the whole query
            let termsWithSynonymsCounter = 0;
            for (let combination of termCombinations) {
                // do the lookup in the synonym table...
                //let synonymsList = await this.sharePointListService.getAllItemsFromList("Synonyms")
                let foundSynonymListEntries = synonymsList.filter(entry => entry.synonyms.split(';').filter(synonym => synonym.toLowerCase() == combination.queryTerm).length > 0);
                if (foundSynonymListEntries.length > 0) {
                    let synonymsForTerm = "";
                    for (let listEntry of foundSynonymListEntries) {
                        let listEntrySynonyms = listEntry.synonyms.toLocaleLowerCase();
                        if (listEntry.mutual == false) {
                            // if the synonym list entry is not mutual, only synonyms are taken in conideration, where the 1st synonym ('keyword') matches the term 
                            if (listEntrySynonyms.indexOf(combination.queryTerm) == 0) {
                                synonymsForTerm = synonymsForTerm + ";" + listEntrySynonyms.replace(combination.queryTerm, "").replace(";;", ";").replace(/^;+|;+$/g, '');
                            }
                        } else {
                            synonymsForTerm = synonymsForTerm + ";" + listEntrySynonyms.replace(combination.queryTerm, "").replace(";;", ";").replace(/^;+|;+$/g, '');
                        }
                    }
                    // trimming leadidnd trailing semmicolons of the combined string
                    synonymsForTerm = synonymsForTerm.replace(/^;+|;+$/g, '');

                    // and adding the prepared synonyms to the desired QueryTermToSynonymsEntry and increasing the counter
                    combination.foundSynonyms = synonymsForTerm;
                    termsWithSynonymsCounter++;
                }
            }

            // preparing the returned query string:
            if (termsWithSynonymsCounter > 0) {
                // only modify the query if we have found any synonyms

                // first we use the original query with all the operators... 
                modifiedQuery = "(" + originalQuery + ")";

                // ... and adding OR variations of the original query replaced with the synonyms for each term combination...
                for (let combination of termCombinations) {

                    // only process combination entries where we have found synonyms 
                    if (combination.foundSynonyms) {

                        // split the found synonyms so that we can loop over them and prepare the OR variation with all synonyms
                        let splittedSynonyms = combination.foundSynonyms.split(';');

                        let orVariation = "";
                        for (let synonym of splittedSynonyms) {
                            // multi value synonyms are put in quotation marks
                            orVariation = orVariation + " OR " + this.formatSynonym(synonym);
                        }
                        // removing the first OR from the variation
                        orVariation = orVariation.replace(/^\sOR\s+|\sOR\s+$/g, '');

                        // if we have more than one element put it in brackets...
                        if (splittedSynonyms.length > 1) {
                            orVariation = "(" + orVariation + ")";
                        }

                        // finally replacing the term combination in the original query
                        // case insensitive to keep query operators as OR, AND, NOT,... in their case (operators have to be uppercase to be handled as operators!)
                        var regex = new RegExp(combination.queryTerm, "gi");
                        let replacedOriginalQuery = originalQuery.replace(regex, orVariation);

                        // putting the original query with replaced synonyms as OR variation to the query string 
                        modifiedQuery = modifiedQuery + " OR (" + replacedOriginalQuery + ")";
                    }
                }
            } else {
                // No synonyms found over the whole query --> we keep the initial copy of the original query...
            }
        } else {
            // no query to modify...
        }

        // TODO: maybe remove/comment out in a later stage        
        // writing some output for debugging purposes
        console.log("original query: '" + originalQuery + "'");
        console.log("modified query: '" + modifiedQuery + "'");

        // and returning the (un)modified query text...
        return modifiedQuery;
    }

    // Helper function to put multi value terms into quotation marks
    private formatSynonym(value: string): string {
        if (!value) return "";
        value = value.trim().replace(/"/g, '').trim();
        if (value.indexOf(' ') > -1) {
            value = '"' + value + '"';
        }
        return value;
    }

}