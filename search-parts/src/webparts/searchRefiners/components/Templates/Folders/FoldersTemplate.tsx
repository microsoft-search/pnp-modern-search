import * as React from 'react';
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';
import { IRefinementValue, RefinementOperator } from "../../../../../models/ISearchResult";
import * as update from 'immutability-helper';
import { INavLink, Nav, Link } from 'office-ui-fabric-react';
import { StringHelper } from '../../../../../helpers/StringHelper';
import { cloneDeep } from "@microsoft/sp-lodash-subset";

export interface IFoldersTemplateProps extends IBaseRefinerTemplateProps {
    /**
     * The current query modification
     */
    queryModification: string;
}

export interface IFoldersTemplateState extends IBaseRefinerTemplateState {
    navigationLinks: INavLink[];
}

export default class FoldersTemplate extends React.Component<IFoldersTemplateProps, IFoldersTemplateState> {

    public constructor(props: IFoldersTemplateProps) {
        super(props);

        this.state = {
            refinerSelectedFilterValues: [],
            navigationLinks: []
        };
    }

    public render() {

        return  <Nav
                    ariaLabel="Nav example with nested links"
                    styles={{
                        chevronIcon: {
                            display: 'none',
                        }
                    }}
                    onRenderLink={(props, defautRender) => {

                        const isSelected = props.refinementValue && this._isValueInFilterSelection(props.refinementValue);
                        
                        if (props.isExpanded) {
                            props.iconProps = {
                                iconName: 'FabricFolder'
                            };
                        } else {
                            props.iconProps = {
                                iconName: 'FabricOpenFolderHorizontal'
                            };
                        }

                        return  <div style={{
                                        fontWeight: isSelected ? 'bold' : 'inherit'
                                    }}>
                                    {defautRender(cloneDeep(props))}
                                </div>
                    }}
                    groups={[{
                        links: this.state.navigationLinks,
                    }]}
                />

    }

    private async buildFolderStructureFromFilterValues(values: IRefinementValue[]) {

        const navLinks: INavLink[] = this.buildNavLinks(values);
        this.setState({
            navigationLinks: navLinks
        });
    }

    private longest_common_starting_substring(arr1){

        // From https://www.w3resource.com/javascript-exercises/javascript-array-exercise-28.php
       /* const arr= arr1.concat().sort();
        const a1= arr[0];
        const a2= arr[arr.length-1];
        const L= a1.length;
        let i= 0;
        while(i< L && a1.charAt(i)=== a2.charAt(i)) {
            i++;
        }
        return a1.substring(0, i);*/

    const splitStrings = (a, sep = '/') => a.map(i => i.split(sep));
 
    /**
     * Given an index number, return a function that takes an array and returns the
     * element at the given index
     * @param {number} i
     * @return {function(!Array<*>): *}
     */
    const elAt = i => a => a[i];
    
    /**
     * Transpose an array of arrays:
     * Example:
     * [['a', 'b', 'c'], ['A', 'B', 'C'], [1, 2, 3]] ->
     * [['a', 'A', 1], ['b', 'B', 2], ['c', 'C', 3]]
     * @param {!Array<!Array<*>>} a
     * @return {!Array<!Array<*>>}
     */
    const rotate = a => a[0].map((e, i) => a.map(elAt(i)));
    
    /**
     * Checks of all the elements in the array are the same.
     * @param {!Array<*>} arr
     * @return {boolean}
     */
    const allElementsEqual = arr => arr.every(e => e === arr[0]);
    
    
    const commonPath = (input, sep = '/') => rotate(splitStrings(input, sep))
        .filter(allElementsEqual).map(elAt(0)).join(sep);
    
        return commonPath(arr1);
    }
      

