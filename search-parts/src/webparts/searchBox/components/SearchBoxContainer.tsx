import * as React from 'react';
import { ISearchBoxContainerProps } from './ISearchBoxContainerProps';
import { QueryPathBehavior, UrlHelper, PageOpenBehavior } from '../../../helpers/UrlHelper';
import { MessageBar, MessageBarType, SearchBox, IconButton, ISearchBox, DefaultButton, Icon } from '@fluentui/react';
import { ISearchBoxContainerState } from './ISearchBoxContainerState';
import { isEqual } from '@microsoft/sp-lodash-subset';
import * as webPartStrings from 'SearchBoxWebPartStrings';
import SearchBoxAutoComplete from './SearchBoxAutoComplete/SearchBoxAutoComplete';
import styles from './SearchBoxContainer.module.scss';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';

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

    private renderSearchButton(): JSX.Element {
        const displayMode = this.props.searchButtonDisplayMode || 'icon';
        const buttonText = this.props.searchButtonText || 'Search';
        const iconName = this.props.searchIconName || 'Forward';

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
                    iconProps={{ iconName }}
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
                        iconName={iconName} 
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
                    componentRef={searchBoxRef}
                    placeholder={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    ariaLabel={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    className={styles.searchTextField}
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
                    newUrl = UrlHelper.addOrReplaceQueryStringParam(searchUrl.href, this.props.queryStringParameter, queryText, true);
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

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                // Likely issue when q=%25 in spfx
            }

            this.setState({
                searchInputValue: query,
            });
        }
    }

    public render(): React.ReactElement<ISearchBoxContainerProps> {

        let renderTitle: JSX.Element = null;

        // WebPart title
        renderTitle = <WebPartTitle
                        displayMode={this.props.webPartTitleProps.displayMode}
                        title={this.props.webPartTitleProps.title}
                        updateProperty={this.props.webPartTitleProps.updateProperty}
                        className={this.props.webPartTitleProps.className} />;

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
                {renderTitle}
                {renderSearchBox}
            </div>
        );
    }
}
