import * as React from 'react';
import * as strings from 'SearchBoxWebPartStrings';
import styles from '../SearchBoxWebPart.module.scss';
import { ISearchBoxAutoCompleteState } from './ISearchBoxAutoCompleteState';
import { ISearchBoxAutoCompleteProps } from './ISearchBoxAutoCompleteProps';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection, IFocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { ITheme } from 'office-ui-fabric-react/lib/Styling';
import { isEqual, debounce } from '@microsoft/sp-lodash-subset';
import { IconType, Icon } from 'office-ui-fabric-react/lib/Icon';
import { SuggestionType } from '../../../../models/SuggestionType';
import { ISuggestionPerson } from '../../../../models/ISuggestionPerson';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ISuggestion } from '../../../../models/ISuggestion';

const SUGGESTION_CHAR_COUNT_TRIGGER = 2;

export default class SearchBoxAutoComplete extends React.Component<ISearchBoxAutoCompleteProps, ISearchBoxAutoCompleteState> {

  private _onChangeDebounced = null;
  private _containerElemRef: React.RefObject<any> = null;
  private _lastActiveElemWasSearchInput = false;

  public constructor(props: ISearchBoxAutoCompleteProps) {

    super(props);

    this.state = {
      proposedQuerySuggestions: [],
      zeroTermQuerySuggestions: [],
      hasRetrievedZeroTermSuggestions: false,
      isRetrievingZeroTermSuggestions: false,
      isRetrievingSuggestions: false,
      searchInputValue: (props.inputValue) ? decodeURIComponent(props.inputValue) : '',
      termToSuggestFrom: null,
      errorMessage: null,
      focusedSuggestionId: '',
      isSearchBoxOpen: false,
    };

    this._onChange = this._onChange.bind(this);
    this._onQuerySuggestionSelected = this._onQuerySuggestionSelected.bind(this);
    this._onActiveElementChanged = this._onActiveElementChanged.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._containerElemRef = React.createRef();
  }


    /**
   * Renders the suggestions panel below the input control
   * @param getItemProps downshift getItemProps callback
   * @param selectedItem downshift selectedItem callback
   * @param highlightedIndex downshift highlightedIndex callback
   */
  private renderSuggestions(): JSX.Element {

    let renderSuggestions: JSX.Element = null;

    if (this.state.proposedQuerySuggestions.length > 0) {

      const suggestionGroups = this.state.proposedQuerySuggestions.reduce<{[key: string]: { groupName: string, suggestions: { suggestion: ISuggestion, index: number }[] }}>((groups, suggestion, index) => {
          const groupName = suggestion && suggestion.groupName ? suggestion.groupName.trim() : strings.SuggestionProviders.DefaultSuggestionGroupName;
          if (!groups[groupName]) {
            groups[groupName] = {
              groupName,
              suggestions: []
            };
          }
          groups[groupName].suggestions.push({ suggestion, index });
          return groups;
      }, {});

      let indexIncrementer = -1;
      const renderedSuggestionGroups = Object.keys(suggestionGroups).map(groupName => {
        const currentGroup = suggestionGroups[groupName];
        const renderedSuggestions = currentGroup.suggestions.map(item => {
          indexIncrementer++;
          return this.renderSuggestion(item.suggestion, indexIncrementer);
        });

        return (
          <>
              <Label className={styles.suggestionGroupName}>{groupName}</Label>
              <div>
                {renderedSuggestions}
              </div>
          </>
        )
      })

      renderSuggestions = <div className={styles.suggestionPanel}>
                            { renderedSuggestionGroups }
                          </div>;
    }

    return renderSuggestions;
  }

