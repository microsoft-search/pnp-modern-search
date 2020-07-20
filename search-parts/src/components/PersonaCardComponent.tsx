import * as React from 'react';
import { IPersonaSharedProps, IPersonaProps, Persona, Link } from 'office-ui-fabric-react';
import { TemplateService } from "../services/TemplateService/TemplateService";
import { BaseWebComponent } from './BaseWebComponent';
import * as ReactDOM from 'react-dom';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { ITheme } from '@uifabric/styling';

export interface IPersonaCardComponentProps {

    // Item context
    item?: string;

    // Fields configuration object
    fieldsConfiguration?: string;

    // Individual content properties (i.e web component attributes)
    imageUrl?: string;
    text?: string;
    secondaryText?: string;
    tertiaryText?: string;
    optionalText?: string;

    /**
     * The persona image size
     */
    personaSize?: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;
}

export interface IPersonaCardComponentState {
}

export class PersonaCardComponent extends React.Component<IPersonaCardComponentProps, IPersonaCardComponentState> {

    constructor(props: IPersonaCardComponentProps) {
        super(props);
        this.renderProfileLink = this.renderProfileLink.bind(this);
    }

    public render() {

        let processedProps: IPersonaCardComponentProps = this.props;

        if (this.props.fieldsConfiguration && this.props.item) {
            processedProps = TemplateService.processFieldsConfiguration<IPersonaCardComponentProps>(this.props.fieldsConfiguration, this.props.item);
        }

        const persona: IPersonaSharedProps | IPersonaProps = {
            theme: this.props.themeVariant as ITheme,
            imageUrl: processedProps.imageUrl,
            text: processedProps.text,
            secondaryText: processedProps.secondaryText,
            tertiaryText: processedProps.tertiaryText,
            optionalText: processedProps.optionalText,
            onRenderPrimaryText: this.renderProfileLink
        };

        return <Persona {...persona} size={parseInt(this.props.personaSize)} />;
    }

    public renderProfileLink(props: IPersonaProps) {
        let item = JSON.parse(this.props.item);
        let palette = this.props.themeVariant.palette;
        return (
            <div className="ms-Persona-primaryText">
                <Link
                    theme={this.props.themeVariant as ITheme}
                    href={item.Path} target='_blank' data-interception="off" styles={{
                        root: {
                            color: palette.black,
                            selectors: {                                
                                ':hover': {
                                    textDecoration: 'underline',
                                    color: palette.black
                                }
                            }
                        }
                    }}>
                    {props.text}
                </Link>
            </div>

        );
    }
}

export class PersonaCardWebComponent extends BaseWebComponent {

    constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();
        const personaItem = <PersonaCardComponent {...props} />;
        ReactDOM.render(personaItem, this);
    }
}