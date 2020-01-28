// React
import * as React from "react";

// CSS
import styles from './PersonaTemplate.module.scss';

import { ITheme } from '@uifabric/styling';

// Thirs party Lib
import * as update from 'immutability-helper';

// Interface
import { IRefinementValue, RefinementOperator } from "../../../../../models/ISearchResult";
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';
import { PersonaSize, Persona, Spinner, SpinnerSize, IExtendedPersonaProps, IPersonaProps } from "office-ui-fabric-react";
import { IUserInfo } from "../../../../../models/IUser";

export interface IPersonaTemplateProps extends IBaseRefinerTemplateProps {
}

export interface IPersonaTemplateState extends IBaseRefinerTemplateState {
  isLoading: boolean;
  userInfos: IUserInfo[];
}

// Class
export default class PersonaTemplate extends React.Component<IPersonaTemplateProps, IPersonaTemplateState> {

  private _operator: RefinementOperator;

  public constructor(props: IPersonaTemplateProps) {
    super(props);

    this.state = {
      refinerSelectedFilterValues: [],
      isLoading: false,
      userInfos: []
    };
  }

  public render() {
    
    let renderTemplate: JSX.Element = null;

    if (this.state.isLoading) {
      renderTemplate = <Spinner size={SpinnerSize.small}/>;
    } else {
      renderTemplate =  <div>
                          {
                            this.props.refinementResult.Values.map((refinementValue: IRefinementValue, j) => {

                              let imageProps: IPersonaProps = null;

                              // Try to see if the value looks like a login mail                              
                              let displayName = refinementValue.RefinementValue.split('|').length > 1 ? refinementValue.RefinementValue.split('|')[1].trim() : refinementValue.RefinementValue;
                              let accountName = refinementValue.RefinementValue.match(/([\w\.\-]+)@([\w\-]+)((\.(\w){2,63}){1,3})/);

                              if (accountName) {
                                
                                // Get the user info from the already fetched list
                                const userInfos = this.state.userInfos.filter(user => {
                                    return user.AccountName.toLowerCase() === `i:0#.f|membership|${accountName[0]}`.toLowerCase();
                                });
                                
                                if (userInfos.length > 0) {
                                  displayName = userInfos[0].Properties.DisplayName;
                                  imageProps = {
                                    imageUrl: accountName ? `/_layouts/15/userphoto.aspx?size=L&username=${accountName[0].toLowerCase()}`: null
                                  };
                                }                                
                              }

                              if (refinementValue.RefinementCount === 0) {
                                return null;
                              }
                              return (
                                <Persona
                                  {...imageProps}
                                  key={j}           
                                  className='pnp-persona'
                                  styles={{
                                    root: {
                                      marginBottom: 10
                                    },
                                    primaryText: {
                                      fontWeight: this._isValueInFilterSelection(refinementValue) ? 'bold' : 'normal'
                                    }
                                  }}
                                  size={PersonaSize.size40}                                  
                                  primaryText={`${displayName} (${refinementValue.RefinementCount})`}
                                  theme={this.props.themeVariant as ITheme}
                                  onClick={() => {
                                    if (!this._isValueInFilterSelection(refinementValue)) { 
                                      refinementValue.RefinementName = displayName;
                                      this._onFilterAdded(refinementValue);
                                    } else {
                                      this._onFilterRemoved(refinementValue);
                                    }
                                  }}
                                />
                              );
                            })
                          }
                        </div>;
    }

    return (
      <div className={styles.pnpRefinersTemplatePersona}>
        {renderTemplate}
      </div>
    );
  }

  public async componentDidMount() {

    // Determine the operator according to multi value setting
    this._operator = this.props.isMultiValue ? RefinementOperator.OR : RefinementOperator.AND;

    // This scenario happens due to the behavior of the Office UI Fabric GroupedList component who recreates child components when a greoup is collapsed/expanded, causing a state reset for sub components
    // In this case we use the refiners global state to recreate the 'local' state for this component
    this.setState({
      refinerSelectedFilterValues: this.props.selectedValues
    });

    await this.getUserInfos(this.props);
  }

  private async getUserInfos(props: IPersonaTemplateProps) {

    const accountNames = [];
      
    props.refinementResult.Values.map((refinementValue: IRefinementValue) => {

      // Identify the login adress using Regex
      let accountName = refinementValue.RefinementValue.match(/([\w\.\-]+)@([\w\-]+)((\.(\w){2,63}){1,3})/);
      if (accountName) {
        accountNames.push(accountName[0]);
      }
    });

    this.setState({
      isLoading: true
    });

    const userInfos = await this.props.userService.getUserInfos(accountNames);

    this.setState({
      userInfos: userInfos,
      isLoading: false
    });
  }

  public UNSAFE_componentWillReceiveProps(nextProps: IPersonaTemplateProps) {

    if (nextProps.shouldResetFilters) {
      this.setState({
        refinerSelectedFilterValues: []
      });
    }

    // Remove an arbitrary value from the inner state
    // Useful when the remove filter action is also present in the parent layout component
    if (nextProps.removeFilterValue) {

      const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
        return elt.RefinementName !== nextProps.removeFilterValue.RefinementName;
      });

      this.setState({
        refinerSelectedFilterValues: newFilterValues
      });

      this._applyFilters(newFilterValues);
    }
  }

  /**
   * Handler when a new filter value is selected
   * @param addedValue the filter value added
   */
  private _onFilterAdded = (addedValue: IRefinementValue) => {

    let newFilterValues = update(this.state.refinerSelectedFilterValues, { $push: [addedValue] });

    this.setState({
      refinerSelectedFilterValues: newFilterValues
    });

    if (!this.props.isMultiValue) {
      this._applyFilters(newFilterValues);
    }
  }

  /**
   * Handler when a filter value is unselected
   * @param removedValue the filter value removed
   */
  private _onFilterRemoved(removedValue: IRefinementValue) {

    const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
        return elt.RefinementValue !== removedValue.RefinementValue;
    });

    this.setState({
        refinerSelectedFilterValues: newFilterValues
    });

    if (!this.props.isMultiValue) {
        this._applyFilters(newFilterValues);
    }
  }
  
  /**
   * Applies all selected filters for the current refiner
   */
  private _applyFilters = (updatedValues: IRefinementValue[]) => {
    this.props.onFilterValuesUpdated(this.props.refinementResult.FilterName, updatedValues, this._operator);
  }

  /**
   * Checks if the current filter value is present in the list of the selected values for the current refiner
   * @param valueToCheck The filter value to check
   */
  private _isValueInFilterSelection(valueToCheck: IRefinementValue): boolean {

      let displayName: string = valueToCheck.RefinementValue.split('|').length > 1 ? valueToCheck.RefinementValue.split('|')[1].trim() : null;

      let newFilters = this.state.refinerSelectedFilterValues.filter((filter) => {
          return filter.RefinementToken === valueToCheck.RefinementToken && (filter.RefinementValue === valueToCheck.RefinementValue || filter.RefinementName === displayName);
      });

      return newFilters.length === 0 ? false : true;
  }
}
