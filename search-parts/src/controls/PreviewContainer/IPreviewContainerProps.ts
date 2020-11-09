export interface IPreviewContainerProps {

   /**
    * The element URL to display (can be the iframe source URL)
    */
   elementUrl: string;

   /**
    * The thumbnail image URL
    */
   previewImageUrl: string;

   /**
    * The HTML element to use as target for the callout
    */
   targetElement: HTMLElement;

   /**
    * Indicates if we need to show the preview
    */
   showPreview: boolean;

   /**
    * The preview type
    */
   previewType: PreviewType;

}

export enum PreviewType {
   Document
}
