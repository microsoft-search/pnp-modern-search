import { BaseHandlebarsHelper } from "search-extensibility";

export class SwitchCaseHelper extends BaseHandlebarsHelper {
    
    public helper(value: any, options: any) : string {
        if(this["switch_value"] === value) {
            this["switch_break"] = true;
            return options.fn(this);
        }
    }

}