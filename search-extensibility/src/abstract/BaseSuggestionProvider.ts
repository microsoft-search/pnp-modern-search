import { ISuggestion } from '../models/ISuggestion';
import { IExtensionContext } from '../models/IExtensionContext';
import { IExtensionInstance } from '../models/instance/IExtensionInstance';
import { ExtensionTypes } from "../utility/ExtensionTypes";

export abstract class BaseSuggestionProvider implements IExtensionInstance {

  public extensionType: string = ExtensionTypes.SuggestionProvider;
  public context: IExtensionContext;

  protected _isSuggestionEnabled : boolean = false;

  protected _isZeroTermSuggestionsEnabled: boolean = false;

  public get isSuggestionsEnabled(): boolean {
    return this._isSuggestionEnabled;
  }

  public get isZeroTermSuggestionsEnabled(): boolean {
    return this._isZeroTermSuggestionsEnabled = false;
  }

  public async abstract onInit(): Promise<void>;

  public async abstract getSuggestions(queryText: string): Promise<ISuggestion[]>;

  public async abstract getZeroTermSuggestions(): Promise<ISuggestion[]>;

}
