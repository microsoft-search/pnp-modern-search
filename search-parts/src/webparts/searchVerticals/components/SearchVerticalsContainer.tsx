import * as React from 'react';
import styles from './SearchVerticalsContainer.module.scss';
import { ISearchVerticalsContainerProps } from './ISearchVerticalsContainerProps';
import { StyledWebPartTitle } from '../../../components/StyledWebPartTitle';
import { PageOpenBehavior } from '../../../helpers/UrlHelper';
import { ISearchVerticalsContainerState } from './ISearchVerticalsContainerState';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { Log } from '@microsoft/sp-core-library';
import { GlobalSettings, IChangeDescription } from '@fluentui/react/lib/Utilities';
import { IPivotItemProps, Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Icon } from '@fluentui/react/lib/Icon';
import { ITheme, ThemeProvider } from '@fluentui/react/lib/Theme';
import { getTheme } from '@fluentui/react';

const VerticalContainer_LogSource = "PnPModernSearch:PanelComponent";

export default class SearchVerticalsContainer extends React.Component<ISearchVerticalsContainerProps, ISearchVerticalsContainerState> {

  public constructor(props) {
    super(props);

    this.state = {
      selectedKey: props.defaultSelectedKey
    };

    // Listen to inputQueryText value change on the page
    GlobalSettings.addChangeListener((changeDescription: IChangeDescription) => {
      if (changeDescription.key === BuiltinTokenNames.inputQueryText) {
        this.props.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, GlobalSettings.getValue(BuiltinTokenNames.inputQueryText));
      }
    });

    this.onVerticalSelected = this.onVerticalSelected.bind(this);
  }

  public render(): React.ReactElement<ISearchVerticalsContainerProps> {

    const renderTitle = <StyledWebPartTitle
      instanceId={this.props.instanceId}
      titleFont={this.props.titleFont}
      titleFontSize={this.props.titleFontSize}
      titleFontColor={this.props.titleFontColor}
      webPartTitleProps={this.props.webPartTitleProps}
    />;

    const renderPivotItems = this.props.verticals.map(vertical => {

      const pivotItemProps: IPivotItemProps = {};
      let renderLinkIcon: JSX.Element = null;

      if (vertical.iconName && vertical.iconName.trim() !== "") {
        pivotItemProps.itemIcon = vertical.iconName;
      }

      if (vertical.showLinkIcon) {
        renderLinkIcon = vertical.openBehavior === PageOpenBehavior.NewTab ?
          <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 } }} iconName='NavigateExternalInline' /> :
          <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 } }} iconName='Link' />;
      }

      return <PivotItem
        headerText={vertical.tabName}
        key={vertical.key}
        itemKey={vertical.key}
        onRenderItemLink={(props, defaultRender) => {

          if (vertical.isLink) {
            return <div className={styles.isLink}>
              {defaultRender(props)}
              {renderLinkIcon}
            </div>;
          } else {
            return defaultRender(props);
          }
        }}
        {...pivotItemProps} />;
    });

    const theme = getTheme();

    const pivotStyles = {
      root: {
        backgroundColor: this.props.verticalBackgroundColor || undefined
      },
      link: {
        fontSize: this.props.verticalFontSize ? `${this.props.verticalFontSize}px` : undefined,
        selectors: {
          ':hover': {
            backgroundColor: this.props.verticalMouseOverColor || undefined
          }
        }
      },
      linkIsSelected: {
        fontSize: this.props.verticalFontSize ? `${this.props.verticalFontSize}px` : undefined,
        selectors: {
          ':hover': {
            backgroundColor: this.props.verticalMouseOverColor || undefined
          }
        }
      }
    };

    const containerStyles: React.CSSProperties = {
      borderStyle: this.props.verticalBorderColor || this.props.verticalBorderThickness ? 'solid' : undefined,
      borderColor: this.props.verticalBorderColor || undefined,
      borderWidth: this.props.verticalBorderThickness !== undefined ? `${this.props.verticalBorderThickness}px` : undefined
    };

    return <div style={containerStyles}>
      <ThemeProvider
        theme={theme}
        className={styles.searchVerticalsContainer}>
        {renderTitle}
        <Pivot
          className={styles.dataVerticals}
          onLinkClick={this.onVerticalSelected}
          selectedKey={this.state.selectedKey}
          theme={this.props.themeVariant as ITheme}
          styles={pivotStyles}>
          {renderPivotItems}
        </Pivot>
      </ThemeProvider>
    </div>;
  }

  public onVerticalSelected(item: PivotItem): void {

    const verticalIdx = this.props.verticals.map(vertical => vertical.key).indexOf(item.props.itemKey);

    if (verticalIdx !== -1) {

      const vertical = this.props.verticals[verticalIdx];
      if (vertical.isLink && vertical.linkUrl) {
        // Send the query to the new page
        this.props.tokenService.resolveTokens(vertical.linkUrl).then((resolvedUrl: string) => {
          const inputQueryText: string = !isEmpty(GlobalSettings.getValue(BuiltinTokenNames.inputQueryText)) ? GlobalSettings.getValue(BuiltinTokenNames.inputQueryText) : "";
          resolvedUrl = resolvedUrl.replace(/\{inputQueryText\}|\{searchTerms\}|\{SearchBoxQuery\}/gi, inputQueryText);
          resolvedUrl = resolvedUrl.replace(inputQueryText, encodeURIComponent(inputQueryText));

          // Block dangerous URI schemes (javascript:, data:, vbscript:, etc.)
          try {
            const parsed = new URL(resolvedUrl, window.location.href);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
              Log.warn(VerticalContainer_LogSource, `Blocked navigation to disallowed URL scheme: ${parsed.protocol}`);
              return;
            }
          } catch {
            Log.warn(VerticalContainer_LogSource, `Invalid URL for vertical navigation: ${resolvedUrl}`);
            return;
          }

          if (vertical.openBehavior === PageOpenBehavior.NewTab) {
            window.open(resolvedUrl, "_blank", "noopener");
          } else {
            // Allow SharePoint to intercept the click and do a soft navigation
            const anchor = document.createElement('a');
            anchor.href = resolvedUrl;
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          }

        }).catch(error => {
          Log.warn(VerticalContainer_LogSource, `Error navigating to vertical '${vertical.tabValue}' ${error}`);
        });

      } else {

        this.setState({
          selectedKey: item.props.itemKey
        });

        this.props.onVerticalSelected(item.props.itemKey);
      }
    }
  }

  public componentDidMount() {

    let defaultSelectedKey = undefined;

    if (this.props.verticals.length > 0) {
      if (this.props.defaultSelectedKey) {
        defaultSelectedKey = this.props.defaultSelectedKey;
      } else {
        // By default, we select the first one
        defaultSelectedKey = this.props.verticals[0].key;
      }
    }

    this.setState({
      selectedKey: defaultSelectedKey
    });

    // Return the default selected key
    this.props.onVerticalSelected(defaultSelectedKey);
  }
}
