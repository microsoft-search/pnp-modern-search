import { IReadonlyTheme } from "@microsoft/sp-component-base";

export type PageUpdateCallback = (pageNumber: number) => void;

interface IPagingProps {
    totalItems: number;
    itemsCountPerPage: number;
    onPageUpdate: PageUpdateCallback;
    currentPage: number;

    /**
     * The current theme variant
     */
    themeVariant: IReadonlyTheme | undefined;
}

export default IPagingProps;