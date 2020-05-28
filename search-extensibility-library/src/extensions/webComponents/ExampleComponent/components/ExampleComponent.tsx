import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as styles from './ExampleComponent.module.scss';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IExampleComponentProps } from './IExampleComponentProps';
import { IExampleComponentState } from './IExampleComponentState';

export class ExampleComponent extends React.Component<IExampleComponentProps, IExampleComponentState> {
    
    constructor(props: IExampleComponentProps) {
        super(props);
    }
    
    protected async onInit(): Promise<void> {
        // initialize component
    }
        
    public render() {

        let contents:JSX.Element = this.props.innerHtml 
                ? <span dangerouslySetInnerHTML={this.createChildren()}></span>
                : <span>{this.props.text}</span>;
        
        return <div className={styles.default.exampleComponent}>
            <Link title={this.props.text} href={this.props.hyperlink} className={styles.default.link}>{contents}</Link>
        </div>;

    }
    
    private createChildren() {
        return {__html: this.props.innerHtml };
    }

}