import * as React from 'react';
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';
import { IRefinementValue, RefinementOperator } from "../../../../../models/ISearchResult";
import * as update from 'immutability-helper';
import { INavLink, Nav, Icon, ITheme } from 'office-ui-fabric-react';
import { cloneDeep } from "@microsoft/sp-lodash-subset";
import { UrlHelper } from '../../../../../helpers/UrlHelper';

//CSS
import styles from './ContainerTreeTemplate.module.scss';

export interface IFoldersTemplateProps extends IBaseRefinerTemplateProps {

    /**
     * Flag indicating if the associated refiner should be displayed as expanded
     */
    showExpanded: boolean;
}

export interface IFoldersTemplateState extends IBaseRefinerTemplateState {

    /**
     * The navigation links to display
     */
    navigationLinks: INavLink[];
}

export default class ContainerTreeTemplate extends React.Component<IFoldersTemplateProps, IFoldersTemplateState> {

    public constructor(props: IFoldersTemplateProps) {
        super(props);

        this.state = {
            refinerSelectedFilterValues: [],
            navigationLinks: []
        };
    }

    public render() {

        return  <div className={styles.pnpRefinersTemplateContainerTree}>
                {
                    this.props.showValueFilter ? 
                        <div className='pnp-font-s'>Value filters are not allowed for container trees. Clear 'show filter' to remove this message</div>
                        : null
                }
                <Nav
                    theme={this.props.themeVariant as ITheme}
                    onRenderLink={(props, defautRender) => {

                        const isSelected = props.refinementValue && this._isValueInFilterSelection(props.refinementValue);
                        return  <div style={{
                                        fontWeight: isSelected ? 'bold' : 'inherit'
                                    }}>
                                    {
                                        defautRender(cloneDeep(props))
                                    }
                                </div>;
                    }}
                    groups={[{
                        links: this.state.navigationLinks,
                    }]}
                />
            </div>;

    }

    private buildContainerStructureFromFilterValues(values: IRefinementValue[]) {

        const navLinks: INavLink[] = this.buildNavLinks(values);
        this.setState({
            navigationLinks: navLinks
        });
    }
      
    /**
     * Build a navigation tree structure correspondign to a set of URLs
     * @param refinementValues the current refinement values
     */
    private buildNavLinks(refinementValues: IRefinementValue[]) {

        let root = null;
        const base = { 
            links: []
        };

        const allUrls = refinementValues.map(value => {
            return this.cleanUrl(value.RefinementValue);
        });
        
        const commonPath = this.getLongestCommonPathForUrls(allUrls.filter(url => url));
        
        for (const value of refinementValues) {

            if (UrlHelper.isValidUrl(value.RefinementValue)) {

                let url = this.cleanUrl(value.RefinementValue);

                if (commonPath) {

                    url =  url.replace(commonPath.trim(), '');

                    if (!url) {
                        // Means 'root', so we get the last part of the URL to display the folder name
                        root = `/${this.cleanUrl(value.RefinementValue).substring(this.cleanUrl(value.RefinementValue).lastIndexOf('/') + 1)}`;
                    }
                }

                url = root ? `${root}${url ? `${url}` : ''}` : `${url}`;
            
                const path = url.match(/\/[^\/]+/g);
                let curr = base;
            
                path.forEach((e, i) => {

                    const currPath = path.slice(0, i + 1).join("");
                    const child = curr.links.find(link => link.path === currPath);
                    
                    if (child) {
                        curr = child;
                    } else {
                        curr.links.push({
                            name: `${currPath.substring(currPath.lastIndexOf('/') + 1)} (${value.RefinementCount})`,
                            url: '#',
                            path: currPath,
                            isExpanded: this.props.showExpanded,
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

                        curr = curr.links[curr.links.length - 1];
                    }
                });
            }
        }
        
        return base.links;
    }

    /**
     * Clean an URL by checking if last segment is a file. In this case parent folder an the file part will be removed.
     * @param urlString the URL to clean
     */
    private cleanUrl(urlString): string {

        const segments = urlString.split('/');

        if (/\.[\w]+/g.test(segments[segments.length -1])) {
            segments.splice(segments.length -2, 2);
            urlString = segments.join('/');
        }

        return urlString;
    }

    private getLongestCommonPathForUrls(urls: string[]) {

        const splitStrings = (a, sep = '/') => a.map(i => i.split(sep));
        const elAt = i => a => a[i];
        const rotate = a => a[0].map((e, i) => a.map(elAt(i)));
        const allElementsEqual = arr => arr.every(e => e === arr[0]);
        const commonPath = (input, sep = '/') => rotate(splitStrings(input, sep)).filter(allElementsEqual).map(elAt(0)).join(sep);
    
        return commonPath(urls);
    }

    public async componentDidMount() {

        this.setState({
            refinerSelectedFilterValues: this.props.selectedValues
        });

        this.buildContainerStructureFromFilterValues(this.props.refinementResult.Values);
    }

    public async UNSAFE_componentWillReceiveProps(nextProps: IBaseRefinerTemplateProps) {

        if (nextProps.shouldResetFilters) {
            this.setState({
                refinerSelectedFilterValues: []
            });
        }

        if (nextProps.removeFilterValue) {

            const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
                return elt.RefinementValue !== nextProps.removeFilterValue.RefinementValue;
            });

            this.setState({
                refinerSelectedFilterValues: newFilterValues
            });

            this._applyFilters(newFilterValues);
        }

        this.buildContainerStructureFromFilterValues(nextProps.refinementResult.Values);
    }

    /**
     * Checks if the current filter value is present in the list of the selected values for the current refiner
     * @param valueToCheck The filter value to check
     */
    private _isValueInFilterSelection(valueToCheck: IRefinementValue): boolean {

        let newFilters = this.state.refinerSelectedFilterValues.filter((filter) => {
            return filter.RefinementToken === valueToCheck.RefinementToken && filter.RefinementValue === valueToCheck.RefinementValue;
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
            return elt.RefinementValue !== removedValue.RefinementValue;
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