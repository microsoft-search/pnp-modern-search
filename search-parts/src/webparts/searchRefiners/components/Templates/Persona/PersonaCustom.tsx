// React
import * as React from 'react';

// UI Fabric
import { Shimmer, ShimmerElementsGroup, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import { Persona, PersonaSize, IPersonaSharedProps } from 'office-ui-fabric-react/lib/components/Persona';

// Interface
import IUserService from '../../../../../services/UserService/IUserService';
import { IUser } from '../../../../../models/IUser';
export interface IPersonaCustomProps extends IPersonaSharedProps {
  accountName: string;
  resultCount: number;
  userService: IUserService;
}

export interface IPersonaCustomState {
  displayName: string;
  pictureUrl: string;
  jobTitle: string;
  isLoading: boolean;
}

// Component
export class PersonaCustom extends React.Component<IPersonaCustomProps, IPersonaCustomState> {

  private _userProperties: IUser;

  constructor(props: IPersonaCustomProps) {
    super(props);

    this.state = {
      displayName: '',
      pictureUrl: '',
      jobTitle: '',
      isLoading: false
    };
  }

  /**
   * get user properties
   */
  private async _getUserProperties() {
    this.setState({ isLoading: true });
    let response = await this.props.userService.getUserProperties(this.props.accountName);
    if (!!response) {
      this._userProperties = response;
      this.setState({
        displayName: this._userProperties.DisplayName,
        pictureUrl: this._userProperties.PictureUrl,
        jobTitle: !!this._userProperties.userProperties ? this._userProperties.userProperties['SPS-JobTitle'] : ''
      }, () => this.setState({ isLoading: false }));
    }
  }

  /**
   * Init
   */
  public componentDidMount(): void {
    this._getUserProperties();
  }

  /**
   * Update
   */
  public componentDidUpdate(prevProps: IPersonaCustomProps, prevState: IPersonaCustomState): void {
    if (this.props.accountName !== prevProps.accountName) {
      this._getUserProperties();
    }
  }

  /**
   * Render
   */
  public render(): React.ReactElement<IPersonaCustomProps> {
    const { displayName, pictureUrl, jobTitle, isLoading } = this.state;
    return (
      <>
        {!!displayName &&
          <Shimmer
            className='pnp-shimmer'
            customElementsGroup={this._getPersonaShimmer()}
            isDataLoaded={!isLoading}
          >
            <Persona
              {...this.props}
              className='pnp-persona'
              imageUrl={pictureUrl}
              size={PersonaSize.size40}
              primaryText={`${displayName} (${this.props.resultCount})`}
              secondaryText={jobTitle}
            />
          </Shimmer>
        }
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
          shimmerElements={[
            { type: ShimmerElementType.circle, height: 40 },
            { type: ShimmerElementType.gap, width: 16, height: 40 }
          ]}
        />
        <ShimmerElementsGroup
          flexWrap={true}
          width='100%'
          shimmerElements={[
            { type: ShimmerElementType.line, width: '100%', height: 14, verticalAlign: 'bottom' },
            { type: ShimmerElementType.line, width: '90%', height: 10 },
            { type: ShimmerElementType.gap, width: '10%', height: 20 }
          ]}
        />
      </>
    );
  }
}
