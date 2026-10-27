import * as React from 'react';
import { ISearchBoxContainerProps } from './ISearchBoxContainerProps';
import { QueryPathBehavior, UrlHelper, PageOpenBehavior } from '../../../helpers/UrlHelper';
import { MessageBar, MessageBarType, SearchBox, IconButton, ISearchBox, DefaultButton, Icon, createTheme } from '@fluentui/react';
import { ISearchBoxContainerState } from './ISearchBoxContainerState';
import { isEqual } from '@microsoft/sp-lodash-subset';
import * as webPartStrings from 'SearchBoxWebPartStrings';
import SearchBoxAutoComplete from './SearchBoxAutoComplete/SearchBoxAutoComplete';
import styles from './SearchBoxContainer.module.scss';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { StyledWebPartTitle } from '../../../components/StyledWebPartTitle';
import * as commonStrings from 'CommonStrings';
import { ALL_SEARCH_SCOPE, buildScopedSearchQuery, getSearchScopeLabel, SearchScopeError, writeScopedSearchUrl } from '../../../helpers/SearchScopeHelper';
import { searchBoxIconProps } from './SearchBoxIcon';

export default class SearchBoxContainer extends React.Component<ISearchBoxContainerProps, ISearchBoxContainerState> {

    public constructor(props: ISearchBoxContainerProps) {

        super(props);

        this.state = {
            searchInputValue: props.advancedSearch ? (props.inputValue || '') : ((props.inputValue) ? decodeURIComponent(props.inputValue) : ''),
            selectedScopeKey: props.selectedScopeKey || ALL_SEARCH_SCOPE,
            errorMessage: null,
            showClearButton: !!props.inputValue,
        };

        this._onSearch = this._onSearch.bind(this);
    }

    private renderSearchButton(): JSX.Element {
        const displayMode = this.props.searchButtonDisplayMode || 'icon';
        const buttonText = this.props.searchButtonText || 'Search';
        const iconProps = this.props.searchIconName ? { iconName: this.props.searchIconName } : searchBoxIconProps;

        const commonStyles = {
            root: {
                backgroundColor: this.props.searchButtonColor || undefined,
                width: '100%',
                height: '100%',
                minWidth: '32px',
                padding: '0 12px', // More padding on left and right
                color: 'white',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                border: 'none'
            }
        };

        const iconFontSize = this.props.searchBoxFontSize ? `${this.props.searchBoxFontSize}px` : '16px';
        const textFontSize = this.props.searchBoxFontSize ? `${this.props.searchBoxFontSize}px` : '14px';

        if (displayMode === 'icon') {
            // Icon only
            return (
                <IconButton
                    onClick={() => this._onSearch(this.state.searchInputValue)}
                    iconProps={iconProps}
                    onRenderIcon={() => <Icon {...iconProps} style={{ fontSize: iconFontSize, color: 'white', display: 'inline-flex' }} />}
                    ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
                    styles={{
                        ...commonStyles,
                        icon: {
                            fontSize: iconFontSize,
                            color: 'white'
                        }
                    }}
                />
            );
        } else if (displayMode === 'text') {
            // Text only
            return (
                <DefaultButton
                    onClick={() => this._onSearch(this.state.searchInputValue)}
                    text={buttonText}
                    ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
                    styles={{
                        ...commonStyles,
                        label: {
                            color: 'white',
                            fontSize: textFontSize,
                            fontWeight: '400'
                        }
                    }}
                />
            );
        } else {
            // Both text and icon - text first, then icon on the right
            return (
                <DefaultButton
                    onClick={() => this._onSearch(this.state.searchInputValue)}
                    ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
                    styles={{
                        ...commonStyles,
                        root: {
                            ...commonStyles.root,
                            padding: '0 12px' // More padding on left and right
                        },
                        flexContainer: {
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row' // Text first, icon second
                        }
                    }}
                >
                    <span style={{ 
                        marginRight: '6px',
                        color: 'white',
                        fontSize: textFontSize,
                        fontWeight: '400'
                    }}>{buttonText}</span>
                    <Icon 
                        {...iconProps}
                        style={{ 
                            fontSize: iconFontSize, 
                            color: 'white'
                        }} 
                    />
                </DefaultButton>
            );
        }
    }

