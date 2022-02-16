import { IRefinerGroupsDialogStrings } from "./IRefinerGroupsDialogStrings";
import { IRefinerGroupValue } from "@pnp/modern-search-extensibility/lib/models/filters/IRefinerGroupValue";

export interface IRefinerGroupsDialogProps {
  refinerGroupsValue?: IRefinerGroupValue[];
  onChanged: (value: IRefinerGroupValue[]) => void;
  disabled?: boolean;
  strings: IRefinerGroupsDialogStrings;    
}