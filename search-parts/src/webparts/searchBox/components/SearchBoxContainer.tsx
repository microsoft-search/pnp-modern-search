import * as React from 'react';
import { ISearchBoxContainerProps } from './ISearchBoxContainerProps';
import { QueryPathBehavior, UrlHelper, PageOpenBehavior } from '../../../helpers/UrlHelper';
import { MessageBar, MessageBarType, SearchBox, IconButton, ITheme, ISearchBox } from 'office-ui-fabric-react';
import { ISearchBoxContainerState } from './ISearchBoxContainerState';
import { isEqual } from '@microsoft/sp-lodash-subset';
import * as webPartStrings from 'SearchBoxWebPartStrings';
import SearchBoxAutoComplete from './SearchBoxAutoComplete/SearchBoxAutoComplete';
import styles from './SearchBoxContainer.module.scss';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';
import { isEmpty } from '@microsoft/sp-lodash-subset';

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

        let searchBoxRef = React.createRef<ISearchBox>();

        return (
            <div className={styles.searchBoxWrapper}>
                <SearchBox
                    componentRef={searchBoxRef}
                    placeholder={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    ariaLabel={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    theme={this.props.themeVariant as ITheme}
                    className={styles.searchTextField}
                    value={this.state.searchInputValue}
                    autoComplete="off"
                    onChange={(event) => {
                        const newInputValue = event && event.currentTarget ? event.currentTarget.value : "";
                        const inputChanged = !isEmpty(this.state.searchInputValue) && isEmpty(newInputValue);

                        if (this.props.reQueryOnClear && inputChanged) {
                            this._onSearch('', true);
                            searchBoxRef.current.focus();
                        } else {
                            this.setState({ searchInputValue: newInputValue });
                        }
                    }}
                    onSearch={() => this._onSearch(this.state.searchInputValue)}
                    onClear={() => {
                        this._onSearch('', true);
                        searchBoxRef.current.focus();
                    }}
                />
                <div className={styles.searchButton}>
                    {this.state.searchInputValue &&
                        <IconButton
                            onClick={() => this._onSearch(this.state.searchInputValue)}
                            iconProps={{ iconName: 'Forward' }}
                            ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
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

                const tokenizedPageUrl = await this.props.tokenService.resolveTokens(this.props.pageUrl);
                const searchUrl = new URL(tokenizedPageUrl);
                
                let newUrl;

                if (this.props.queryPathBehavior === QueryPathBehavior.URLFragment) {
                    searchUrl.hash = urlEncodedQueryText;
                    newUrl = searchUrl.href;
                }
                else {
                    newUrl = UrlHelper.addOrReplaceQueryStringParam(searchUrl.href, this.props.queryStringParameter, queryText);
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

            let query = this.props.inputValue;
            try {
                query = decodeURIComponent(this.props.inputValue);

            } catch (error) {
                // Likely issue when q=%25 in spfx
            }

            this.setState({
                searchInputValue: query,
            });
        }
    }

    public render(): React.ReactElement<ISearchBoxContainerProps> {
        let renderErrorMessage: JSX.Element = null;

        if (this.state.errorMessage) {
            renderErrorMessage = <MessageBar messageBarType={MessageBarType.error}
                dismissButtonAriaLabel='Close'
                isMultiline={false}
                onDismiss={() => {
                    this.setState({
                        errorMessage: null,
                    });
                }}
                className={styles.errorMessage}>
                {this.state.errorMessage}</MessageBar>;
        }

        const renderSearchBox = this.props.enableQuerySuggestions ?
            this.renderSearchBoxWithAutoComplete() :
            this.renderBasicSearchBox();
        return (
            <div className={styles.searchBox}>
                {renderErrorMessage}
                {renderSearchBox}
            </div>
        );
    }
}
