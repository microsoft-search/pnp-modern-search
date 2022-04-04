import { ServiceKey } from "@microsoft/sp-core-library";
import { IQueryModifier } from "./IQueryModifier";

export interface IQueryModifierDefinition {

  /**
    * The sortIdx
    */
  sortIdx: number;
  
  /**
   * The provider internal name
   */
  name: string;

  /**
   * The provider unique key
   */
  key: string;

  /**
   * The provider description
   */
  description: string;

  /**
   * Flag to indicate that no further transformation ist necessary when the query was transformed
   * This is checked only on a transformed query and not when a Modifier didn't change the query
   */
  endWhenSuccessfull: boolean;

  /**
   * The layout service key
   */
  serviceKey: ServiceKey<IQueryModifier>;
}