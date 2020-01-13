import * as React from                               'react';
import { ISearchBoxContainerProps } from             './ISearchBoxContainerProps';
import * as strings from                             'SearchBoxWebPartStrings';
import ISearchBoxContainerState from                 './ISearchBoxContainerState';
import { PageOpenBehavior, QueryPathBehavior } from  '../../../../helpers/UrlHelper';
import { MessageBar, MessageBarType } from           'office-ui-fabric-react/lib/MessageBar';
import styles from '../SearchBoxWebPart.module.scss';
import ISearchQuery from '../../../../models/ISearchQuery';
import NlpDebugPanel from '../NlpDebugPanel/NlpDebugPanel';
import { ITheme } from '@uifabric/styling';
import SearchBoxAutoComplete from '../SearchBoxAutoComplete/SearchBoxAutoComplete';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

export default class SearchBoxContainer extends React.Component<ISearchBoxContainerProps, ISearchBoxContainerState> {

  public constructor(props: ISearchBoxContainerProps) {

    super(props);

    this.state = {
      enhancedQuery: null,
      searchInputValue: (props.inputValue) ? decodeURIComponent(props.inputValue) : '',
      errorMessage: null,
      showClearButton: !!props.inputValue,
    };

    this._onSearch = this._onSearch.bind(this);
  }

  private renderSearchBoxWithAutoComplete(): JSX.Element {
    return (
      <SearchBoxAutoComplete
        inputValue={this.props.inputValue}
        onSearch={this._onSearch}
        placeholderText={this.props.placeholderText}
        suggestionProviders={this.props.suggestionProviders}
        themeVariant={this.props.themeVariant}
        domElement={this.props.domElement}
      />
    );
  }

  private renderBasicSearchBox(): JSX.Element {
    return (
      <div className={styles.searchBoxWrapper}>
        <SearchBox
          placeholder={this.props.placeholderText ? this.props.placeholderText : strings.SearchInputPlaceholder}
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

      let query: ISearchQuery = {
        rawInputValue: queryText,
        enhancedQuery: ''
      };

      this.setState({
        searchInputValue: queryText,
        showClearButton: !isReset
      });

      if (this.props.enableNlpService && this.props.NlpService && queryText) {

        try {

          let enhancedQuery = await this.props.NlpService.enhanceSearchQuery(queryText, this.props.isStaging);
          query.enhancedQuery = enhancedQuery.enhancedQuery;

          enhancedQuery.entities.map((entity) => {
          });

          this.setState({
            enhancedQuery: enhancedQuery,
          });

        } catch (error) {

          // In case of failure, use the non-optimized query instead
          query.enhancedQuery = queryText;
        }
      }

      if (this.props.searchInNewPage && !isReset) {
        const urlEncodedQueryText = encodeURIComponent(queryText);

        const searchUrl = new URL(this.props.pageUrl);
        if (this.props.queryPathBehavior === QueryPathBehavior.URLFragment) {
          searchUrl.hash = urlEncodedQueryText;
        }
        else {
          searchUrl.searchParams.append(this.props.queryStringParameter, queryText);
        }

        // Send the query to the new page
        const behavior = this.props.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self';
        window.open(searchUrl.href, behavior);

      } else {

        // Notify the dynamic data controller
        this.props.onSearch(query);
      }
    }
  }


  public UNSAFE_componentWillReceiveProps(nextProps: ISearchBoxContainerProps) {
    this.setState({
      searchInputValue: decodeURIComponent(nextProps.inputValue),
    });
  }

  public render(): React.ReactElement<ISearchBoxContainerProps> {
    let renderErrorMessage: JSX.Element = null;

    const renderDebugInfos = this.props.enableNlpService && this.props.enableDebugMode ?
                              <NlpDebugPanel rawResponse={ this.state.enhancedQuery }/>:
                              null;

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
        { renderDebugInfos }
      </div>
    );
  }
}
