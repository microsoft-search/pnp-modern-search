export interface IComponentDefinition<T> {

    /**
     * The component custom element name (ex: <my-component>))
     */
    componentName: string;

    /**
     * The class implementing the logic of the component
     */
    componentClass: T;
}