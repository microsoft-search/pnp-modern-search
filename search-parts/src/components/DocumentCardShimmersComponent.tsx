import * as React from "react";
import { Shimmer, ShimmerElementType as ElemType, ShimmerElementsGroup, ITheme } from 'office-ui-fabric-react';
import * as ReactDOM from 'react-dom';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import { IReadonlyTheme } from "@microsoft/sp-component-base";

export interface DocumentCardShimmersComponentProps {

    /**
     * If the document card should be compact
     */
    isCompact?: boolean;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;
}

export class DocumentCardShimmersComponent extends React.Component<DocumentCardShimmersComponentProps, {}> {
    
    public render() {

        if (this.props.isCompact) {
            return this.getDocumentCardCompactShimmers();
        } else {
            return this.getDocumentCardShimmers();
        }
    }

    private getDocumentCardShimmers(): JSX.Element {
        
        const shimmerContent: JSX.Element = <div style={{ 
                                                    display: 'block',
                                                    borderWidth: 1,
                                                    borderStyle: 'solid',
                                                    borderColor: 'rgb(222, 222, 222)',
                                                    marginBottom: 15,
                                                    maxWidth: 318,
                                                    minWidth: 150                                              
                                                }}>
                                                <Shimmer
                                                    theme={this.props.themeVariant as ITheme}
                                                    customElementsGroup={
                                                        <ShimmerElementsGroup
                                                            shimmerElements={[
                                                                { type: ElemType.line, width: '100%', height: 196 },
                                                            ]}
                                                            backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                                                            theme={this.props.themeVariant as ITheme}
                                                        />
                                                    } 
                                                    isDataLoaded={false}                  
                                                />                                                                                                   
                                                <div style={{
                                                    paddingTop: 8,
                                                    paddingRight: 16,
                                                    paddingBottom: 8,
                                                    paddingLeft: 16,
                                                }}>
                                                    <Shimmer 
                                                        theme={this.props.themeVariant as ITheme}
                                                        customElementsGroup={
                                                            <div style={{ display: 'flex' }}>
                                                                <ShimmerElementsGroup
                                                                    theme={this.props.themeVariant as ITheme}
                                                                    flexWrap={true}
                                                                    width="100%"       
                                                                    backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}                                                             
                                                                    shimmerElements={[
                                                                        { type: ElemType.line, width: '30%', height: 11 },
                                                                        { type: ElemType.gap, width: '70%', height: 11 },
                                                                        { type: ElemType.line, width: '100%', height: 13 },
                                                                        { type: ElemType.line, width: '60%', height: 13 },
                                                                        { type: ElemType.gap, width: '40%', height: 20 }
                                                                    ]}
                                                                />
                                                            </div>
                                                        } 
                                                        width="100%"
                                                        isDataLoaded={false}                                                                           
                                                    />                                                      
                                                </div>
                                                <div style={{
                                                    paddingTop: 8,
                                                    paddingRight: 16,
                                                    paddingBottom: 8,
                                                    paddingLeft: 16
                                                }}>
                                                <Shimmer
                                                    theme={this.props.themeVariant as ITheme} 
                                                    customElementsGroup={
                                                        <div style={{ display: 'flex' }}>
                                                            <ShimmerElementsGroup
                                                                theme={this.props.themeVariant as ITheme}
                                                                shimmerElements={[{ type: ElemType.circle, height: 32 }, { type: ElemType.gap, width: 10, height: 40 }]}
                                                                backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                                                            />
                                                            <ShimmerElementsGroup
                                                            theme={this.props.themeVariant as ITheme}
                                                            flexWrap={true}
                                                            backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                                                            width="100%"
                                                            shimmerElements={[
                                                                { type: ElemType.line, width: '100%', height: 10 },
                                                                { type: ElemType.line, width: '75%', height: 10 },
                                                                { type: ElemType.gap, width: '25%', height: 20 }
                                                            ]}
                                                            />
                                                        </div>
                                                    } 
                                                    width="100%"
                                                    isDataLoaded={false}                                                                        
                                                />                                                
                                                </div>
                                            </div>;
        
        return shimmerContent;
    }

    private getDocumentCardCompactShimmers(): JSX.Element {

        const shimmerContent = <div
                                    style={{ 
                                        display: 'flex' ,
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: 'rgb(222, 222, 222)',
                                        marginBottom: 15  
                                    }}
                                >
                                    <Shimmer 
                                        theme={this.props.themeVariant as ITheme}
                                        customElementsGroup={
                                            <ShimmerElementsGroup
                                            backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                                            shimmerElements={[
                                                { type: ElemType.line, height: 106, width: 144 },
                                                { type: ElemType.gap, width: 16, height: 80 }
                                            ]}
                                        />}
                                    />
                                    <div style={{
                                        paddingTop: 8,
                                        paddingRight: 16,
                                        paddingBottom: 8,
                                        width: '100%'
                                    }}>   
                                        <Shimmer 
                                            theme={this.props.themeVariant as ITheme}
                                            customElementsGroup={
                                                <div>
                                                <div style={{ display: 'flex' }}>
                                                            <ShimmerElementsGroup
                                                            theme={this.props.themeVariant as ITheme}
                                                            flexWrap={true}
                                                            backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                                                            width="100%"
                                                            shimmerElements={[
                                                                { type: ElemType.line, width: '100%', height: 10 },
                                                                { type: ElemType.line, width: '75%', height: 10 },
                                                                { type: ElemType.gap, width: '25%', height: 20 }
                                                            ]}
                                                            />
                                                        </div>
                                                </div>
                                            }
                                        />
                                        <Shimmer
                                            theme={this.props.themeVariant as ITheme}
                                            customElementsGroup={
                                            <div style={{ display: 'flex', marginTop: 10 }}>
                                                <ShimmerElementsGroup
                                                    backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                                                    theme={this.props.themeVariant as ITheme}
                                                    shimmerElements={[{ type: ElemType.circle, height: 32}, { type: ElemType.gap, width: 10, height: 40 }]}
                                                />
                                                <ShimmerElementsGroup
                                                backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                                                theme={this.props.themeVariant as ITheme}
                                                flexWrap={true}
                                                width="100%"
                                                shimmerElements={[
                                                    { type: ElemType.line, width: '60%', height: 10 },
                                                    { type: ElemType.gap, width: '40%', height: 20 },
                                                    { type: ElemType.line, width: '30%', height: 10 },
                                                    { type: ElemType.gap, width: '70%', height: 20 }
                                                ]}
                                                />
                                            </div>
                                        }/>
                                    </div>
                                </div>;

        return shimmerContent;
    }
}

export class DocumentCardShimmersWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public connectedCallback() {
 
       let props = this.resolveAttributes();
       const documentCarditem = <DocumentCardShimmersComponent {...props}/>;
       ReactDOM.render(documentCarditem, this);
    }    
}