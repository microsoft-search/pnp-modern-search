import * as React from 'react';
import { Suspense } from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
const AceEditor = React.lazy(() => import('react-ace'));

export interface IDebugViewProps {

    /**
     * The debug content to display
     */
    content?: {};
}

export interface IDebugViewState {
}

export class DebugView extends React.Component<IDebugViewProps, IDebugViewState> {
    
    public render() {
        return <Suspense fallback={""}>
                    <AceEditor
                        width={ '100%' }
                        mode={ 'json' }
                        theme="textmate"
                        enableLiveAutocompletion={ false }
                        showPrintMargin={ false }
                        showGutter= { true }            
                        value={ JSON.stringify(this.props.content, null, 2) }
                        highlightActiveLine={ true }
                        readOnly={ true }
                        editorProps={
                            {
                                $blockScrolling: Infinity,
                            }
                        }					
                        name="CodeView"
                    />
                </Suspense>;
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
          '@pnp/spfx-property-controls/lib/propertyFields/codeEditor'
       );
 
       let props = this.resolveAttributes();
       const debugView = <DebugView {...props}/>;
       ReactDOM.render(debugView, this);
    }    
}