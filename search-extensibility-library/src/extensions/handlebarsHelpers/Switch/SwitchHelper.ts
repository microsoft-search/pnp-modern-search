import { BaseHandlebarsHelper } from "search-extensibility";

export class SwitchHelper extends BaseHandlebarsHelper {
    
    public helper(value: any, options: any) : string {
        this["switch_value"] = value;
        this["switch_break"] = false;
        return options.fn(this);
    }

}