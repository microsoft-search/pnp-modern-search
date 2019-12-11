// React
import * as React from 'react';

// SPFx
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Text } from '@microsoft/sp-core-library';

// UI Fabric
import { Shimmer, ShimmerElementsGroup, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import { Checkbox, ICheckboxProps } from 'office-ui-fabric-react/lib/Checkbox';

// Interface
export interface IPersonaCustomProps extends ICheckboxProps {
  context: WebPartContext;
  accountName: string;
  resultCount: number;
}

export interface IPersonaCustomState {
  pictureUrl: string;
  userName: string;
  userFunction: string;
}

// Component
export class PersonaCustom extends React.Component<IPersonaCustomProps, IPersonaCustomState> {

  constructor(props: IPersonaCustomProps) {
    super(props);

    this.state = {
      pictureUrl: null,
      userName: null,
      userFunction: null
    };
  }

  /**
   * Get user information
   * @param context sharepoint context
   */
  private async _getUserProperties(context: WebPartContext): Promise<void> {
    let accountName = !!this.props.accountName ? this.props.accountName.substr(this.props.accountName.search('i:0#.f')) : null;
    let requestUrl: string = `${context.pageContext.web.absoluteUrl}/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='${encodeURIComponent(accountName)}'&$select=DisplayName,UserProfileProperties,PictureUrl`;
    let response: SPHttpClientResponse = await context.spHttpClient.get(requestUrl, SPHttpClient.configurations.v1);
    if (response.ok) {
      let responseJSON = await response.json();
      if (!!responseJSON && !!responseJSON.DisplayName) {
        this.setState({
          userName: responseJSON.DisplayName.toString()
        });
      }
      if (responseJSON != null && responseJSON.UserProfileProperties != null) {
        responseJSON.UserProfileProperties.map((UserProfileProperty: any) => {
          if (UserProfileProperty.Key === 'SPS-JobTitle') {
            this.setState({
              userFunction: UserProfileProperty.Value
            });
          }
        });
      }
      if (!!responseJSON && !!responseJSON.PictureUrl) {
        this.setState({
          pictureUrl: responseJSON.PictureUrl.toString()
        });
      }
    } else {
      this.setState({
        userName: null,
        pictureUrl: null
      });
    }
  }

  /**
   * Init
   */
  public componentDidMount(): void {
    this._getUserProperties(this.props.context);
  }

  /**
   * Render
   */
  public render(): React.ReactElement<IPersonaCustomProps> {
    const { pictureUrl, userName, userFunction } = this.state;
    return (
      <>
        <Shimmer className='cnp-shimmer' customElementsGroup={this._getPersonaShimmer()} isDataLoaded={!!userName}>
          <Checkbox
            {...this.props}
            label={Text.format(`${userName} ({0})`, this.props.resultCount)}
          />
        </Shimmer>
      </>
    );
  }

  /**
   * Shimmer
   */
  private _getPersonaShimmer = (): JSX.Element => {
    return (
      <>
        <ShimmerElementsGroup
          flexWrap={true}
          width='100%'
          shimmerElements={[
            { type: ShimmerElementType.line, width: '100%', height: 14, verticalAlign: 'bottom' },
          ]}
        />
      </>
    );
  }
}
