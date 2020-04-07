import * as React from 'react';
import ISearchVerticalsContainerProps from './ISearchVerticalsContainerProps';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react/lib/components/Pivot';
import ISearchVerticalsContainerState from './ISearchVerticalsContainerState';
import { ITheme } from '@uifabric/styling';
import templateStyles from '../../../../services/TemplateService/BaseTemplateService.module.scss';
import styles from './SearchVerticalsContainer.module.scss';

export default class SearchVerticalsContainer extends React.Component<ISearchVerticalsContainerProps, ISearchVerticalsContainerState> {

  private _pivotRef: any;

  public constructor(props) {
    super(props);

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

      return <PivotItem
        headerText={vertical.tabName}
        itemKey={vertical.key}
        {...pivotItemProps}>
      </PivotItem>;
    });

    return <Pivot className={styles.searchVerticals}
              componentRef={(e) => { this._pivotRef = e; }}
              onLinkClick={this.onVerticalSelected}
              defaultSelectedKey={this.props.defaultVerticalKey}
              theme={this.props.themeVariant as ITheme}>
              {renderPivotItems}
            </Pivot>;
  }

  public onVerticalSelected(item: PivotItem): void {
    this.props.onVerticalSelected(item.props.itemKey);
  }

  public componentDidMount() {
    // Return the default selected key
    this.props.onVerticalSelected(this._pivotRef.state.selectedKey);
  }
}