  private renderSuggestion(suggestion: ISuggestion, suggestionIndex: number): JSX.Element {
    const thisComponent = this;

    let suggestionInner: JSX.Element = null;
    let suggestionContent: JSX.Element = null;

    if (suggestion.type === SuggestionType.Person) {
      const personSuggestion = suggestion as ISuggestionPerson;
      const personFields = [];
      if (personSuggestion.jobTitle) personFields.push(personSuggestion.jobTitle);
      if (personSuggestion.emailAddress) personFields.push(personSuggestion.emailAddress);

      suggestionContent = <>
        <span dangerouslySetInnerHTML={{ __html: personSuggestion.displayText }}></span>
        <span className={styles.suggestionDescription}>{personFields.join(' | ')}</span>
      </>;
    }
    else {
      suggestionContent = <>
        <span dangerouslySetInnerHTML={{ __html: suggestion.displayText }}></span>
      </>;
    }

    suggestionInner = <>
      <div className={styles.suggestionIcon}>
        {suggestion.icon && <img src={suggestion.icon} />}
      </div>
      <div className={styles.suggestionContent}>
        {suggestionContent}
      </div>
      <div className={styles.suggestionAction}>
        {suggestion.targetUrl && (
          <Icon
            iconName='OpenInNewWindow'
            iconType={IconType.default}
          />
        )}
      </div>
    </>;

    const innerClassName = /*suggestionIndex === highlightedIndex ? `${styles.suggestionItem} ${styles.selected}` : */ `${styles.suggestionItem}`;

    const baseProps = {
      key: suggestionIndex,
      className: innerClassName,
      'data-is-focusable': true,
      'data-suggestion-id': suggestion.id,
    }
    return (<>
      {suggestion.targetUrl
          ? <a  {...baseProps}
                href={suggestion.targetUrl}
                target="_blank"
                data-interception="off" // Bypass SPFx page router (https://docs.microsoft.com/en-us/sharepoint/dev/spfx/hyperlinking)
                onClick={() => thisComponent._onQuerySuggestionSelected(suggestion, true)}>
              {suggestionInner}
            </a>
          : <div {...baseProps}
                onClick={() => thisComponent._onQuerySuggestionSelected(suggestion)}>
              {suggestionInner}
            </div>
        }
      </>
    );
  }

  private renderLoadingIndicator(): JSX.Element {
    return (
      <div className={styles.suggestionPanel}>
        <div className={styles.suggestionItem}>
          <Spinner size={ SpinnerSize.small }/>
        </div>
      </div>
    );
  }

    /**
   * Handler when a user enters new keywords in the search box input
   * @param inputValue
   */
  private async _onChange(inputValue: string) {


      if (inputValue && inputValue.length >= SUGGESTION_CHAR_COUNT_TRIGGER) {

        try {

          this.setState({
            isRetrievingSuggestions: true,
            errorMessage: null,
            proposedQuerySuggestions: [],
          });

          const allProviderPromises = this.props.suggestionProviders.map(async (provider) => {

            // Verify we have a valid suggestion provider and it is enabled
            if (provider && provider.providerEnabled && provider.instance.isSuggestionsEnabled) {
              let suggestions = await provider.instance.getSuggestions(inputValue);

              suggestions = suggestions.map((suggestion, index) => {
                suggestion.id = `suggestion-${provider.providerName}${suggestion.groupName}${index}`;
                return suggestion;
              });

              // Verify the input value hasn't changed before we add the returned suggestion
              if (!this.state.termToSuggestFrom || inputValue === this.state.searchInputValue) {
                this.setState({
                  proposedQuerySuggestions: this.state.proposedQuerySuggestions.concat(suggestions), // Merge suggestions
                  termToSuggestFrom: inputValue, // The term that was used as basis to get the suggestions from
                  isRetrievingSuggestions: false
                });
              }
            }

          });

          Promise.all(allProviderPromises).then(() => {
            this.setState({
              isRetrievingSuggestions: false
            })
          });

        } catch(error) {

          this.setState({
            errorMessage: error.message,
            proposedQuerySuggestions: [],
            isRetrievingSuggestions: false
          });
        }

      }
      else {

        try {

          //render zero term query suggestions
          if (this.state.hasRetrievedZeroTermSuggestions) {
            this.setState({
              proposedQuerySuggestions: this.state.zeroTermQuerySuggestions,
              isRetrievingSuggestions: false
            });
          }
          else {
            await this.ensureZeroTermQuerySuggestions();
          }
        } catch(error) {
          this.setState({
            errorMessage: error.message,
            proposedQuerySuggestions: [],
            isRetrievingSuggestions: false
          });
        }
      }

  }