    private renderSearchBoxWithAutoComplete(): JSX.Element {
        return <SearchBoxAutoComplete
            inputValue={this.props.inputValue}
            onSearch={this._onSearch}
            placeholderText={this.props.placeholderText}
            suggestionProviders={this.props.suggestionProviders}
            suggestionProviderContext={this.props.suggestionProviderContext}
            themeVariant={this.props.themeVariant}
            domElement={this.props.domElement}
            numberOfSuggestionsPerGroup={this.props.numberOfSuggestionsPerGroup}
            searchBoxBorderColor={this.props.searchBoxBorderColor}
            searchBoxHeight={this.props.searchBoxHeight}
            searchBoxFontSize={this.props.searchBoxFontSize}
            searchButtonColor={this.props.searchButtonColor}
            placeholderTextColor={this.props.placeholderTextColor}
            searchBoxTextColor={this.props.searchBoxTextColor}
            showSearchButtonWhenEmpty={this.props.showSearchButtonWhenEmpty}
            searchButtonDisplayMode={this.props.searchButtonDisplayMode}
            searchIconName={this.props.searchIconName}
            searchButtonText={this.props.searchButtonText}
            inputIsDecoded={this.props.advancedSearch}
            searchStateVersion={this.props.searchStateVersion}
        />;
    }

