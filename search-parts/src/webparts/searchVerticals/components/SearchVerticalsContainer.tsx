import * as React from 'react';
import styles from './SearchVerticalsContainer.module.scss';
import { ISearchVerticalsContainerProps } from './ISearchVerticalsContainerProps';
import { Pivot, PivotItem, IPivotItemProps, Icon, GlobalSettings, IChangeDescription, ITheme } from 'office-ui-fabric-react';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import { PageOpenBehavior } from '../../../helpers/UrlHelper';
import { IConnectedResultWebpart, ISearchVerticalsContainerState } from './ISearchVerticalsContainerState';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';

export default class SearchVerticalsContainer extends React.Component<ISearchVerticalsContainerProps, ISearchVerticalsContainerState> {

  public constructor(props) {
    super(props);

    this.state = {
      selectedKey: undefined,
      connectedWebParts: []
    };

    // Listen to inputQueryText value change on the page
    GlobalSettings.addChangeListener((changeDescription: IChangeDescription) => {
      if (changeDescription.key === BuiltinTokenNames.inputQueryText) {
        this.props.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, GlobalSettings.getValue(BuiltinTokenNames.inputQueryText));
      }
    });

    this.onVerticalSelected = this.onVerticalSelected.bind(this);
  }

  private sourceUpdated = async (id: string) => {
    const source = this.props.dynamicDataProvider.tryGetSource(id);
    const propValue = await source.getPropertyValueAsync(source?.metadata?.alias);
    let copy = [...this.state.connectedWebParts];
    const item = copy.find(existingItem => existingItem.id === source.id);
    
    if(item.totalCount !== propValue.totalCount)
    {
      item.totalCount = propValue.totalCount;
      this.setState({
        connectedWebParts: copy
      });
    }
  }

  private availableSourcesUpdated = async () => {
    const sources = this.props.dynamicDataProvider?.getAvailableSources();
    if(!sources)
    {
      return;
    }

    const webparts = new Array<IConnectedResultWebpart>();

    for (const source of sources) {

      // if we already added the webpart, skip it.
      if (this.state.connectedWebParts.some(webpart => webpart.id === source.id)
        || webparts.some(webpart => webpart.id === source.id)) {
        continue;
      }
      // get it once to see if it supports totalCount
      const propValue = await source.getPropertyValueAsync(source?.metadata?.alias);

      if (!propValue || (typeof propValue === 'string') || !('totalCount' in propValue))
        continue;

      webparts.push({
        id: source.id,
        verticalIds: propValue.selectedVerticalKeys,
        totalCount: propValue.totalCount
      });

      this.props.dynamicDataProvider.registerPropertyChanged(source.id, source?.metadata?.alias, () => { this.sourceUpdated(source.id); });
    }

    if (webparts) {
      this.setState({
        connectedWebParts: [...this.state.connectedWebParts,
        ...webparts
        ]
      });
    }
  }

  public render(): React.ReactElement<ISearchVerticalsContainerProps> {

    let renderTitle: JSX.Element = null;

    // Web Part title
    renderTitle = <WebPartTitle
      displayMode={this.props.webPartTitleProps.displayMode}
      title={this.props.webPartTitleProps.title}
      updateProperty={this.props.webPartTitleProps.updateProperty}
      className={this.props.webPartTitleProps.className}
    />;

    const renderPivotItems = this.props.verticals.map(vertical => {

      let pivotItemProps: IPivotItemProps = {};
      let renderLinkIcon: JSX.Element = null;

      if (vertical.iconName && vertical.iconName.trim() !== "") {
        pivotItemProps.itemIcon = vertical.iconName;
      }

      if (vertical.showLinkIcon) {
        renderLinkIcon = vertical.openBehavior === PageOpenBehavior.NewTab ?
          <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 } }} iconName='NavigateExternalInline'></Icon> :
          <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 } }} iconName='Link'></Icon>;
      }

      let entryCount = 0;

      this.state.connectedWebParts.filter(webpart => webpart.verticalIds?.
        some(vId => vId === vertical.key))?.
        forEach(entry => entryCount += entry.totalCount ?? 0);

      return <PivotItem
        headerText={`${vertical.tabName} ${entryCount ? ` (${entryCount})` : ''}`}
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
        {...pivotItemProps}>
      </PivotItem>;
    });

    return <>
      {renderTitle}
      <Pivot
        className={styles.dataVerticals}
        onLinkClick={this.onVerticalSelected}
        selectedKey={this.state.selectedKey}
        theme={this.props.themeVariant as ITheme}>
        {renderPivotItems}
      </Pivot>
    </>;
  }

  public onVerticalSelected(item: PivotItem): void {

    const verticalIdx = this.props.verticals.map(vertical => vertical.key).indexOf(item.props.itemKey);

    if (verticalIdx !== -1) {

      const vertical = this.props.verticals[verticalIdx];
      if (vertical.isLink) {
        // Send the query to the new page
        const behavior = vertical.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self';
        this.props.tokenService.resolveTokens(vertical.linkUrl).then((resolvedUrl: string) => {
          resolvedUrl = resolvedUrl.replace(/\{searchTerms\}|\{SearchBoxQuery\}/gi, GlobalSettings.getValue(BuiltinTokenNames.inputQueryText));
          window.open(resolvedUrl, behavior);
        });

      } else {

        this.setState({
          selectedKey: item.props.itemKey
        });

        this.props.onVerticalSelected(item.props.itemKey);
      }
    }
  }

  public async componentDidMount() {

    // Listen to changes in result webparts only when showResultsCount is true
    if (this.props.showResultsCount) {
      await this.availableSourcesUpdated();
      this.props.dynamicDataProvider.registerAvailableSourcesChanged(this.availableSourcesUpdated);
    }

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
