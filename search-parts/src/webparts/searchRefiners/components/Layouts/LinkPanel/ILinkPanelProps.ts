import IFilterLayoutProps from "../IFilterLayoutProps";
import { IRefinementValue } from "search-extensibility";

interface ILinkPanelProps extends IFilterLayoutProps {
  selectedFilterValues: IRefinementValue[];
}

export default ILinkPanelProps;
