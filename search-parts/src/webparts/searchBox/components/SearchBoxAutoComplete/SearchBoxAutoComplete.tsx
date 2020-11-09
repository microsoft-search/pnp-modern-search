import * as React from 'react';
import styles from '../SearchBoxContainer.module.scss';
import { ISearchBoxAutoCompleteState } from './ISearchBoxAutoCompleteState';
import { ISearchBoxAutoCompleteProps } from './ISearchBoxAutoCompleteProps';
import { Spinner, SpinnerSize, FocusZone, FocusZoneDirection, SearchBox, IconButton, Label, Icon, IconType } from 'office-ui-fabric-react';
import { ITheme } from 'office-ui-fabric-react/lib/Styling';
import { isEqual, debounce } from '@microsoft/sp-lodash-subset';
import { ISuggestion } from '@pnp/modern-search-extensibility';
import * as webPartStrings from 'SearchBoxWebPartStrings';
import * as DOMPurify from 'dompurify';

const SUGGESTION_CHAR_COUNT_TRIGGER = 2;
const SUGGESTION_UPDATE_DEBOUNCE_DELAY = 200;

export default class SearchBoxAutoComplete extends React.Component<ISearchBoxAutoCompleteProps, ISearchBoxAutoCompleteState> {

  private _onChangeDebounced = null;
  private _containerElemRef: React.RefObject<any> = null;

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
      isSearchExecuted: false
    };

    this._updateQuerySuggestions = this._updateQuerySuggestions.bind(this);
    this._selectQuerySuggestion = this._selectQuerySuggestion.bind(this);
    this._containerElemRef = React.createRef();
  }

  private _renderSuggestionGroups(): JSX.Element {

    let renderSuggestions: JSX.Element = null;

    if (this.state.proposedQuerySuggestions.length > 0) {

      const suggestionGroups = this.state.proposedQuerySuggestions.reduce<{[key: string]: { groupName: string, suggestions: { suggestion: ISuggestion, index: number }[] }}>((groups, suggestion, index) => {
          const groupName = suggestion && suggestion.groupName ? suggestion.groupName.trim() : webPartStrings.PropertyPane.QuerySuggestionsGroup.DefaultSuggestionGroupName;
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
        let renderedSuggestions: JSX.Element[] = [];
        
        currentGroup.suggestions.forEach((item, i) => {

          if (i <this.props.numberOfSuggestionsPerGroup) {
            indexIncrementer++;
            renderedSuggestions.push(this._renderSuggestion(item.suggestion, indexIncrementer));
          }
        });

        return (
          <>
              <Label className={styles.suggestionGroupName}>{groupName}</Label>
              <div>
                {renderedSuggestions}
              </div>
          </>
        );
      });

      renderSuggestions = <div className={styles.suggestionPanel}>
                            { renderedSuggestionGroups }
                          </div>;
    }

    return renderSuggestions;
  }

  private _renderSuggestion(suggestion: ISuggestion, suggestionIndex: number): JSX.Element {
    const thisComponent = this;

    const suggestionInner = <>
      <div className={styles.suggestionContainer}>
        <div className={styles.suggestionIcon}>
          {suggestion.iconSrc && <img src={suggestion.iconSrc} />}
        </div>
        <div className={styles.suggestionContent}>
          <span className={styles.suggestionDisplayText} dangerouslySetInnerHTML={{ __html: DOMPurify.default.sanitize(suggestion.displayText) }}></span>
          <span className={styles.suggestionDescription}>{suggestion.description ? suggestion.description : ""}</span>
        </div>
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

    const baseProps = {
      key: suggestionIndex,
      title: suggestion.hoverText ? suggestion.hoverText : "",
      className: styles.suggestionItem,
      'data-is-focusable': true, // Used by FocusZone component
      onClick: () => thisComponent._selectQuerySuggestion(suggestion, !!suggestion.targetUrl)
    };

    return (!!suggestion.targetUrl
      ? <a {...baseProps}
          href={suggestion.targetUrl}
          target="_blank"
          data-interception="off" // Bypass SPFx page router (https://docs.microsoft.com/en-us/sharepoint/dev/spfx/hyperlinking)
        >
          {suggestionInner}
      </a>
      : <div {...baseProps}>
          {suggestionInner}
      </div>
    );
  }

  private _renderLoadingIndicator(): JSX.Element {
    return (
      <div className={styles.suggestionPanel}>
        <div className={styles.loadingIndicator}>
          <Spinner size={ SpinnerSize.small }/>
        </div>
      </div>
    );
  }

    /**
   * Handler when a user enters new keywords in the search box input
   * @param inputValue
   */
  private async _updateQuerySuggestions(inputValue: string) {

      const trimmedInputValue = inputValue ? inputValue.trim() : "";

      if (trimmedInputValue && trimmedInputValue.length >= SUGGESTION_CHAR_COUNT_TRIGGER) {

        try {

          this.setState({
            isRetrievingSuggestions: true,
            errorMessage: null,
            proposedQuerySuggestions: [],
          });

          const allProviderPromises = this.props.suggestionProviders.map(async (provider) => {

              let suggestions = await provider.getSuggestions(trimmedInputValue);

              // Verify before updating proposed suggestions
              //  1) the input value hasn't been searched
              //  2) we have suggestions from this provider
              //  3) the input value hasn't changed while the provider was retrieving suggestions
              if (!this.state.isSearchExecuted && suggestions.length > 0 && (!this.state.termToSuggestFrom || inputValue === this.state.searchInputValue)) {
                this.setState({
                  proposedQuerySuggestions: this.state.proposedQuerySuggestions.concat(suggestions), // Merge suggestions
                  termToSuggestFrom: inputValue, // The term that was used as basis to get the suggestions from
                  isRetrievingSuggestions: false
                });
              }
          });

          // After all suggestion providers have finished, hide the loading indicator if it hasn't already been hid
          Promise.all(allProviderPromises).then(() => {
            if (this.state.isRetrievingSuggestions) {
              this.setState({
                isRetrievingSuggestions: false
              });
            }
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
              errorMessage: null,
              proposedQuerySuggestions: trimmedInputValue.length === 0 ? this.state.zeroTermQuerySuggestions : [],
              isRetrievingSuggestions: false
            });
          }
          else {
            await this._ensureZeroTermQuerySuggestions();
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

  private async _ensureZeroTermQuerySuggestions(forceUpdate: boolean = false): Promise<void> {
    if ((!this.state.hasRetrievedZeroTermSuggestions && !this.state.isRetrievingZeroTermSuggestions) || forceUpdate) {

      // Verify we have at least one suggestion provider that has isZeroTermSuggestionsEnabled
      if (this.props.suggestionProviders && this.props.suggestionProviders.some(sgp => sgp.isZeroTermSuggestionsEnabled)) {
        this.setState({
          zeroTermQuerySuggestions: [],
          isRetrievingZeroTermSuggestions: true,
        });

        const allZeroTermSuggestions = await Promise.all(this.props.suggestionProviders.map(async (provider): Promise<ISuggestion[]> => {
          let zeroTermSuggestions = [];

          // Verify we have a valid suggestion provider and it is enabled
          if (provider && provider.isZeroTermSuggestionsEnabled) {
            zeroTermSuggestions = await provider.getZeroTermSuggestions();
          }

          return zeroTermSuggestions;
        }));

        // Flatten two-dimensional array of zero term suggestions
        const mergedSuggestions = allZeroTermSuggestions.reduce((allSuggestions, suggestions) => allSuggestions.concat(suggestions), []);

        this.setState({
          hasRetrievedZeroTermSuggestions: true,
          isRetrievingZeroTermSuggestions: false,
          zeroTermQuerySuggestions: mergedSuggestions,
        });
      }
      else {
        this.setState({
          zeroTermQuerySuggestions: [],
          hasRetrievedZeroTermSuggestions: true,
        });
      }
    }
  }

  /**
   * Handler when a suggestion is selected in the dropdown
   * @param suggestion the suggestion value
   */
  private _selectQuerySuggestion(suggestion: ISuggestion, isClicked: boolean = false) {

    const termToSuggestFromIndex = this.state.searchInputValue.indexOf(this.state.termToSuggestFrom);
    let replacedSearchInputvalue =  this._replaceAt(this.state.searchInputValue, termToSuggestFromIndex, suggestion.displayText);

    // Remove inner HTML markup if there is
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
      this.setState({
        searchInputValue: replacedSearchInputvalue,
        proposedQuerySuggestions: []
      }, () => this.props.onSearch(this.state.searchInputValue));
    }
    else {
      if (suggestion.targetUrl && !isClicked) {
        window.open(suggestion.targetUrl, '_blank');
      }
      this.props.onSearch('', true);
    }

    this._clearSuggestions();
  }

  private _replaceAt(string: string, index: number, replace: string) {
    return string.substring(0, index) + replace;
  }

  private _clearSuggestions = () => {
    if (this.state.proposedQuerySuggestions.length > 0) {
      this.setState({proposedQuerySuggestions: []});
    }
  }

  private _showZeroTermSuggestions = () => {
    if (this.state.hasRetrievedZeroTermSuggestions && this.state.zeroTermQuerySuggestions.length > 0) {
      if (!isEqual(this.state.proposedQuerySuggestions, this.state.zeroTermQuerySuggestions)) {
        this.setState({proposedQuerySuggestions: this.state.zeroTermQuerySuggestions});
      }
    }
  }

  private _handleOnFocus = () => {
    if (!this.state.searchInputValue) {
      this._showZeroTermSuggestions();
    }
  }

  private _handleOnSearch = () => {
    this.props.onSearch(this.state.searchInputValue);
    this.setState({
      isSearchExecuted: true,
      proposedQuerySuggestions: []
    });
  }

  private _handleOnClear = () => {
    this._updateQuerySuggestions('');
    this.props.onSearch('', true);
  }

  private _handleClickOutsideContainer = (event) => {
    if (!this._containerElemRef.current.contains(event.target)) {
      this._clearSuggestions();
    }
  }

  public componentDidMount() {
    this._ensureZeroTermQuerySuggestions();
    document.addEventListener('click', this._handleClickOutsideContainer);
  }

  public componentWillUnmount() {
    document.removeEventListener('click', this._handleClickOutsideContainer);
  }

  public componentDidUpdate(prevProps: ISearchBoxAutoCompleteProps) {
    // Detect if any of our suggestion providers have changed
    if (prevProps.suggestionProviders.length !== this.props.suggestionProviders.length
     || !isEqual(prevProps.suggestionProviders, this.props.suggestionProviders)) {
      this._ensureZeroTermQuerySuggestions(true);
    }

    if (!isEqual(prevProps.inputValue,this.props.inputValue)) {
      // Reset the inout value
      this.setState({
        searchInputValue: this.props.inputValue
      });
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
          direction={FocusZoneDirection.bidirectional}
          isCircularNavigation={true}
          defaultActiveElement={`.ms-SearchBox.${styles.searchTextField}`}
        >
          <div className={styles.searchBoxWrapper}>
            <SearchBox
              placeholder={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
              theme={this.props.themeVariant as ITheme}
              className={ styles.searchTextField }
              value={ this.state.searchInputValue }
              autoComplete= "off"
              data-is-focusable={this.state.proposedQuerySuggestions.length > 0}
              onChange={ (value) => {
                if (!this._onChangeDebounced) {
                  this._onChangeDebounced = debounce((newValue) => {
                    this._updateQuerySuggestions(newValue);
                  }, SUGGESTION_UPDATE_DEBOUNCE_DELAY);
                }
                this._onChangeDebounced(value);
                this.setState({
                  searchInputValue: value,
                  isRetrievingSuggestions: true,
                  isSearchExecuted: false,
                });
              }}
              onFocus={this._handleOnFocus}
              onSearch={this._handleOnSearch}
              onClear={this._handleOnClear}
            />
            <div className={styles.searchButton}>
              {this.state.searchInputValue &&
                <IconButton
                  onClick={this._handleOnSearch}
                  iconProps={{iconName: 'Forward' }}
                />
              }
            </div>
          </div>
          {!this.state.isSearchExecuted && (!!this.state.searchInputValue || this.state.proposedQuerySuggestions.length > 0)
            ? showLoadingIndicator
              ? this._renderLoadingIndicator()
              : this._renderSuggestionGroups()
            : null}
        </FocusZone>
      </div>
    );
  }

}
