import * as React from 'react';
import ISearchVerticalsContainerProps from './ISearchVerticalsContainerProps';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react/lib/components/Pivot';
import ISearchVerticalsContainerState from './ISearchVerticalsContainerState';
import { ITheme } from '@uifabric/styling';
import templateStyles from '../../../../services/TemplateService/BaseTemplateService.module.scss';
import styles from './SearchVerticalsContainer.module.scss';
import Vertical from '../../../searchRefiners/components/Layouts/Vertical/Vertical';
import { PageOpenBehavior } from '../../../../helpers/UrlHelper';
import { Icon, GlobalSettings } from 'office-ui-fabric-react';

export default class SearchVerticalsContainer extends React.Component<ISearchVerticalsContainerProps, ISearchVerticalsContainerState> {

  private _pivotRef: any;

  public constructor(props) {
    super(props);

    this.state = {
      selectedKey: undefined
    };

    this.onVerticalSelected = this.onVerticalSelected.bind(this);
  }

  public render(): React.ReactElement<ISearchVerticalsContainerProps> {

    const renderPivotItems = this.props.verticals.map(vertical => {

      let pivotItemProps: IPivotItemProps = {};

      if (this.props.showCounts && (vertical.count !== undefined || vertical.count !== null)) {
        pivotItemProps.itemCount = vertical.count;
      }

      if (vertical.iconName && vertical.iconName.trim() !== "") {
        pivotItemProps.itemIcon = vertical.iconName;
      }

      return  <PivotItem
                headerText={vertical.tabName}
                itemKey={vertical.key}
                onRenderItemLink={(props, defaultRender) => {

                  if (vertical.isLink) {
                    return  <>
                              {defaultRender(props)}
                              {vertical.openBehavior === PageOpenBehavior.NewTab ?
                                <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 }}} iconName='NavigateExternalInline'></Icon>:
                                <Icon styles={{ root: { fontSize: 10, paddingLeft: 3 }}} iconName='Link'></Icon>
                              }      
                            </>;
                  } else {
                    return defaultRender(props);
                  }              
                }}
                {...pivotItemProps}>
              </PivotItem>;
    });

    return <Pivot className={styles.searchVerticals}
              componentRef={(e) => { this._pivotRef = e; }}
              onLinkClick={this.onVerticalSelected}
              selectedKey={this.state.selectedKey}
              defaultSelectedKey={this.props.defaultVerticalKey}
              theme={this.props.themeVariant as ITheme}>
              {renderPivotItems}
            </Pivot>;
  }

  public onVerticalSelected(item: PivotItem): void {

      const verticalIdx = this.props.verticals.map(vertical => vertical.key).indexOf(item.props.itemKey);
      
      if (verticalIdx !== -1) {

        const vertical = this.props.verticals[verticalIdx];
        if (vertical.isLink) {
            // Send the query to the new page
            const behavior = vertical.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self';
            this.props.tokenService.replaceQueryVariables(vertical.linkUrl).then((resolvedUrl: string) => {

              resolvedUrl = resolvedUrl.replace(/\{searchTerms\}|\{SearchBoxQuery\}/gi, GlobalSettings.getValue('searchBoxQuery'));
              window.open(resolvedUrl, behavior);
            });
            
        } else {

          this.setState({
            selectedKey: item.props.itemKey
          });

          this.props.onVerticalSelected(item.props.itemKey)
        }
      }    
  }

  public componentDidMount() {
    // Return the default selected key
    this.props.onVerticalSelected(this._pivotRef.state.selectedKey);
  }
}
