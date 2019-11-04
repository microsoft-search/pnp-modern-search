import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Suspense } from 'react';
import { BaseWebComponent } from './BaseWebComponent';
const AceEditor = React.lazy(() => import('react-ace'));

export interface IDebugViewProps {

    /**
     * The debug content to display
     */
    content?: string;
}

export interface IDebugViewState {
}

export default class DebugView extends React.Component<IDebugViewProps, IDebugViewState> {
    
    public render() {
        return <Suspense fallback={""}><AceEditor
            width={ '100%' }
            mode={ 'json' }
            theme="textmate"
            enableLiveAutocompletion={ true }
            showPrintMargin={ false }
            showGutter= { true }            
            value={ this.props.content }
            highlightActiveLine={ true }
            readOnly={ true }
            editorProps={
                {
                    $blockScrolling: Infinity,
                }
            }					
            name="CodeView"
        /></Suspense> ;
    }
}

export class DebugViewWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
 
       // Reuse the 'brace' imports from the PnP control instead of reference them explicitly in the debug view
       await import(
          /* webpackChunkName: 'debug-view' */
          '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor'
       );
 
       let props = this.resolveAttributes();
       const debugView = <DebugView {...props}/>;
       ReactDOM.render(debugView, this);
    }    
}