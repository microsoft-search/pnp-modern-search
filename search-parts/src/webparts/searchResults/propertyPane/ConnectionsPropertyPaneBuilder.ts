import { IPropertyPaneGroup } from "@microsoft/sp-property-pane";
import { IQueryModifier } from '@pnp/modern-search-extensibility';

export class ConnectionsPropertyPaneBuilder {
    
    constructor(
        private getPropertyPaneConnectionsGroup: () => IPropertyPaneGroup[],
        private selectedCustomQueryModifier: IQueryModifier[]
    ) {}

    public buildConnectionsPage(): IPropertyPaneGroup[] {
        const queryTransformationGroups: IPropertyPaneGroup[] = [];
        
        if (this.selectedCustomQueryModifier.length > 0) {
            this.selectedCustomQueryModifier.forEach(modifier => {
                queryTransformationGroups.push(...modifier.getPropertyPaneGroupsConfiguration());
            });
        }

        return [
            ...this.getPropertyPaneConnectionsGroup(),
            ...queryTransformationGroups
        ];
    }
}