    private renderBasicSearchBox(): JSX.Element {

        let searchBoxRef = React.createRef<ISearchBox>();

        // Build dynamic styles
        const dynamicSearchBoxWrapperStyle: React.CSSProperties = {
            borderColor: this.props.searchBoxBorderColor || '#c2c2c2',
            height: this.props.searchBoxHeight ? `${this.props.searchBoxHeight}px` : undefined
        };

        const dynamicSearchBoxTextStyle: React.CSSProperties = {
            color: this.props.searchBoxTextColor || undefined,
            height: this.props.searchBoxHeight ? `${this.props.searchBoxHeight - 2}px` : undefined, // Account for border
            fontSize: this.props.searchBoxFontSize ? `${this.props.searchBoxFontSize}px` : undefined,
            padding: '0 8px' // Add space before and after text
        };

        const dynamicPlaceholderStyle: React.CSSProperties = this.props.placeholderTextColor ? {
            '--placeholder-color': this.props.placeholderTextColor
        } as React.CSSProperties : {};

        // Dynamic icon sizing for search icon and clear icon
        const iconFontSize = this.props.searchBoxFontSize ? `${this.props.searchBoxFontSize}px` : '16px';
        const dynamicIconStyle: React.CSSProperties = {
            '--search-icon-size': iconFontSize,
            '--clear-icon-size': iconFontSize
        } as React.CSSProperties;

        return (
            <div className={styles.searchBoxWrapper} style={dynamicSearchBoxWrapperStyle}>
                <SearchBox
                    iconProps={searchBoxIconProps}
                    componentRef={searchBoxRef}
                    placeholder={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    ariaLabel={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    className={`${styles.searchTextField} ${this.state.searchInputValue ? styles.hasSearchText : ''}`}
                    clearButtonProps={{ iconProps: { iconName: 'Back' }, ariaLabel: webPartStrings.SearchBox.ClearButtonLabel }}
                    value={this.state.searchInputValue}
                    autoComplete="off"
                    style={{...dynamicSearchBoxTextStyle, ...dynamicPlaceholderStyle, ...dynamicIconStyle}}
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
                {(this.state.searchInputValue || this.props.showSearchButtonWhenEmpty) &&
                    <div className={styles.searchButton}>
                        {this.renderSearchButton()}
                    </div>
                }
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
            if (this.props.advancedSearch) {
                try {
                    buildScopedSearchQuery(queryText, this.state.selectedScopeKey, this.props.searchScopes);
                } catch (error) {
                    if (!(error instanceof SearchScopeError)) {
                        throw error;
                    }
                    this.setState({ errorMessage: commonStrings.AdvancedSearch.InvalidScope });
                    return;
                }
            }

            this.setState({
                searchInputValue: queryText,
                showClearButton: !isReset,
                errorMessage: null
            });

            if (this.props.searchInNewPage && !isReset && this.props.pageUrl) {
                if (this.props.advancedSearch) {
                    this.props.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, queryText);
                    const pageUrl = await this.props.tokenService.resolveTokens(this.props.pageUrl);
                    const url = writeScopedSearchUrl(pageUrl, this.props.queryStringParameter, this.props.scopeQueryStringParameter,
                        queryText, this.state.selectedScopeKey);
                    window.open(url, this.props.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self');
                    return;
                }

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
                    newUrl = UrlHelper.addOrReplaceQueryStringParam(searchUrl.href, this.props.queryStringParameter, queryText, true);
                }

                // Send the query to the new page
                const behavior = this.props.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self';
                window.open(newUrl, behavior);

            } else {

                // Notify the dynamic data controller
                this.props.onSearch(queryText, this.props.advancedSearch ? this.state.selectedScopeKey : undefined);
            }
        }
    }


    public componentDidUpdate(prevProps: ISearchBoxContainerProps, prevState: ISearchBoxContainerState) {
        if (prevProps.selectedScopeKey !== this.props.selectedScopeKey || prevProps.advancedSearch !== this.props.advancedSearch
            || (this.props.advancedSearch && (prevProps.inputValue !== this.props.inputValue || prevProps.searchStateVersion !== this.props.searchStateVersion))) {
            this.setState({ selectedScopeKey: this.props.selectedScopeKey || ALL_SEARCH_SCOPE, errorMessage: null });
        }

        if (!isEqual(prevProps.inputValue, this.props.inputValue)
            || (this.props.advancedSearch && prevProps.searchStateVersion !== this.props.searchStateVersion)) {

            let query = this.props.inputValue;
            if (!this.props.advancedSearch) {
                try {
                    query = decodeURIComponent(this.props.inputValue);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                    // Likely issue when q=%25 in spfx
                }
            }

            this.setState({
                searchInputValue: query,
            });
        }
    }

    public render(): React.ReactElement<ISearchBoxContainerProps> {

        const renderTitle = <StyledWebPartTitle
            instanceId={this.props.instanceId}
            titleFont={this.props.titleFont}
            titleFontSize={this.props.titleFontSize}
            titleFontColor={this.props.titleFontColor}
            webPartTitleProps={this.props.webPartTitleProps}
        />;

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
        const scopeOptions = [
            { key: ALL_SEARCH_SCOPE, text: commonStrings.AdvancedSearch.All },
            ...(this.props.searchScopes || []).map(scope => ({ key: scope.key, text: getSearchScopeLabel(scope, this.props.uiLanguage) }))
        ];
        const selectedScopeLabel = scopeOptions.find(scope => scope.key === this.state.selectedScopeKey)?.text || commonStrings.AdvancedSearch.All;
        const scopeLabel = `${commonStrings.AdvancedSearch.Scope}: ${selectedScopeLabel}`;
        const scopeTheme = createTheme(this.props.themeVariant);
        const hasPropertyScope = this.state.selectedScopeKey !== ALL_SEARCH_SCOPE;
        return (
            <div className={styles.searchBox}>
                {renderErrorMessage}
                {renderTitle}
                {this.props.advancedSearch ? <div className={styles.advancedSearchRow}>
                    <DefaultButton
                        text={selectedScopeLabel}
                        iconProps={{ iconName: 'Filter' }}
                        ariaLabel={scopeLabel}
                        title={scopeLabel}
                        menuProps={{
                            ariaLabel: commonStrings.AdvancedSearch.Scope,
                            items: scopeOptions.map(scope => ({
                                ...scope,
                                role: 'menuitemradio',
                                canCheck: true,
                                checked: scope.key === this.state.selectedScopeKey,
                                onClick: () => this.setState({ selectedScopeKey: scope.key, errorMessage: null })
                            }))
                        }}
                        theme={scopeTheme}
                        styles={{
                            root: {
                                minWidth: 0,
                                maxWidth: '40%',
                                borderRadius: '4px 0 0 4px',
                                borderColor: this.props.searchBoxBorderColor || '#c2c2c2',
                                height: 'auto',
                                minHeight: this.props.searchBoxHeight || 32,
                                alignSelf: 'stretch',
                                flexShrink: 0,
                                padding: '0 8px',
                                backgroundColor: hasPropertyScope ? scopeTheme.palette.themeLighter : undefined,
                                color: hasPropertyScope ? scopeTheme.palette.themeDark : undefined
                            },
                            flexContainer: { minWidth: 0, width: '100%' },
                            label: {
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: hasPropertyScope ? 600 : 400
                            }
                        }}
                    />
                    <div className={styles.advancedSearchInput}>{renderSearchBox}</div>
                </div> : renderSearchBox}
            </div>
        );
    }
}