    private buildNavLinks(refinementValues: IRefinementValue[]) {

        const base = { 
            links: []
        };

        const allUrls = refinementValues.map(value => { return value.RefinementValue; })
        
        const commonString = this.longest_common_starting_substring(allUrls);

        let root = null
        
        for (const value of refinementValues) {

            let url = value.RefinementValue;

            if (commonString) {
                url =  url.replace(commonString.trim(), '');
                if (url === '') {
                    // Means 'root'
                    root = `/${value.RefinementValue.substring(value.RefinementValue.lastIndexOf('/') + 1)}`;
                }
            }

            url = root ? `${root}${url ? `/${url}` : ''}` : `/${url}`;

          const path = url.match(/\/[^\/]+/g);
          let curr = base;
          
          path.forEach((e, i) => {

            const currPath = path.slice(0, i + 1).join("");
            const child = curr.links.find(e => e.path === currPath);
            
            if (child) {
              curr = child;
            } else {
                curr.links.push({
                    name: `${currPath.substring(currPath.lastIndexOf('/') + 1)} (${value.RefinementCount})`,
                    url: '#',
                    path: currPath,
                    isExpanded: true,
                    iconProps: {
                        iconName: 'FabricOpenFolderHorizontal'
                    },
                    refinementValue: url === currPath ? value : null,
                    onClick: (ev, item: INavLink) => {
    
                        ev.preventDefault();
    
                        if (this._isValueInFilterSelection(value)) {
                            this._onFilterRemoved(value);
                        } else {
                            this._onFilterAdded(value);
                        }
                    },
                    links: []
                } as INavLink);

                curr = curr.links[curr.links.length-1];
            }
          });
        }
        
        return base.links;
    };

    private cleanUrl(urlString): string {
        let url = decodeURIComponent(new URL(urlString).pathname);
        // Match file name
        if (/Forms\/\.aspx/g.test(url)) {
            url = url.substring(0, url.lastIndexOf("/"));
        }

        return decodeURIComponent(url);
    }

    public async componentDidMount() {

        // This scenario happens due to the behavior of the Office UI Fabric GroupedList component who recreates child components when a greoup is collapsed/expanded, causing a state reset for sub components
        // In this case we use the refiners global state to recreate the 'local' state for this component
        this.setState({
            refinerSelectedFilterValues: this.props.selectedValues
        });

        await this.buildFolderStructureFromFilterValues(this.props.refinementResult.Values);
    }

    public async UNSAFE_componentWillReceiveProps(nextProps: IBaseRefinerTemplateProps) {

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

        await this.buildFolderStructureFromFilterValues(nextProps.refinementResult.Values);
    }

    /**
     * Checks if the current filter value is present in the list of the selected values for the current refiner
     * @param valueToCheck The filter value to check
     */
    private _isValueInFilterSelection(valueToCheck: IRefinementValue): boolean {

        let newFilters = this.state.refinerSelectedFilterValues.filter((filter) => {
            return filter.RefinementToken === valueToCheck.RefinementToken && filter.RefinementName === valueToCheck.RefinementName;
        });

        return newFilters.length === 0 ? false : true;
    }

    /**
     * Handler when a new filter value is selected
     * @param addedValue the filter value added
     */
    private _onFilterAdded(addedValue: IRefinementValue) {

        let newFilterValues = update(this.state.refinerSelectedFilterValues, { $push: [addedValue] });

        this.setState({
            refinerSelectedFilterValues: newFilterValues
        });

        this._applyFilters(newFilterValues);
    }

    /**
     * Handler when a filter value is unselected
     * @param removedValue the filter value removed
     */
    private _onFilterRemoved(removedValue: IRefinementValue) {

        const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
            return elt.RefinementName !== removedValue.RefinementName;
        });

        this.setState({
            refinerSelectedFilterValues: newFilterValues
        });

        this._applyFilters(newFilterValues);
    }

    /**
     * Applies all selected filters for the current refiner 
     */
    private _applyFilters(updatedValues: IRefinementValue[]) {
        this.props.onFilterValuesUpdated(this.props.refinementResult.FilterName, updatedValues, RefinementOperator.AND);
    }
}