  private async ensureZeroTermQuerySuggestions(forceUpdate: boolean = false): Promise<void> {
    if ((!this.state.hasRetrievedZeroTermSuggestions && !this.state.isRetrievingZeroTermSuggestions) || forceUpdate) {

      // Verify we have at least one suggestion provider that has isZeroTermSuggestionsEnabled
      if (this.props.suggestionProviders && this.props.suggestionProviders.some(sgp => sgp.instance && sgp.instance.isZeroTermSuggestionsEnabled)) {
        this.setState({
          zeroTermQuerySuggestions: [],
          isRetrievingZeroTermSuggestions: true,
        });

        const allZeroTermSuggestions = await Promise.all(this.props.suggestionProviders.map(async (provider): Promise<ISuggestion[]> => {
          let zeroTermSuggestions = [];

          // Verify we have a valid suggestion provider and it is enabled
          if (provider && provider.providerEnabled && provider.instance.isZeroTermSuggestionsEnabled) {
            zeroTermSuggestions = await provider.instance.getZeroTermSuggestions();

            zeroTermSuggestions = zeroTermSuggestions.map((suggestion, index) => {
              suggestion.id = `zeroterm-${provider.providerName}${suggestion.groupName}${index}`;
              return suggestion;
            });
          }

          return zeroTermSuggestions;
        }));

        // Flatten two-dimensional array of zero term suggestions
        const mergedSuggestions = allZeroTermSuggestions.reduce((allSuggestions, suggestions) => allSuggestions.concat(suggestions), []);

        this.setState({
          hasRetrievedZeroTermSuggestions: true,
          isRetrievingZeroTermSuggestions: false,
          zeroTermQuerySuggestions: mergedSuggestions,
          proposedQuerySuggestions: !this.state.searchInputValue ? mergedSuggestions : this.state.proposedQuerySuggestions,
        });
      }
      else {
        this.setState({
          hasRetrievedZeroTermSuggestions: true,
        });
      }

    }
  }

  /**
   * Handler when a suggestion is selected in the dropdown
   * @param suggestion the suggestion value
   */
  private _onQuerySuggestionSelected(suggestion: ISuggestion, isClicked: boolean = false) {
    console.log('Suggestion ONQUERYSUGGESTIONSELECTED', suggestion, isClicked);

    const termToSuggestFromIndex = this.state.searchInputValue.indexOf(this.state.termToSuggestFrom);
    let replacedSearchInputvalue =  this._replaceAt(this.state.searchInputValue, termToSuggestFromIndex, suggestion.displayText);

    // Remove inenr HTML markup if there is
    replacedSearchInputvalue = replacedSearchInputvalue.replace(/(<B>|<\/B>)/g,"");

    // Check if our custom suggestion has a onSuggestionSelected handler
    if (suggestion.onSuggestionSelected) {
      try {
        suggestion.onSuggestionSelected(suggestion);
      }
      catch (error) {
        console.log(`Error occurred while executing custom onSuggestionSeleted() handler. ${error}`);
      }
    }

    if (!suggestion.targetUrl) {
      this.props.onSearch(this.state.searchInputValue);
      this.setState({
        searchInputValue: replacedSearchInputvalue,
        // proposedQuerySuggestions:[],
      });
    }
    else {
      if (suggestion.targetUrl && !isClicked) {
        window.open(suggestion.targetUrl, '_blank');
      }
      this.props.onSearch('', true);
      // this.setState({
      //   proposedQuerySuggestions:[],
      // });
    }

    this._closeSearchBox();
  }

  private _replaceAt(string: string, index: number, replace: string) {
    return string.substring(0, index) + replace;
  }

  private _hideSearchSuggestionsOnClickOutside = (element) => {
    const thisComponent = this;

    // const removeClickListener = () => {
    //     document.removeEventListener('click', outsideClickListener);
    // };

    const outsideClickListener = event => {
        if (!element.contains(event.target)) {
          if (thisComponent.state.isSearchBoxOpen) {
            thisComponent.setState({ isSearchBoxOpen: false });
          }
          // removeClickListener();
        }
    };

    document.addEventListener('click', outsideClickListener);
}

  public componentDidMount() {
    this.ensureZeroTermQuerySuggestions();
    this._hideSearchSuggestionsOnClickOutside(this._containerElemRef.current);
  }

  public componentDidUpdate(prevProps: ISearchBoxAutoCompleteProps) {
    // Detect if any of our suggestion providers have changed
    if (prevProps.suggestionProviders.length !== this.props.suggestionProviders.length
     || !isEqual(prevProps.suggestionProviders, this.props.suggestionProviders)) {
      this.ensureZeroTermQuerySuggestions(true);
    }
  }

  private _onClearClick = () => {
    this._onChange('');
    this.props.onSearch('', true);
  }

