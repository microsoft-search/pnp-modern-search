import * as React from 'react';
import { ISearchBoxContainerProps } from './ISearchBoxContainerProps';
import { QueryPathBehavior, UrlHelper, PageOpenBehavior } from '../../../helpers/UrlHelper';
import { MessageBar, MessageBarType, SearchBox, IconButton, ISearchBox, DefaultButton, Icon, concatStyleSets, createTheme, ThemeProvider, getId } from '@fluentui/react';
import { getSearchButtonColorStyles } from './SearchButtonStyles';
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

    private readonly _searchInputId = getId('pnp-search-input-');

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
        const colorStyles = getSearchButtonColorStyles(this.props.themeVariant, this.props.searchButtonColor, this.props.searchButtonTextColor);

        const commonStyles = {
            root: {
                width: '100%',
                height: '100%',
                minWidth: '32px',
                padding: displayMode === 'icon' ? '0 4px' : '0 12px',
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
                    onRenderIcon={() => <Icon {...iconProps} style={{ fontSize: iconFontSize, color: 'inherit', display: 'inline-flex' }} />}
                    ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
                    styles={concatStyleSets(colorStyles, {
                        ...commonStyles,
                        icon: {
                            fontSize: iconFontSize
                        }
                    })}
                />
            );
        } else if (displayMode === 'text') {
            // Text only
            return (
                <DefaultButton
                    onClick={() => this._onSearch(this.state.searchInputValue)}
                    text={buttonText}
                    ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
                    styles={concatStyleSets(colorStyles, {
                        ...commonStyles,
                        label: {
                            fontSize: textFontSize,
                            fontWeight: '400'
                        }
                    })}
                />
            );
        } else {
            // Both text and icon - text first, then icon on the right
            return (
                <DefaultButton
                    onClick={() => this._onSearch(this.state.searchInputValue)}
                    ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
                    styles={concatStyleSets(colorStyles, {
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
                    })}
                >
                    <span style={{ 
                        marginRight: '6px',
                        fontSize: textFontSize,
                        fontWeight: '400'
                    }}>{buttonText}</span>
                    <Icon 
                        {...iconProps}
                        style={{ 
                            fontSize: iconFontSize
                        }} 
                    />
                </DefaultButton>
            );
        }
    }

    private renderSearchBoxWithAutoComplete(scopeLabel?: string, scopeMenu?: React.ReactElement): JSX.Element {
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
            searchButtonTextColor={this.props.searchButtonTextColor}
            placeholderTextColor={this.props.placeholderTextColor}
            searchBoxTextColor={this.props.searchBoxTextColor}
            showSearchButtonWhenEmpty={this.props.showSearchButtonWhenEmpty}
            searchButtonDisplayMode={this.props.searchButtonDisplayMode}
            searchIconName={this.props.searchIconName}
            searchButtonText={this.props.searchButtonText}
            inputIsDecoded={this.props.advancedSearch}
            searchStateVersion={this.props.searchStateVersion}
            scopeLabel={scopeLabel}
            scopeMenu={scopeMenu}
        />;
    }

    private renderBasicSearchBox(scopeLabel?: string, scopeMenu?: React.ReactElement): JSX.Element {

        let searchBoxRef = React.createRef<ISearchBox>();

        // Build dynamic styles
        const dynamicSearchBoxWrapperStyle: React.CSSProperties = {
            borderColor: this.props.searchBoxBorderColor || undefined,
            minHeight: this.props.searchBoxHeight || 32,
            height: this.props.searchBoxHeight ? `${this.props.searchBoxHeight}px` : undefined
        };

        const dynamicSearchBoxTextStyle = {
            color: this.props.searchBoxTextColor || undefined,
            height: this.props.searchBoxHeight ? `${this.props.searchBoxHeight - 2}px` : 'auto',
            fontSize: this.props.searchBoxFontSize ? `${this.props.searchBoxFontSize}px` : undefined,
            padding: '0 8px',
            paddingInlineStart: scopeLabel ? 0 : 8
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
            <div className={`${styles.searchBoxWrapper} ${scopeLabel ? styles.scopedSearchBox : ''}`} style={dynamicSearchBoxWrapperStyle}>
                {scopeLabel && <label htmlFor={this._searchInputId} className={styles.scopePrefix} title={`${scopeLabel}:`}>{scopeLabel}:</label>}
                <SearchBox
                    id={this._searchInputId}
                    iconProps={searchBoxIconProps}
                    componentRef={searchBoxRef}
                    placeholder={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    ariaLabel={`${scopeLabel ? `${scopeLabel}: ` : ''}${this.props.placeholderText || webPartStrings.SearchBox.DefaultPlaceholder}`}
                    className={`${styles.searchTextField} ${this.state.searchInputValue ? styles.hasSearchText : ''}`}
                    clearButtonProps={{ iconProps: { iconName: 'Back' }, ariaLabel: webPartStrings.SearchBox.ClearButtonLabel }}
                    value={this.state.searchInputValue}
                    autoComplete="off"
                    styles={{ root: dynamicSearchBoxTextStyle }}
                    style={{ ...dynamicPlaceholderStyle, ...dynamicIconStyle }}
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
                {scopeMenu}
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
            const selectedScopeKey = this.state.selectedScopeKey;
            if (this.props.advancedSearch) {
                try {
                    buildScopedSearchQuery(queryText, selectedScopeKey, this.props.searchScopes);
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
                        queryText, selectedScopeKey);
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
                this.props.onSearch(queryText, this.props.advancedSearch ? selectedScopeKey : undefined);
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

        const scopeOptions = [
            { key: ALL_SEARCH_SCOPE, text: commonStrings.AdvancedSearch.All },
            ...(this.props.searchScopes || []).map(scope => ({ key: scope.key, text: getSearchScopeLabel(scope, this.props.uiLanguage) }))
        ];
        const selectedScopeLabel = scopeOptions.find(scope => scope.key === this.state.selectedScopeKey)?.text || commonStrings.AdvancedSearch.All;
        const scopeLabel = `${commonStrings.AdvancedSearch.Scope}: ${selectedScopeLabel}`;
        const scopeTheme = createTheme(this.props.themeVariant);
        const colors = scopeTheme.semanticColors;
        const themeStyles = {
            backgroundColor: 'transparent',
            '--search-border': this.props.searchBoxBorderColor || colors.inputBorder,
            '--search-border-hover': this.props.searchBoxBorderColor || colors.inputBorderHovered,
            '--search-focus': this.props.searchBoxBorderColor || colors.inputFocusBorderAlt,
            '--search-background': colors.inputBackground,
            '--search-text': this.props.searchBoxTextColor || colors.inputText,
            '--search-font-size': `${this.props.searchBoxFontSize || 14}px`,
            '--placeholder-color': this.props.placeholderTextColor || colors.inputPlaceholderText,
            '--search-icon-color': colors.inputIcon,
            '--search-button-background': this.props.searchButtonColor || colors.primaryButtonBackground,
            '--search-button-hover': this.props.searchButtonColor || colors.primaryButtonBackgroundHovered,
            '--search-button-text': colors.primaryButtonText,
            '--suggestion-background': colors.menuBackground,
            '--suggestion-hover': colors.menuItemBackgroundHovered,
            '--suggestion-text': colors.menuItemText,
            '--suggestion-secondary': colors.bodySubtext
        } as React.CSSProperties;
        const scopePrefix = this.props.advancedSearch && this.state.selectedScopeKey !== ALL_SEARCH_SCOPE
            ? selectedScopeLabel : undefined;
        const scopeMenu = this.props.advancedSearch ? <IconButton
            className={styles.scopeButton}
            iconProps={{ iconName: 'Filter' }}
            onRenderIcon={() => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M2 4h12M4 8h8M6 12h4" fill="none" stroke="currentColor" strokeLinecap="round" />
            </svg>}
            ariaLabel={scopeLabel}
            title={scopeLabel}
            onRenderMenuIcon={() => null}
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
                    width: 28,
                    minWidth: 28,
                    height: 'auto',
                    alignSelf: 'stretch',
                    border: 'none',
                    borderRadius: 2,
                    color: colors.inputIcon,
                    backgroundColor: colors.inputBackground
                },
                rootHovered: { backgroundColor: colors.buttonBackgroundHovered, color: colors.inputIcon },
                rootPressed: { backgroundColor: colors.buttonBackgroundPressed, color: colors.inputIcon }
            }}
        /> : undefined;
        const renderSearchBox = this.props.enableQuerySuggestions
            ? this.renderSearchBoxWithAutoComplete(scopePrefix, scopeMenu)
            : this.renderBasicSearchBox(scopePrefix, scopeMenu);
        return (
            <ThemeProvider theme={scopeTheme} className={styles.searchBox} style={themeStyles}>
                {renderErrorMessage}
                {renderTitle}
                {renderSearchBox}
            </ThemeProvider>
        );
    }
}
