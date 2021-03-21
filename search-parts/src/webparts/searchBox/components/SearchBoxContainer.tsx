import * as React from 'react';
import { ISearchBoxContainerProps } from './ISearchBoxContainerProps';
import { QueryPathBehavior, UrlHelper, PageOpenBehavior } from '../../../helpers/UrlHelper';
import { MessageBar, MessageBarType, SearchBox, IconButton } from 'office-ui-fabric-react';
import { ISearchBoxContainerState } from './ISearchBoxContainerState';
import { ITheme } from '@uifabric/styling';
import { isEqual } from '@microsoft/sp-lodash-subset';
import * as webPartStrings from 'SearchBoxWebPartStrings';
import SearchBoxAutoComplete from './SearchBoxAutoComplete/SearchBoxAutoComplete';
import styles from './SearchBoxContainer.module.scss';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';

export default class SearchBoxContainer extends React.Component<ISearchBoxContainerProps, ISearchBoxContainerState> {

  public constructor(props: ISearchBoxContainerProps) {

    super(props);

    this.state = {
      searchInputValue: (props.inputValue) ? decodeURIComponent(props.inputValue) : '',
      errorMessage: null,
      showClearButton: !!props.inputValue,
    };

    this._onSearch = this._onSearch.bind(this);
  }

  private renderSearchBoxWithAutoComplete(): JSX.Element {
    return <SearchBoxAutoComplete
            inputValue={this.props.inputValue}
            onSearch={this._onSearch}
            placeholderText={this.props.placeholderText}
            suggestionProviders={this.props.suggestionProviders}
            themeVariant={this.props.themeVariant}
            domElement={this.props.domElement}
            numberOfSuggestionsPerGroup={this.props.numberOfSuggestionsPerGroup}
          />;
  }

  private renderBasicSearchBox(): JSX.Element {
    return (
      <div className={styles.searchBoxWrapper}>
        <SearchBox
          placeholder={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
          theme={this.props.themeVariant as ITheme}
          className={ styles.searchTextField }
          value={ this.state.searchInputValue }
          autoComplete= "off"
          onChange={(value) => this.setState({ searchInputValue: value })}
          onSearch={() => this._onSearch(this.state.searchInputValue)}
          onClear={() => this._onSearch('', true)}
        />
        <div className={styles.searchButton}>
          {this.state.searchInputValue &&
            <IconButton
              onClick={() => this._onSearch(this.state.searchInputValue)}
              iconProps={{iconName: 'Forward' }}
            />
          }
        </div>
      </div>
    );
  }

  /**
   * Handler when a user enters new keywords
   * @param queryText The query text entered by the user
   */
  public async _onSearch(queryText: string, isReset: boolean = false) {

    // Don't send empty value
    if (queryText || isReset) {

      this.setState({
        searchInputValue: queryText,
        showClearButton: !isReset
      });

      if (this.props.searchInNewPage && !isReset && this.props.pageUrl) {
        
        this.props.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, queryText);
        queryText = await this.props.tokenService.resolveTokens(this.props.inputTemplate);

        const urlEncodedQueryText = encodeURIComponent(queryText);

        const searchUrl = new URL(this.props.pageUrl);
        let newUrl;

        if (this.props.queryPathBehavior === QueryPathBehavior.URLFragment) {
          searchUrl.hash = urlEncodedQueryText;
          newUrl = searchUrl.href;
        }
        else {
          newUrl = UrlHelper.addOrReplaceQueryStringParam(searchUrl.href, this.props.queryStringParameter, urlEncodedQueryText);
        }

        // Send the query to the new page
        const behavior = this.props.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self';
        window.open(newUrl, behavior);

      } else {

        // Notify the dynamic data controller
        this.props.onSearch(queryText);
      }
    }
  }


  public componentDidUpdate(prevProps: ISearchBoxContainerProps, prevState: ISearchBoxContainerState) {

    if (!isEqual(prevProps.inputValue, this.props.inputValue)) {
      this.setState({
        searchInputValue: decodeURIComponent(this.props.inputValue),
      });
    }
  }

  public render(): React.ReactElement<ISearchBoxContainerProps> {
    let renderErrorMessage: JSX.Element = null;

    if (this.state.errorMessage) {
      renderErrorMessage = <MessageBar messageBarType={ MessageBarType.error }
                                        dismissButtonAriaLabel='Close'
                                        isMultiline={ false }
                                        onDismiss={ () => {
                                          this.setState({
                                            errorMessage: null,
                                          });
                                        }}
                                        className={styles.errorMessage}>
                                        { this.state.errorMessage }</MessageBar>;
    }

    const renderSearchBox = this.props.enableQuerySuggestions ?
                          this.renderSearchBoxWithAutoComplete() :
                          this.renderBasicSearchBox();
    return (
      <div className={styles.searchBox}>
        { renderErrorMessage }
        { renderSearchBox }
      </div>
    );
  }
}
