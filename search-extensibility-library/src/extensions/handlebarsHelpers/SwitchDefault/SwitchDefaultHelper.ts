import { BaseHandlebarsHelper } from "search-extensibility";

export class SwitchDefaultHelper extends BaseHandlebarsHelper {
    
    public helper(value: any, options: any) : string {
        if(this["switch_break"] != true) {
            return options.fn(this);
        }
    }

}