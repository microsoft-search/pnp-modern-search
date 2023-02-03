/**
 * Defines the Adaptive Card action from an high level
 */
export interface IAdaptiveCardAction {

    /**
     * The Type of the Adaptive Card Action
     */
    type: string;

    /**
     * The Title of the Adaptive Card Action
     */
    title?: string;

    /**
     * The URL of the Adaptive Card Action, when it is an OpenUrlAction
     */
    url?: string;

    /**
     * The Data object of the Adaptive Card Action, when it is a SubmitAction or a VerbAction
     */
    data?: any;

    /**
     * The Verb of the Adaptive Card Action, when it is a VerbAction
     */
    verb?: string;
}