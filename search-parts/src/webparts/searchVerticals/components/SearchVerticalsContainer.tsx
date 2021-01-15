import * as React from 'react';
import styles from './SearchVerticalsContainer.module.scss';
import { ISearchVerticalsContainerProps } from './ISearchVerticalsContainerProps';
import { Pivot, PivotItem, IPivotItemProps, Icon, GlobalSettings, IChangeDescription } from 'office-ui-fabric-react';
import { ITheme } from '@uifabric/styling';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import { PageOpenBehavior } from '../../../helpers/UrlHelper';
import { ISearchVerticalsContainerState } from './ISearchVerticalsContainerState';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';

export default class SearchVerticalsContainer extends React.Component<ISearchVerticalsContainerProps, ISearchVerticalsContainerState> {

  public constructor(props) {
    super(props);

    this.state = {
      selectedKey: undefined
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

      if (vertical.iconName && vertical.iconName.trim() !== "") {
        pivotItemProps.itemIcon = vertical.iconName;
      }

      return  <PivotItem
                headerText={vertical.tabName}
                itemKey={vertical.key}
                onRenderItemLink={(props, defaultRender) => {

                  if (vertical.isLink) {
                    return  <div className={styles.isLink}>
                              {defaultRender(props)}
                              {vertical.openBehavior === PageOpenBehavior.NewTab ?
                                <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 }}} iconName='NavigateExternalInline'></Icon>:
                                <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 }}} iconName='Link'></Icon>
                              }      
                            </div>;
                  } else {
                    return defaultRender(props);
                  }              
                }}
                {...pivotItemProps}>
              </PivotItem>;
    });

    return  <>
              {renderTitle}
              <Pivot className={styles.dataVerticals}
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

  public componentDidMount() {

    const defaultSelectedKey = this.props.verticals.length > 0 ? this.props.verticals[0].key :undefined;

    this.setState({
      selectedKey: defaultSelectedKey
    });

    // Return the default selected key
    this.props.onVerticalSelected(defaultSelectedKey);
  }
}
