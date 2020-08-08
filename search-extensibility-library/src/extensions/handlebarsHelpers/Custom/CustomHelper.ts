import { BaseHandlebarsHelper } from "search-extensibility";

export class CustomHelper extends BaseHandlebarsHelper {
    
    public helper(input: string) : string {
        // log the input to the console.
        console.log(input);
        return input;
    }

}