  private _onActiveElementChanged = (element?: HTMLElement, evt?: any): void => {
    console.log('FocusZone ACTIVEELEMENTCHANGED', element, evt, this.state);

    const focusedSuggestionId = undefined !== element.dataset.suggestionId ? element.dataset.suggestionId : '';
    const isSearchBox = undefined !== element.dataset.isSearchBox ? true : false;

    if (isSearchBox && !this.state.isSearchBoxOpen) {
      if (!this._lastActiveElemWasSearchInput) {
        console.log('FocusZone !_lastActiveElemWasSearchInput');
        this._lastActiveElemWasSearchInput = true;
        this.setState({isSearchBoxOpen: true});
      } else {
        console.log('FocusZone _lastActiveElemWasSearchInput CLOSE');
        this._lastActiveElemWasSearchInput = false;
        this.setState({isSearchBoxOpen: false});
      }
    }
    else {
      this._lastActiveElemWasSearchInput = false;
      this.setState({ focusedSuggestionId: focusedSuggestionId });
    }
  }

  private _closeSearchBox = () => {
    this.setState({isSearchBoxOpen: false});
  }

  private _onKeyDown = (evt: React.KeyboardEvent<FocusZone | HTMLElement>) => {
    console.log('FocusZone KEYDOWN', this.state);
    // if (evt.keyCode === 38 || evt.keyCode === 40) { // ArrowUp or ArrowDown
    //   if (this._focusZoneComponentRef) {

    //   }
    // }
    if (evt.keyCode === 13) {
      // Submit search on "Enter"
      console.log('FocusZone, enter press', evt);
      const selectedSuggestion = this.state.proposedQuerySuggestions.find(psg => psg.id === this.state.focusedSuggestionId);
      if (selectedSuggestion) {
        this._onQuerySuggestionSelected(selectedSuggestion);
      }
    }
  }

  public render(): React.ReactElement<ISearchBoxAutoCompleteProps> {

    const showLoadingIndicator = (this.state.isRetrievingSuggestions && this.state.proposedQuerySuggestions.length === 0)
                              || (this.state.isRetrievingZeroTermSuggestions && !this.state.searchInputValue);


    // Edge case with SPFx
    // Only in Chrome/Firefox the parent element class ".Canvas-slideUpIn" create a new stacking context due to a 'transform' operation preventing the inner content to overlap other WP
    // We need to manually set a z-index on this element to render suggestions correctly above all content.
    try {
      const parentStackingContext = this.props.domElement.closest(".Canvas-slideUpIn");
      if (parentStackingContext) {
          parentStackingContext.classList.add(styles.parentStackingCtx);
      }
    } catch (error) {}

    return (
      <div ref={this._containerElemRef}>
        <FocusZone
          direction={FocusZoneDirection.vertical}
          isCircularNavigation={true}
          onActiveElementChanged={this._onActiveElementChanged}
          shouldInputLoseFocusOnArrowKey={() => true}
          onKeyDown={this._onKeyDown}
        >
          <SearchBox
            placeholder={this.props.placeholderText ? this.props.placeholderText : strings.SearchInputPlaceholder}
            theme={this.props.themeVariant as ITheme}
            className={ styles.searchTextField }
            value={ this.state.searchInputValue }
            autoComplete= "off"
            data-is-focusable={true}
            data-is-search-box={true}
            onChange={ (value) => {
              if (!this._onChangeDebounced) {
                this._onChangeDebounced = debounce((newValue) => {
                  this._onChange(newValue);
                }, 200);
              }
              this._onChangeDebounced(value);
              this.setState({
                searchInputValue: value,
                isRetrievingSuggestions: true,
              });
            }}
            // onFocus={() => {
            //   console.log('SearchBox FOCUS', this.state);
            //   if (!this.state.isSearchBoxOpen) {
            //     this.setState({ isSearchBoxOpen: true });
            //   }
            // }}
            // onBlur={() => {
            //   console.log('SearchBox BLUR', this.state);
            //   if (!this.state.isSearchBoxOpen) {
            //     this.setState({ isSearchBoxOpen: false });
            //   }
            //   if (!this.state.searchInputValue && this.state.zeroTermQuerySuggestions.length > 0 && this.state.proposedQuerySuggestions.length === 0) {
            //     this.setState({ proposedQuerySuggestions: this.state.zeroTermQuerySuggestions });
            //   }
            // }}
            onSearch={() => { this.props.onSearch(this.state.searchInputValue) }}
            onClear={this._onClearClick}
          />
          {this.state.isSearchBoxOpen ?
            showLoadingIndicator
              ? this.renderLoadingIndicator()
              : this.renderSuggestions()
              : null}
        </FocusZone>
      </div>
    );
  }

}
