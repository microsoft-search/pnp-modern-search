import { IExtensionContext, ExtensionTypes, IRefinerInstance, IRefinementResult, RefinementFilterOperationCallback, IRefinementValue, IUserService } from "..";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

export abstract class BaseRefiner implements IRefinerInstance {

    public extensionType : string = ExtensionTypes.Refiner;
    public context : IExtensionContext;
    refinementResult: IRefinementResult;
    selectedValues: IRefinementValue[];
    onFilterValuesUpdated: RefinementFilterOperationCallback;
    isMultiValue?: boolean;
    shouldResetFilters: boolean;
    removeFilterValue?: IRefinementValue;
    userService?: IUserService;
    themeVariant: IReadonlyTheme;
    showValueFilter: boolean;

}