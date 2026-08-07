import * as React from "react";
import * as ReactDOM from "react-dom";
import { BaseWebComponent, BuiltinTemplateSlots } from "@pnp/modern-search-extensibility";
import { ActionButton, Checkbox, DatePicker, Dropdown, IIconProps, IDropdownOption, ITag, ITheme, getTheme, Panel, PanelType, IconButton, MessageBar, MessageBarType, PrimaryButton, Spinner, SpinnerSize, TagPicker, TextField } from "@fluentui/react";
import type { IPickerTerms } from "@pnp/spfx-controls-react/lib/TaxonomyPicker";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { PageContext } from "@microsoft/sp-page-context";
import { SPHttpClient } from "@microsoft/sp-http";
import { Text } from "@microsoft/sp-core-library";
import { ISearchResultsTemplateContext } from "../models/common/ITemplateContext";
import { ObjectHelper } from "../helpers/ObjectHelper";
import { TaxonomyHelper } from "../helpers/TaxonomyHelper";
import * as strings from "CommonStrings";
import { ISelectedItemsEditService, ISelectedItemsEditPreparationResult, IEditableFieldDescriptor } from "../services/selectedItemsEditService/ISelectedItemsEditService";
import { SelectedItemsEditService } from "../services/selectedItemsEditService/SelectedItemsEditService";
import { ITerm } from "../services/taxonomyService/ITaxonomyItems";
import { ITaxonomyService } from "../services/taxonomyService/ITaxonomyService";
import { TaxonomyService } from "../services/taxonomyService/TaxonomyService";

const MIN_DETAILS_PANEL_HEIGHT = 520;
const DETAILS_PANEL_RIGHT_OFFSET = 32;
const HEX_COLOR_REGEXP = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_COLOR_REGEXP = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i;
const RESET_RESULTS_SELECTION_EVENT = "resetResultsSelection";
const SELECTED_EDIT_TAXONOMY_PICKER_CLASS = "pnp-modern-search-selected-edit-taxonomy-picker";
const LazyTaxonomyPicker = React.lazy(() =>
  import(
    /* webpackChunkName: "pnp-modern-search-taxonomy-picker" */ "@pnp/spfx-controls-react/lib/TaxonomyPicker"
  ).then((module) => ({
    default: module.TaxonomyPicker,
  }))
);

interface IDetailsSelectedItemButtonProps {
  context?: ISearchResultsTemplateContext;
  items?: { [key: string]: any }[];
  themeVariant?: IReadonlyTheme;
  fileExtensionField?: string;
  isContainerField?: string;
  allowMulti?: boolean;
  hostElement?: HTMLElement;
  selectedItemsEditService?: ISelectedItemsEditService;
  taxonomyService?: ITaxonomyService;
  webPartContext?: {
    pageContext?: PageContext;
    spHttpClient?: SPHttpClient;
  };
  webAbsoluteUrl?: string;
  siteAbsoluteUrl?: string;
}

interface ISelectedEditTag extends ITag {
  secondaryText?: string;
}

interface IPeoplePickerPrincipalEntity {
  Key?: string;
  DisplayText?: string;
  EntityData?: {
    Email?: string;
    AccountName?: string;
  };
}

interface IDetailsSelectedItemButtonState {
  activePanelMode?: "details" | "editSelectedItems";
  activeDetailsFormUrl?: string;
  activeDetailsItemTitle?: string;
  isDetailsFrameReady?: boolean;
  selectedItemsEditPreparationResult?: ISelectedItemsEditPreparationResult;
  isSelectedItemsEditLoading?: boolean;
  isSelectedItemsEditApplying?: boolean;
  selectedItemsEditErrorMessage?: string;
  selectedEditFieldValues?: Record<string, unknown>;
  dirtySelectedEditFieldNames?: string[];
  selectedEditFieldInternalName?: string;
  selectedEditFieldValue?: unknown;
  canApplySelectedEditValue?: boolean;
}

interface IDetailsPanelSessionState {
  isOpen: boolean;
  activeDetailsFormUrl?: string;
  activeDetailsItemTitle?: string;
}

const detailsPanelSessionStates = new Map<string, IDetailsPanelSessionState>();

export class DetailsSelectedItemButtonComponent extends React.Component<IDetailsSelectedItemButtonProps, IDetailsSelectedItemButtonState> {
  private _selectedItems: any[] = [];
  private _detailsLayoutAnimationFrame: number | null = null;
  private _requestDigestToken: string | null = null;
  private _requestDigestExpiration = 0;
  private readonly _taxonomyTagsCache = new Map<string, Promise<ISelectedEditTag[]>>();

  constructor(props: IDetailsSelectedItemButtonProps) {
    super(props);

    this.state = {
      activePanelMode: null,
      activeDetailsFormUrl: null,
      activeDetailsItemTitle: null,
      isDetailsFrameReady: false,
      selectedItemsEditPreparationResult: null,
      isSelectedItemsEditLoading: false,
      isSelectedItemsEditApplying: false,
      selectedItemsEditErrorMessage: null,
      selectedEditFieldValues: {},
      dirtySelectedEditFieldNames: [],
      selectedEditFieldInternalName: null,
      selectedEditFieldValue: undefined,
      canApplySelectedEditValue: false,
    };
  }

  public componentDidMount(): void {
    window.addEventListener("resize", this._refreshDetailsPanelLayout);
    window.addEventListener("scroll", this._refreshDetailsPanelLayout, { capture: true, passive: true });
    this._updateSelectedItems();
    this._restoreDetailsPanelIfNeeded();
  }

  public componentDidUpdate(prevProps: IDetailsSelectedItemButtonProps): void {
    if (this._didSelectionInputsChange(prevProps)) {
      this._updateSelectedItems();
      this._syncOpenPanelWithSelection();
      this._restoreDetailsPanelIfNeeded();
    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this._refreshDetailsPanelLayout);
    window.removeEventListener("scroll", this._refreshDetailsPanelLayout, true);

    if (this._detailsLayoutAnimationFrame !== null) {
      window.cancelAnimationFrame(this._detailsLayoutAnimationFrame);
      this._detailsLayoutAnimationFrame = null;
    }
  }

  public render(): JSX.Element {
    const detailsIcon: IIconProps = { iconName: "OpenPane" };
    const isMultiSelectEnabled = this.props.allowMulti === true;
    const selectedItem = this._selectedItems.length === 1 ? this._selectedItems[0] : null;
    const hasMultipleSelectedItems = isMultiSelectEnabled && this._selectedItems.length > 1;
    const detailsFormUrl = selectedItem ? this._buildDetailsFormUrl(selectedItem) : null;
    const shouldRenderButton = hasMultipleSelectedItems || !!detailsFormUrl;
    const isButtonDisabled = !hasMultipleSelectedItems && (!selectedItem || !detailsFormUrl);

    return (
      <>
        {shouldRenderButton && (
          <ActionButton
            text={strings.Layouts.DetailsList.DetailsButtonLabel}
            iconProps={detailsIcon}
            disabled={isButtonDisabled}
            onClick={(event) => this._openPanel(event, selectedItem)}
            theme={(this.props.themeVariant as ITheme) || getTheme()}
          />
        )}
        {this._renderDetailsPanel()}
      </>
    );
  }

  private _updateSelectedItems(): void {
    if (this.props.context?.selectedKeys?.length > 0 && this.props.items?.length > 0) {
      const currentPageNumber = this.props.context.paging.currentPageNumber;
      const selectedKeys = new Set(this.props.context.selectedKeys);

      this._selectedItems = this.props.items.filter((item, index) => {
        return selectedKeys.has(`${currentPageNumber}${index}`);
      });
    } else {
      this._selectedItems = [];
    }

    this.forceUpdate();
  }

  private _didSelectionInputsChange(prevProps: IDetailsSelectedItemButtonProps): boolean {
    return this._getSelectionSignature(prevProps) !== this._getSelectionSignature(this.props)
      || prevProps.items !== this.props.items;
  }

  private _getSelectionSignature(props: IDetailsSelectedItemButtonProps): string {
    const currentPageNumber = props.context?.paging?.currentPageNumber ?? 0;
    const selectedKeys = (props.context?.selectedKeys ?? []).map((key) => `${key}`);
    return `${currentPageNumber}::${selectedKeys.join("|")}`;
  }

  private _syncOpenPanelWithSelection(): void {
    if (this.state.activePanelMode === "editSelectedItems") {
      if (this._selectedItems.length > 1) {
        void this._prepareSelectedItemsEditPanel();
      } else {
        this._closeDetailsPanel();
      }

      return;
    }

    if (this.props.allowMulti === true && this._selectedItems.length > 1) {
      void this._prepareSelectedItemsEditPanel(true);
      return;
    }

    const detailsPanelSessionState = this._getDetailsPanelSessionState();

    if (!this._getResolvedDetailsFormUrl()) {
      return;
    }

    const selectedItem = this._selectedItems.length === 1 ? this._selectedItems[0] : null;
    const detailsFormUrl = selectedItem ? this._buildDetailsFormUrl(selectedItem) : null;

    if (!selectedItem || !detailsFormUrl) {
      return;
    }

    if (detailsFormUrl !== this.state.activeDetailsFormUrl) {
      detailsPanelSessionState.activeDetailsFormUrl = detailsFormUrl;
      detailsPanelSessionState.activeDetailsItemTitle = this._getDetailsItemTitle(selectedItem);

      this.setState({
        activeDetailsFormUrl: detailsFormUrl,
        activeDetailsItemTitle: this._getDetailsItemTitle(selectedItem),
        isDetailsFrameReady: false,
      });
    }
  }

  private _restoreDetailsPanelIfNeeded(): void {
    const detailsPanelSessionState = this._getDetailsPanelSessionState();

    if (this.state.activePanelMode === "editSelectedItems" || !detailsPanelSessionState.isOpen || this.state.activeDetailsFormUrl) {
      return;
    }

    if (this.props.allowMulti === true && this._selectedItems.length > 1) {
      void this._prepareSelectedItemsEditPanel(true);
      return;
    }

    const selectedItem = this._selectedItems.length === 1 ? this._selectedItems[0] : null;
    const detailsFormUrl = selectedItem ? this._buildDetailsFormUrl(selectedItem) : null;
    const restoredDetailsFormUrl = detailsFormUrl ?? detailsPanelSessionState.activeDetailsFormUrl;
    const restoredDetailsItemTitle = selectedItem
      ? this._getDetailsItemTitle(selectedItem)
      : detailsPanelSessionState.activeDetailsItemTitle;

    if (!restoredDetailsFormUrl) {
      return;
    }

    this.setState({
      activeDetailsFormUrl: restoredDetailsFormUrl,
      activeDetailsItemTitle: restoredDetailsItemTitle,
      isDetailsFrameReady: false,
    });
  }

  private _renderDetailsPanel(): JSX.Element {
    const detailsPanelTopOffset = this._getDetailsPanelTopOffset();
    const activeDetailsFormUrl = this._getResolvedDetailsFormUrl();
    const panelSurfaceStyle = this._getDetailsPanelSurfaceStyle();
    const isPanelOpen = !!activeDetailsFormUrl || this.state.activePanelMode === "editSelectedItems";

    return (
      <Panel
        isOpen={isPanelOpen}
        isBlocking={false}
        type={PanelType.custom}
        customWidth="320px"
        onDismiss={this._dismissDetailsPanel}
        onRenderNavigation={this._renderDetailsPanelNavigation}
        onRenderBody={this._renderDetailsPanelBody}
        styles={{
          main: {
            top: detailsPanelTopOffset,
            right: `${DETAILS_PANEL_RIGHT_OFFSET}px`,
            height: `calc(100vh - ${detailsPanelTopOffset}px)`,
            paddingTop: 0,
            backgroundColor: panelSurfaceStyle.backgroundColor,
            color: panelSurfaceStyle.color,
          },
          content: {
            display: "flex",
            flexDirection: "column",
            backgroundColor: panelSurfaceStyle.backgroundColor,
            color: panelSurfaceStyle.color,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            height: "100%",
            width: "100%",
          },
          contentInner: {
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            backgroundColor: panelSurfaceStyle.backgroundColor,
            color: panelSurfaceStyle.color,
            height: "100%",
            minHeight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
          },
          scrollableContent: {
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            backgroundColor: panelSurfaceStyle.backgroundColor,
            color: panelSurfaceStyle.color,
            height: "100%",
            minHeight: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
          },
          commands: {
            backgroundColor: panelSurfaceStyle.backgroundColor,
            color: panelSurfaceStyle.color,
            paddingTop: 0,
          },
        }}
      />
    );
  }

  private readonly _renderDetailsPanelNavigation = (): JSX.Element => {
    const panelSurfaceStyle = this._getDetailsPanelSurfaceStyle();
    const panelBackgroundColor = panelSurfaceStyle.backgroundColor as string | undefined;
    const panelTextColor = panelSurfaceStyle.color as string | undefined;

    return (
      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <IconButton
          ariaLabel={strings.Layouts.DetailsList.CloseDetailsPanelLabel}
          iconProps={{ iconName: "Cancel" }}
          onClick={this._dismissDetailsPanel}
          styles={{ root: { backgroundColor: panelBackgroundColor, color: panelTextColor } }}
        />
      </div>
    );
  };

  private readonly _renderDetailsPanelBody = (): JSX.Element => {
    if (this.state.activePanelMode === "editSelectedItems") {
      return this._renderSelectedItemsEditPanelBody();
    }

    const activeDetailsFormUrl = this._getResolvedDetailsFormUrl();
    const activeDetailsItemTitle = this._getResolvedDetailsItemTitle();
    const panelSurfaceStyle = this._getDetailsPanelSurfaceStyle();

    return (
      <div
        style={{
          ...panelSurfaceStyle,
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          padding: 0,
          position: "relative",
          width: "100%",
        }}
      >
        {this.state.isDetailsFrameReady === false && (
          <div
            style={{
              ...panelSurfaceStyle,
              alignItems: "center",
              display: "flex",
              inset: 0,
              justifyContent: "center",
              position: "absolute",
              zIndex: 1,
            }}
          >
            <Spinner label={strings.Layouts.DetailsList.DetailsPanelHeader} size={SpinnerSize.medium} />
          </div>
        )}
        {activeDetailsFormUrl && (
          <iframe
            src={activeDetailsFormUrl}
            title={activeDetailsItemTitle || strings.Layouts.DetailsList.DetailsPanelHeader}
            onLoad={this._onDetailsFrameLoad}
            style={{
              display: "block",
              flex: "1 1 auto",
              minHeight: 0,
              width: "100%",
              height: "100%",
              border: 0,
              backgroundColor: panelSurfaceStyle.backgroundColor,
              opacity: this.state.isDetailsFrameReady === false ? 0 : 1,
            }}
          />
        )}
      </div>
    );
  };

  private readonly _refreshDetailsPanelLayout = (): void => {
    if ((!this._getResolvedDetailsFormUrl() && this.state.activePanelMode !== "editSelectedItems") || this._detailsLayoutAnimationFrame !== null) {
      return;
    }

    this._detailsLayoutAnimationFrame = window.requestAnimationFrame(() => {
      this._detailsLayoutAnimationFrame = null;
      this.forceUpdate();
    });
  };

  private _getResolvedDetailsFormUrl(): string | null {
    const detailsPanelSessionState = this._getDetailsPanelSessionState();
    return this.state.activeDetailsFormUrl ?? detailsPanelSessionState.activeDetailsFormUrl ?? null;
  }

  private _getResolvedDetailsItemTitle(): string | null {
    const detailsPanelSessionState = this._getDetailsPanelSessionState();
    return this.state.activeDetailsItemTitle ?? detailsPanelSessionState.activeDetailsItemTitle ?? null;
  }

  private _getDetailsPanelSessionState(): IDetailsPanelSessionState {
    const instanceId = this.props.context?.instanceId ?? "default";
    let panelSessionState = detailsPanelSessionStates.get(instanceId);

    if (!panelSessionState) {
      panelSessionState = {
        isOpen: false,
        activeDetailsFormUrl: null,
        activeDetailsItemTitle: null,
      };

      detailsPanelSessionStates.set(instanceId, panelSessionState);
    }

    return panelSessionState;
  }

  private readonly _getDetailsPanelTopOffset = (): number => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return 0;
    }

    const maxTopOffset = Math.max(0, window.innerHeight - MIN_DETAILS_PANEL_HEIGHT);

    const resolveBottom = (selectors: string[]): number => {
      const bottoms = selectors
        .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);

          if (rect.height <= 0 || rect.bottom <= 0 || style.display === "none" || style.visibility === "hidden") {
            return 0;
          }

          return Math.round(rect.bottom);
        });

      return bottoms.length > 0 ? Math.max(...bottoms) : 0;
    };

    const titleSectionBottom = resolveBottom([
      '[data-automation-id="pageTitleInput"]',
      '[data-automation-id="TitleTextId"]',
      '[data-automation-id="webPartTitleReadMode"]',
    ]);

    if (titleSectionBottom > 0) {
      return Math.min(titleSectionBottom, maxTopOffset);
    }

    const toolbarBottom = resolveBottom([
      '#spCommandBar',
      '[data-automation-id="pageCommandBar"]',
    ]);

    return Math.min(toolbarBottom, maxTopOffset);
  };

  private readonly _openPanel = (event: React.MouseEvent<any>, item: any): void => {
    event.preventDefault();
    event.stopPropagation();

    if (this.props.allowMulti === true && this._selectedItems.length > 1) {
      void this._prepareSelectedItemsEditPanel(true);
      return;
    }

    this._openSingleItemDetailsPanel(item);
  };

  private readonly _openSingleItemDetailsPanel = (item: any): void => {
    const detailsFormUrl = this._buildDetailsFormUrl(item);
    const detailsPanelSessionState = this._getDetailsPanelSessionState();

    if (!detailsFormUrl) {
      return;
    }

    detailsPanelSessionState.isOpen = true;
    detailsPanelSessionState.activeDetailsFormUrl = detailsFormUrl;
    detailsPanelSessionState.activeDetailsItemTitle = this._getDetailsItemTitle(item);

    this.setState({
      activePanelMode: "details",
      activeDetailsFormUrl: detailsFormUrl,
      activeDetailsItemTitle: this._getDetailsItemTitle(item),
      isDetailsFrameReady: false,
      selectedItemsEditPreparationResult: null,
      isSelectedItemsEditLoading: false,
      isSelectedItemsEditApplying: false,
      selectedItemsEditErrorMessage: null,
      selectedEditFieldValues: {},
      dirtySelectedEditFieldNames: [],
      selectedEditFieldInternalName: null,
      selectedEditFieldValue: undefined,
      canApplySelectedEditValue: false,
    });
  };

  private async _prepareSelectedItemsEditPanel(forceOpen: boolean = false): Promise<void> {
    if (this.props.selectedItemsEditService == null) {
      return;
    }

    const shouldOpen = forceOpen || this.state.activePanelMode === "editSelectedItems";

    if (!shouldOpen) {
      return;
    }

    const detailsPanelSessionState = this._getDetailsPanelSessionState();
    detailsPanelSessionState.isOpen = false;
    detailsPanelSessionState.activeDetailsFormUrl = null;
    detailsPanelSessionState.activeDetailsItemTitle = null;

    this.setState({
      activePanelMode: "editSelectedItems",
      activeDetailsFormUrl: null,
      activeDetailsItemTitle: null,
      isDetailsFrameReady: false,
      isSelectedItemsEditLoading: true,
      isSelectedItemsEditApplying: false,
      selectedItemsEditErrorMessage: null,
      selectedItemsEditPreparationResult: null,
      selectedEditFieldValues: {},
      dirtySelectedEditFieldNames: [],
      selectedEditFieldInternalName: null,
      selectedEditFieldValue: undefined,
      canApplySelectedEditValue: false,
    });

    try {
      const selectedItemsEditPreparationResult = await this.props.selectedItemsEditService.prepareSelectedItemsEdit(this._selectedItems);

      this.setState({
        activePanelMode: "editSelectedItems",
        selectedItemsEditPreparationResult,
        selectedEditFieldValues: this._getInitialSelectedEditFieldValues(selectedItemsEditPreparationResult.commonEditableFields ?? []),
        dirtySelectedEditFieldNames: [],
        selectedEditFieldInternalName: null,
        selectedEditFieldValue: undefined,
        canApplySelectedEditValue: false,
        isSelectedItemsEditLoading: false,
      });
    } catch (error) {
      this.setState({
        activePanelMode: "editSelectedItems",
        selectedItemsEditErrorMessage: (error as Error).message,
        isSelectedItemsEditLoading: false,
      });
    }
  }

  private readonly _dismissDetailsPanel = (): void => {
    this._closeDetailsPanel(this.state.activePanelMode === "editSelectedItems");
  };

  private readonly _closeDetailsPanel = (shouldResetSelection: boolean = false): void => {
    const detailsPanelSessionState = this._getDetailsPanelSessionState();

    detailsPanelSessionState.isOpen = false;
    detailsPanelSessionState.activeDetailsFormUrl = null;
    detailsPanelSessionState.activeDetailsItemTitle = null;

    this.setState({
      activePanelMode: null,
      activeDetailsFormUrl: null,
      activeDetailsItemTitle: null,
      isDetailsFrameReady: false,
      selectedItemsEditPreparationResult: null,
      isSelectedItemsEditLoading: false,
      isSelectedItemsEditApplying: false,
      selectedItemsEditErrorMessage: null,
      selectedEditFieldValues: {},
      dirtySelectedEditFieldNames: [],
      selectedEditFieldInternalName: null,
      selectedEditFieldValue: undefined,
      canApplySelectedEditValue: false,
    });

    if (shouldResetSelection) {
      this.props.hostElement?.dispatchEvent(new CustomEvent(RESET_RESULTS_SELECTION_EVENT, {
        bubbles: true,
      }));
    }
  };

  private _renderSelectedItemsEditPanelBody(): JSX.Element {
    const selectedItemsEditPreparationResult = this.state.selectedItemsEditPreparationResult;
    const fields = selectedItemsEditPreparationResult?.commonEditableFields ?? [];
    const dirtyFieldNames = new Set(this.state.dirtySelectedEditFieldNames ?? []);
    const panelSurfaceStyle = this._getDetailsPanelSurfaceStyle();

    return (
      <div
        style={{
          ...panelSurfaceStyle,
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          minHeight: 0,
          padding: "0 16px 16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ color: "#605e5c", fontSize: 12, marginBottom: 12 }}>
          {Text.format(
            strings.Layouts.DetailsList.SelectedItemsEditEligibleItemsCountLabel,
            `${selectedItemsEditPreparationResult?.eligibleItems?.length ?? 0}`,
            `${this._selectedItems.length}`
          )}
        </div>

        {this.state.isSelectedItemsEditLoading && (
          <Spinner label={strings.Layouts.DetailsList.SelectedItemsEditLoadingLabel} size={SpinnerSize.medium} />
        )}

        {!this.state.isSelectedItemsEditLoading && this.state.selectedItemsEditErrorMessage && (
          <MessageBar messageBarType={MessageBarType.error}>{this.state.selectedItemsEditErrorMessage}</MessageBar>
        )}

        {!this.state.isSelectedItemsEditLoading && !this.state.selectedItemsEditErrorMessage && selectedItemsEditPreparationResult?.eligibleItems?.length === 0 && (
          <MessageBar messageBarType={MessageBarType.warning}>{strings.Layouts.DetailsList.SelectedItemsEditNoEligibleItemsLabel}</MessageBar>
        )}

        {!this.state.isSelectedItemsEditLoading && !this.state.selectedItemsEditErrorMessage && selectedItemsEditPreparationResult?.eligibleItems?.length > 0 && fields.length === 0 && (
          <MessageBar messageBarType={MessageBarType.warning}>{strings.Layouts.DetailsList.SelectedItemsEditNoCommonFieldsLabel}</MessageBar>
        )}

        {!this.state.isSelectedItemsEditLoading && !this.state.selectedItemsEditErrorMessage && fields.length > 0 && (
          <>
            <style>{`
              .${SELECTED_EDIT_TAXONOMY_PICKER_CLASS} {
                position: relative;
              }

              .${SELECTED_EDIT_TAXONOMY_PICKER_CLASS} label {
                border: 0;
                clip: rect(0 0 0 0);
                height: 1px;
                margin: -1px;
                overflow: hidden;
                padding: 0;
                position: absolute;
                white-space: nowrap;
                width: 1px;
              }
            `}</style>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{strings.Layouts.DetailsList.SelectedItemsEditFieldLabel}</div>
            <div style={{ overflowY: "auto", minHeight: 0, border: "1px solid #edebe9", borderRadius: 2, background: "#fff" }}>
              {fields.map((field, index) => {
                const isDirty = dirtyFieldNames.has(field.internalName);

                return (
                  <div
                    key={field.internalName}
                    style={{
                      padding: "12px 14px",
                      borderTop: index > 0 ? "1px solid #edebe9" : "none",
                      background: isDirty ? "#faf9f8" : "transparent",
                      color: "inherit",
                    }}
                  >
                    <div id={this._getSelectedEditFieldLabelId(field)} style={{ fontSize: 14, fontWeight: 600 }}>{field.title}</div>
                    <div style={{ marginTop: 12 }}>
                      {this._renderSelectedEditFieldEditor(field)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <PrimaryButton
                text={strings.Controls.TextFieldApplyButtonText}
                onClick={this._applySelectedItemsEdit}
                disabled={dirtyFieldNames.size === 0 || this.state.isSelectedItemsEditApplying}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  private readonly _applySelectedItemsEdit = async (): Promise<void> => {
    const selectedItemsEditPreparationResult = this.state.selectedItemsEditPreparationResult;
    const dirtyFieldNames = this.state.dirtySelectedEditFieldNames ?? [];
    const selectedEditFieldValues = this.state.selectedEditFieldValues ?? {};
    const fieldsToApply = selectedItemsEditPreparationResult?.commonEditableFields.filter((field) => dirtyFieldNames.includes(field.internalName)) ?? [];

    if (!selectedItemsEditPreparationResult || fieldsToApply.length === 0 || !this.props.selectedItemsEditService) {
      return;
    }

    this.setState({
      isSelectedItemsEditApplying: true,
      selectedItemsEditErrorMessage: null,
    });

    try {
      for (const field of fieldsToApply) {
        await this.props.selectedItemsEditService.applySelectedItemsEdit(
          selectedItemsEditPreparationResult.eligibleItems,
          field,
          selectedEditFieldValues[field.internalName]
        );
      }

      await this._prepareSelectedItemsEditPanel(true);
    } catch (error) {
      this.setState({
        isSelectedItemsEditApplying: false,
        selectedItemsEditErrorMessage: (error as Error).message,
      });
    }
  };

  private _renderSelectedEditFieldEditor(field: IEditableFieldDescriptor): JSX.Element {
    const fieldValue = this._getSelectedEditFieldValue(field);

    switch (field.typeAsString) {
      case "Boolean":
        return (
          <Checkbox
            ariaLabel={field.title}
            checked={typeof fieldValue === "boolean" ? fieldValue : false}
            indeterminate={typeof fieldValue !== "boolean"}
            onChange={(_, checked) => this._setSelectedEditFieldValue(field, checked === true)}
          />
        );

      case "Choice": {
        const options: IDropdownOption[] = (field.choices ?? []).map((choice) => ({
          key: choice,
          text: choice,
        }));

        return (
          <Dropdown
            ariaLabel={field.title}
            options={options}
            selectedKey={typeof fieldValue === "string" ? fieldValue : undefined}
            onChange={(_, option) => this._setSelectedEditFieldValue(field, option?.key as string | undefined)}
          />
        );
      }

      case "DateTime":
        return (
          <DatePicker
            ariaLabel={field.title}
            value={this._getSelectedEditDateValue(fieldValue)}
            onSelectDate={(date) => this._setSelectedEditFieldValue(field, date ?? undefined)}
            showGoToToday={true}
            allowTextInput={true}
            strings={strings.General.DatePickerStrings}
          />
        );

      case "TaxonomyFieldType":
      case "TaxonomyFieldTypeMulti":
        return this._renderSelectedEditTaxonomyPicker(field);

      case "User":
      case "UserMulti":
        return this._renderSelectedEditTagPicker(field);

      case "Currency":
      case "Number":
        return this._renderSelectedEditTextField(field, fieldValue, { type: "number" });

      case "Note":
        return this._renderSelectedEditTextField(field, fieldValue, { multiline: true, autoAdjustHeight: true });

      case "Text":
      default:
        return this._renderSelectedEditTextField(field, fieldValue);
    }
  }

  private _renderSelectedEditTextField(
    field: IEditableFieldDescriptor,
    fieldValue: unknown,
    props?: Partial<React.ComponentProps<typeof TextField>>
  ): JSX.Element {
    return (
      <TextField
        ariaLabel={field.title}
        value={this._getSelectedEditTextValue(fieldValue)}
        onChange={(_, value) => this._setSelectedEditFieldValue(field, value ?? "")}
        {...props}
      />
    );
  }

  private _renderSelectedEditTaxonomyPicker(field: IEditableFieldDescriptor): JSX.Element {
    const webPartContext = this.props.webPartContext;

    if (!field.termSetId || !webPartContext?.pageContext || !webPartContext?.spHttpClient) {
      return this._renderSelectedEditTagPicker(field);
    }

    return (
      <div className={SELECTED_EDIT_TAXONOMY_PICKER_CLASS}>
        <React.Suspense fallback={<Spinner size={SpinnerSize.small} />}>
          <LazyTaxonomyPicker
            label={field.title}
            panelTitle={field.title}
            placeholder={strings.General.TagPickerStrings.SearchPlaceholder}
            allowMultipleSelections={field.allowMultipleValues !== false}
            termsetNameOrID={field.termSetId}
            isTermSetSelectable={false}
            context={webPartContext as any}
            initialValues={this._getSelectedEditTaxonomyTerms(this._getSelectedEditFieldValue(field), field.termSetId)}
            onChange={(nextSelectedItems?: IPickerTerms) => {
              this._setSelectedEditFieldValue(field, (nextSelectedItems as ISelectedEditTag[]) ?? []);
            }}
          />
        </React.Suspense>
      </div>
    );
  }

  private _renderSelectedEditTagPicker(field: IEditableFieldDescriptor): JSX.Element {
    const selectedItems = this._getSelectedEditTags(this._getSelectedEditFieldValue(field));

    return (
      <TagPicker
        itemLimit={field.allowMultipleValues ? undefined : 1}
        selectedItems={selectedItems}
        removeButtonAriaLabel={strings.General.TagPickerStrings.RemoveButtonAriaLabel}
        inputProps={{
          "aria-label": field.title,
          placeholder: selectedItems.length === 0 ? strings.General.TagPickerStrings.SearchPlaceholder : "",
        }}
        pickerSuggestionsProps={{
          noResultsFoundText: strings.General.TagPickerStrings.NoResultsSearchMessage,
        }}
        onResolveSuggestions={async (filterText: string, currentSelectedItems?: ITag[]) => {
          return this._resolveSelectedEditTagSuggestions(field, filterText, (currentSelectedItems as ISelectedEditTag[]) ?? []);
        }}
        onChange={(nextSelectedItems?: ITag[]) => {
          this._setSelectedEditFieldValue(field, (nextSelectedItems as ISelectedEditTag[]) ?? []);
        }}
      />
    );
  }

  private async _resolveSelectedEditTagSuggestions(field: IEditableFieldDescriptor, filterText: string, currentSelectedItems: ISelectedEditTag[]): Promise<ISelectedEditTag[]> {
    switch (field.typeAsString) {
      case "User":
      case "UserMulti":
        return this._searchSelectedEditUsers(filterText, currentSelectedItems);

      case "TaxonomyFieldType":
      case "TaxonomyFieldTypeMulti":
        return this._searchSelectedEditTerms(field, filterText, currentSelectedItems);

      default:
        return [];
    }
  }

  private async _searchSelectedEditUsers(filterText: string, currentSelectedItems: ISelectedEditTag[]): Promise<ISelectedEditTag[]> {
    const normalizedFilterText = `${filterText ?? ""}`.trim();

    if (!normalizedFilterText) {
      return [];
    }

    const digest = await this._getRequestDigest();
    const response = await fetch(`${this._getCurrentWebAbsoluteUrl()}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      credentials: "same-origin",
      body: JSON.stringify({
        queryParams: {
          QueryString: normalizedFilterText,
          MaximumEntitySuggestions: 20,
          PrincipalType: 1,
          PrincipalSource: 15,
          AllowEmailAddresses: true,
          AllowMultipleEntities: true,
          AllUrlZones: false,
        },
      }),
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const rawResult = json?.d?.ClientPeoplePickerSearchUser;
    const entities = rawResult ? JSON.parse(rawResult) as IPeoplePickerPrincipalEntity[] : [];

    return entities
      .map((entity) => {
        const key = entity?.Key || entity?.EntityData?.AccountName || entity?.EntityData?.Email || "";
        const name = entity?.DisplayText || entity?.EntityData?.Email || entity?.EntityData?.AccountName || key;

        return {
          key,
          name,
          secondaryText: entity?.EntityData?.Email || entity?.EntityData?.AccountName || "",
        };
      })
      .filter((entry) => !!entry.key && !!entry.name)
      .filter((entry) => !currentSelectedItems.some((selectedItem) => `${selectedItem.key}` === `${entry.key}`));
  }

  private async _searchSelectedEditTerms(field: IEditableFieldDescriptor, filterText: string, currentSelectedItems: ISelectedEditTag[]): Promise<ISelectedEditTag[]> {
    if (!field.termSetId || !this.props.taxonomyService) {
      return [];
    }

    const normalizedFilterText = `${filterText ?? ""}`.trim().toLocaleLowerCase();
    const availableTerms = await this._getTaxonomyTags(field.termSetId, field.internalName, field.availableTags);

    return availableTerms
      .filter((term) => normalizedFilterText.length === 0 || `${term.name ?? ""}`.toLocaleLowerCase().includes(normalizedFilterText))
      .filter((term) => !currentSelectedItems.some((selectedItem) => `${selectedItem.key}` === `${term.key}`));
  }

  private async _getTaxonomyTags(termSetId: string, fieldInternalName?: string, fieldAvailableTags?: Array<{ key: string; name: string }>): Promise<ISelectedEditTag[]> {
    const normalizedTermSetId = `${termSetId ?? ""}`.trim().toLocaleLowerCase();
    const cacheKey = `${normalizedTermSetId}::${fieldInternalName ?? ""}`;

    if (!normalizedTermSetId || !this.props.taxonomyService) {
      return [];
    }

    if (!this._taxonomyTagsCache.has(cacheKey)) {
      this._taxonomyTagsCache.set(cacheKey, this.props.taxonomyService.getTermsByTermSetId(this._getCurrentSiteAbsoluteUrl(), termSetId, "").then((terms) => {
        const taxonomyTags = this._mapTermsToSelectedEditTags(terms);

        if (taxonomyTags.length > 0) {
          return taxonomyTags;
        }

        const fieldTags = this._mapAvailableTagsToSelectedEditTags(fieldAvailableTags);
        if (fieldTags.length > 0) {
          return fieldTags;
        }

        return this._getTaxonomyTagsFromCurrentItems(fieldInternalName);
      }));
    }

    return this._taxonomyTagsCache.get(cacheKey)!;
  }

  private _getSelectedEditFieldLabelId(field: IEditableFieldDescriptor): string {
    return `details-selected-edit-field-${field.internalName}`;
  }

  private _mapTermsToSelectedEditTags(terms: ITerm[]): ISelectedEditTag[] {
    return (terms ?? [])
      .filter((term) => term?.IsDeprecated !== true && term?.IsAvailableForTagging !== false)
      .map((term) => ({
        key: `${term.Id ?? ""}`.replace(/[{}]/g, ""),
        name: term.Name || "",
      }))
      .filter((term) => !!term.key && !!term.name)
      .sort((left, right) => `${left.name}`.localeCompare(`${right.name}`));
  }

  private _mapAvailableTagsToSelectedEditTags(tags?: Array<{ key: string; name: string }>): ISelectedEditTag[] {
    return (tags ?? [])
      .filter((tag) => !!tag?.key && !!tag?.name)
      .map((tag) => ({ key: tag.key, name: tag.name }))
      .sort((left, right) => `${left.name}`.localeCompare(`${right.name}`));
  }

  private _getTaxonomyTagsFromCurrentItems(fieldInternalName?: string): ISelectedEditTag[] {
    if (!fieldInternalName || !this.props.items?.length) {
      return [];
    }

    const tagsByKey = new Map<string, ISelectedEditTag>();

    for (const item of this.props.items) {
      const rawValue = this._resolveExternalItemFieldValue(item, fieldInternalName);
      this._addTaxonomyTagsFromRawValue(rawValue, tagsByKey);
    }

    return Array.from(tagsByKey.values()).sort((left, right) => `${left.name}`.localeCompare(`${right.name}`));
  }

  private _addTaxonomyTagsFromRawValue(rawValue: unknown, tagsByKey: Map<string, ISelectedEditTag>): void {
    if (!this._hasRenderableValue(rawValue)) {
      return;
    }

    if (Array.isArray(rawValue)) {
      rawValue.forEach((entry) => this._addTaxonomyTagsFromRawValue(entry, tagsByKey));
      return;
    }

    if (typeof rawValue === "object") {
      this._addTaxonomyTagsFromObject(rawValue as { Label?: string; TermGuid?: string; id?: string; name?: string }, tagsByKey);
      return;
    }

    const primitiveValue = this._toPrimitiveString(rawValue);

    if (!primitiveValue) {
      return;
    }

    this._addTaxonomyTagsFromString(primitiveValue.trim(), tagsByKey);
  }

  private _addTaxonomyTagsFromObject(rawValue: { Label?: string; TermGuid?: string; id?: string; name?: string }, tagsByKey: Map<string, ISelectedEditTag>): void {
    const key = this._toNormalizedTaxonomyKey(rawValue.TermGuid ?? rawValue.id);
    const name = this._toTrimmedString(rawValue.Label ?? rawValue.name);

    if (key && name && !tagsByKey.has(key)) {
      tagsByKey.set(key, { key, name });
    }
  }

  private _addTaxonomyTagsFromString(rawStringValue: string, tagsByKey: Map<string, ISelectedEditTag>): void {
    if (!rawStringValue) {
      return;
    }

    const initialTagCount = tagsByKey.size;
    const decodedValue = TaxonomyHelper.decodeHexString(rawStringValue);
    const candidateValues = [rawStringValue, decodedValue].filter((value): value is string => !!value);
    const termPattern = /(?:GP0|GPP|L0)\|#0?([-0-9a-fA-F]{32,36})\|([^;]+)/g;

    for (const candidateValue of candidateValues) {
      let match: RegExpExecArray | null;
      while ((match = termPattern.exec(candidateValue)) !== null) {
        const key = TaxonomyHelper.normalizeGuid(match[1]);
        const name = this._toTrimmedString(match[2]);

        if (key && name && !tagsByKey.has(key)) {
          tagsByKey.set(key, { key, name });
        }
      }
    }

    if (tagsByKey.size > initialTagCount) {
      return;
    }

    const fallbackGuids = TaxonomyHelper.extractGuidsFromFilterValue(rawStringValue);
    const fallbackLabel = TaxonomyHelper.extractTaxonomyLabel(rawStringValue);

    if (fallbackGuids.length > 0 && fallbackLabel && !tagsByKey.has(fallbackGuids[0])) {
      tagsByKey.set(fallbackGuids[0], { key: fallbackGuids[0], name: fallbackLabel });
    }
  }

  private _toNormalizedTaxonomyKey(value: unknown): string {
    return this._toTrimmedString(value)?.replace(/[{}-]/g, "").toLowerCase() ?? "";
  }

  private _toTrimmedString(value: unknown): string {
    return this._toPrimitiveString(value)?.trim() ?? "";
  }

  private _toPrimitiveString(value: unknown): string | undefined {
    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    return undefined;
  }

  private _getInitialSelectedEditFieldValue(field?: IEditableFieldDescriptor | null): unknown {
    if (!field) {
      return undefined;
    }

    switch (field.typeAsString) {
      case "Boolean":
        return this._selectedEditFieldHasSharedValue(field)
          ? field.sharedValueRaw === true || field.sharedValueRaw === "true" || field.sharedValueRaw === 1 || field.sharedValueRaw === "1"
          : undefined;

      case "DateTime":
        return this._selectedEditFieldHasSharedValue(field) ? this._getSelectedEditDateValue(field.sharedValueRaw) : undefined;

      case "TaxonomyFieldType":
      case "TaxonomyFieldTypeMulti":
        return this._selectedEditFieldHasSharedValue(field) ? this._getInitialTaxonomyFieldValue(field.sharedValueRaw) : [];

      case "User":
      case "UserMulti":
        return this._selectedEditFieldHasSharedValue(field) ? this._getInitialUserFieldValue(field.sharedValueRaw) : [];

      case "Currency":
      case "Number":
      case "Note":
      case "Text":
      case "Choice":
      default:
        return this._selectedEditFieldHasSharedValue(field) ? field.sharedValueRaw ?? "" : undefined;
    }
  }

  private _selectedEditFieldHasSharedValue(field?: IEditableFieldDescriptor | null): boolean {
    return field?.sharedValue !== undefined;
  }

  private _getSelectedEditTextValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
      return `${value}`;
    }

    if (typeof value === "symbol") {
      return value.description ?? value.toString();
    }

    return JSON.stringify(value);
  }

  private _getSelectedEditDateValue(value: unknown): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value !== "string" && typeof value !== "number") {
      return undefined;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  private _getSelectedEditTags(value: unknown): ISelectedEditTag[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((entry): entry is ISelectedEditTag => {
      return !!entry
        && typeof entry === "object"
        && Object.prototype.hasOwnProperty.call(entry, "key")
        && Object.prototype.hasOwnProperty.call(entry, "name");
    });
  }

  private _getSelectedEditTaxonomyTerms(value: unknown, termSetId: string): IPickerTerms {
    return this._getSelectedEditTags(value).map((term) => ({
      key: `${term.key ?? ""}`,
      name: `${term.name ?? ""}`,
      path: `${term.name ?? ""}`,
      termSet: `${termSetId ?? ""}`,
    }));
  }

  private _getInitialSelectedEditFieldValues(fields: IEditableFieldDescriptor[]): Record<string, unknown> {
    return fields.reduce<Record<string, unknown>>((accumulator, field) => {
      accumulator[field.internalName] = this._getInitialSelectedEditFieldValue(field);
      return accumulator;
    }, {});
  }

  private _getSelectedEditFieldValue(field: IEditableFieldDescriptor): unknown {
    return this.state.selectedEditFieldValues?.[field.internalName];
  }

  private _setSelectedEditFieldValue(field: IEditableFieldDescriptor, value: unknown): void {
    const initialValue = this._getInitialSelectedEditFieldValue(field);
    const isDirty = !this._areSelectedEditFieldValuesEqual(initialValue, value);
    const dirtyFieldNames = new Set(this.state.dirtySelectedEditFieldNames ?? []);

    if (isDirty) {
      dirtyFieldNames.add(field.internalName);
    } else {
      dirtyFieldNames.delete(field.internalName);
    }

    this.setState((currentState) => ({
      selectedEditFieldValues: currentState.selectedEditFieldValues
        ? {
            ...currentState.selectedEditFieldValues,
            [field.internalName]: value,
          }
        : { [field.internalName]: value },
      dirtySelectedEditFieldNames: Array.from(dirtyFieldNames),
    }));
  }

  private _areSelectedEditFieldValuesEqual(left: unknown, right: unknown): boolean {
    return this._serializeSelectedEditComparisonValue(left) === this._serializeSelectedEditComparisonValue(right);
  }

  private _serializeSelectedEditComparisonValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return JSON.stringify(
        value
          .map((entry) => this._serializeSelectedEditComparisonValue(entry))
          .sort((left, right) => left.localeCompare(right))
      );
    }

    if (typeof value === "object") {
      const objectValue = value as { key?: string; name?: string; id?: string; Label?: string; TermGuid?: string; };

      if (objectValue.key || objectValue.name) {
        return JSON.stringify({ key: objectValue.key ?? "", name: objectValue.name ?? "" });
      }

      if (objectValue.id || objectValue.Label || objectValue.TermGuid) {
        return JSON.stringify({ id: objectValue.id ?? objectValue.TermGuid ?? "", name: objectValue.Label ?? "" });
      }

      return JSON.stringify(objectValue);
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
      return value.toString();
    }

    if (typeof value === "symbol") {
      return value.description ?? value.toString();
    }

    return Object.prototype.toString.call(value);
  }

  private _getInitialTaxonomyFieldValue(rawValue: unknown): ISelectedEditTag[] {
    const tagsByKey = new Map<string, ISelectedEditTag>();
    this._addTaxonomyTagsFromRawValue(rawValue, tagsByKey);
    return Array.from(tagsByKey.values());
  }

  private _getInitialUserFieldValue(rawValue: unknown): ISelectedEditTag[] {
    const tagsByKey = new Map<string, ISelectedEditTag>();
    this._addUserTagsFromRawValue(rawValue, tagsByKey);
    return Array.from(tagsByKey.values());
  }

  private _addUserTagsFromRawValue(rawValue: unknown, tagsByKey: Map<string, ISelectedEditTag>): void {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return;
    }

    if (Array.isArray(rawValue)) {
      rawValue.forEach((entry) => this._addUserTagsFromRawValue(entry, tagsByKey));
      return;
    }

    if (typeof rawValue === "object") {
      const userValue = rawValue as { Key?: string; Email?: string; AccountName?: string; Title?: string; Name?: string; DisplayText?: string; };
      const key = `${userValue.Key ?? userValue.Email ?? userValue.AccountName ?? ""}`.trim();
      const name = `${userValue.Title ?? userValue.Name ?? userValue.DisplayText ?? userValue.Email ?? userValue.AccountName ?? key}`.trim();

      if (key && name && !tagsByKey.has(key)) {
        tagsByKey.set(key, { key, name });
      }

      return;
    }

    if (typeof rawValue !== "string") {
      return;
    }

    const rawStringValue = rawValue.trim();
    if (!rawStringValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawStringValue) as Array<{ Key?: string; DisplayText?: string; }>;
      if (Array.isArray(parsedValue)) {
        parsedValue.forEach((entry) => this._addUserTagsFromRawValue(entry, tagsByKey));
        return;
      }
    } catch {
      // Ignore non-JSON user field values.
    }

    const segments = rawStringValue.split(/[;,]/).map((segment) => segment.trim()).filter(Boolean);
    segments.forEach((segment) => {
      if (!tagsByKey.has(segment)) {
        tagsByKey.set(segment, { key: segment, name: segment });
      }
    });
  }

  private async _getRequestDigest(): Promise<string> {
    if (this._requestDigestToken && Date.now() < this._requestDigestExpiration) {
      return this._requestDigestToken;
    }

    const response = await fetch(`${this._getCurrentWebAbsoluteUrl()}/_api/contextinfo`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
      },
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve request digest. ${response.statusText}`);
    }

    const json = await response.json();
    const digest = `${json?.d?.GetContextWebInformation?.FormDigestValue ?? ""}`;
    const timeoutSeconds = Number(json?.d?.GetContextWebInformation?.FormDigestTimeoutSeconds ?? 1800);

    this._requestDigestToken = digest;
    this._requestDigestExpiration = Date.now() + Math.max(60, timeoutSeconds - 30) * 1000;

    return digest;
  }

  private _getCurrentWebAbsoluteUrl(): string {
    return `${this.props.webAbsoluteUrl ?? this.props.siteAbsoluteUrl ?? globalThis.location?.origin ?? ""}`.replace(/\/$/, "");
  }

  private _getCurrentSiteAbsoluteUrl(): string {
    return `${this.props.siteAbsoluteUrl ?? this.props.webAbsoluteUrl ?? globalThis.location?.origin ?? ""}`.replace(/\/$/, "");
  }

  private readonly _onDetailsFrameLoad = (event: React.SyntheticEvent<HTMLIFrameElement>): void => {
    this._enhanceDetailsFrame(event.currentTarget, 0);
  };

  private readonly _enhanceDetailsFrame = (iframe: HTMLIFrameElement, attempt: number): void => {
    const iframeUrl = iframe.getAttribute("src") || "";

    try {
      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        return;
      }

      if (this._handleViewerFrame(iframe, iframeDocument, iframeUrl, attempt)) {
        return;
      }

      if (this._handleDetailsPaneFrame(iframe, iframeDocument, iframeUrl, attempt)) {
        return;
      }

      this._prepareEmbeddedFrame(iframeDocument);
      this._setDetailsFrameReady(true);
    } catch {
      // Ignore cross-origin or transient iframe access failures.
    }
  };

  private _handleViewerFrame(iframe: HTMLIFrameElement, iframeDocument: Document, iframeUrl: string, attempt: number): boolean {
    if (!iframeUrl.includes("/_layouts/15/viewer.aspx")) {
      return false;
    }

    this._hideDetailsEmbeddedCloseButton(iframeDocument);
    this._hideDetailsAccessSection(iframeDocument);

    const detailsPaneFrame = iframeDocument.querySelector('iframe[src*="modernFrame.aspx"][src*="scenario=detailsPane"]') as HTMLIFrameElement;

    if (detailsPaneFrame?.src) {
      const normalizedDetailsPaneUrl = this._normalizeDetailsPaneUrl(detailsPaneFrame.src);

      if (iframe.src !== normalizedDetailsPaneUrl) {
        iframe.src = normalizedDetailsPaneUrl;
      } else {
        this._hideDetailsNestedFrameSections(detailsPaneFrame);
      }

      return true;
    }

    this._openViewerDetailsPane(iframe, iframeDocument, iframeUrl);

    if (attempt < 40) {
      window.setTimeout(() => this._enhanceDetailsFrame(iframe, attempt + 1), 150);
    } else {
      this._setDetailsFrameReady(true);
    }

    return true;
  }

  private _handleDetailsPaneFrame(iframe: HTMLIFrameElement, iframeDocument: Document, iframeUrl: string, attempt: number): boolean {
    if (!iframeUrl.includes("modernFrame.aspx") || !iframeUrl.includes("scenario=detailsPane")) {
      return false;
    }

    const normalizedIframeUrl = this._normalizeDetailsPaneUrl(iframeUrl);

    if (iframe.src !== normalizedIframeUrl) {
      iframe.src = normalizedIframeUrl;
      return true;
    }

    this._prepareDetailsPaneFrame(iframeDocument);

    const hasRenderableFrameContent = this._hasRenderableDetailsFrameContent(iframeDocument);
    const hasInitialFrameShell = this._hasInitialDetailsFrameShell(iframeDocument);

    this._setDetailsFrameReady(hasRenderableFrameContent || hasInitialFrameShell || attempt >= 10);

    if (attempt < 10) {
      window.setTimeout(() => this._enhanceDetailsFrame(iframe, attempt + 1), 300);
    }

    return true;
  }

  private _hideDetailsNestedFrameSections(detailsPaneFrame: HTMLIFrameElement): void {
    try {
      const detailsPaneDocument = detailsPaneFrame.contentDocument;

      if (detailsPaneDocument) {
        this._hideDetailsEmbeddedCloseButton(detailsPaneDocument);
        this._hideDetailsAccessSection(detailsPaneDocument);
      }
    } catch {
      // Ignore nested frame access timing issues.
    }
  }

  private _openViewerDetailsPane(iframe: HTMLIFrameElement, iframeDocument: Document, iframeUrl: string): void {
    const infoButton = this._findViewerDetailsTrigger<HTMLButtonElement>(iframeDocument, "button");
    const overflowInfoButton = this._findViewerDetailsTrigger<HTMLElement>(iframeDocument, '[role="menuitem"]');
    const moreButton = this._findViewerMoreButton(iframeDocument);

    if (overflowInfoButton && iframe.dataset.detailsViewerMarker !== `${iframeUrl}:info`) {
      iframe.dataset.detailsViewerMarker = `${iframeUrl}:info`;
      overflowInfoButton.click();
    }

    if (infoButton && iframe.dataset.detailsViewerMarker !== iframeUrl) {
      iframe.dataset.detailsViewerMarker = iframeUrl;
      infoButton.click();
      return;
    }

    if (!infoButton && moreButton && moreButton.getAttribute("aria-expanded") !== "true") {
      moreButton.click();
    }
  }

  private _findViewerDetailsTrigger<TElement extends Element>(iframeDocument: Document, selector: string): TElement | null {
    return Array.from(iframeDocument.querySelectorAll(selector)).find((element) => {
      const htmlElement = element as HTMLElement;
      const ariaLabel = htmlElement.getAttribute("aria-label") || "";

      return ariaLabel === "Info, View file details"
        || !!htmlElement.querySelector('[data-icon-name="Info"], [data-icon-name="InfoSolid"], [data-icon-name="Info2"]');
    }) as TElement | null;
  }

  private _findViewerMoreButton(iframeDocument: Document): HTMLButtonElement | null {
    return Array.from(iframeDocument.querySelectorAll("button")).find((element) => {
      const htmlElement = element as HTMLButtonElement;
      const ariaLabel = htmlElement.getAttribute("aria-label") || "";

      return ariaLabel === "More"
        || !!htmlElement.querySelector('[data-icon-name="More"], [data-icon-name="MoreVertical"]');
    }) as HTMLButtonElement | null;
  }

  private _prepareDetailsPaneFrame(iframeDocument: Document): void {
    this._hideDetailsEmbeddedCloseButton(iframeDocument);
    this._hideDetailsAccessSection(iframeDocument);
    this._moveDetailsCommandBarToBottom(iframeDocument);
    this._resetFrameScroll(iframeDocument);
  }

  private _prepareEmbeddedFrame(iframeDocument: Document): void {
    this._moveDetailsCommandBarToBottom(iframeDocument);
    this._ensureFrameStyle(
      iframeDocument,
      "pnp-modern-search-details-frame-style",
      `
        .sp-skipToContent,
        .ms-accessible,
        .od-TopBar,
        .od-Files-topBar,
        .od-ListForm-breadcrumb,
        .BreadcrumbBar {
          display: none !important;
        }

        html,
        body,
        .sp-App-body,
        .sp-App-bodyMain,
        .Files-main,
        .Files-mainColumn,
        .Files-content,
        .Files-contentAreaFlexContainer,
        .Files-rightPaneInteractionContainer,
        .Files-rightPanePushedContainer,
        .Files-rightPane,
        .Files-rightPaneContent,
        .od-ListItemFormRoot,
        .od-ListForm-root,
        .list-form-container-root,
        .list-form-wrapper {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
      `
    );
    this._resetFrameScroll(iframeDocument);
  }

  private _ensureFrameStyle(iframeDocument: Document, styleId: string, cssText: string): void {
    let styleElement = iframeDocument.getElementById(styleId) as HTMLStyleElement;

    if (styleElement) {
      return;
    }

    styleElement = iframeDocument.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = cssText;
    iframeDocument.head.appendChild(styleElement);
  }

  private _resetFrameScroll(iframeDocument: Document): void {
    iframeDocument.documentElement.scrollTop = 0;
    iframeDocument.body.scrollTop = 0;
  }

  private readonly _setDetailsFrameReady = (isReady: boolean): void => {
    if (this.state.isDetailsFrameReady !== isReady) {
      this.setState({ isDetailsFrameReady: isReady });
    }
  };

  private readonly _hideDetailsEmbeddedCloseButton = (iframeDocument: Document): void => {
    this._ensureFrameStyle(iframeDocument, "pnp-modern-search-details-pane-style", `
      .od-DetailsPane-PrimaryPane-header-close,
      button[aria-label="Close the details pane"] {
        display: none !important;
      }
    `);
  };

  private readonly _hideDetailsAccessSection = (iframeDocument: Document): void => {
    this._ensureFrameStyle(iframeDocument, "pnp-modern-search-details-access-section-style", `
        button[aria-label="Has access"],
        button[aria-label="Manage access"] {
          display: none !important;
        }
      `);

    const accessTriggers = Array.from(iframeDocument.querySelectorAll("button, [role='button'], [role='heading']"))
      .filter((element) => {
        const label = (element.getAttribute("aria-label") || element.textContent || "").trim().toLowerCase();
        return label === "has access" || label === "manage access";
      });

    accessTriggers.forEach((element) => {
      const section = (element.closest("section") || element.closest("[role='group']") || element.closest("div")) as HTMLElement;

      if (section) {
        section.style.display = "none";
      } else if (element instanceof HTMLElement) {
        element.style.display = "none";
      }
    });
  };

  private readonly _moveDetailsCommandBarToBottom = (iframeDocument: Document): void => {
    const commandBar = Array.from(iframeDocument.querySelectorAll('div[role="menubar"]')).find((element) => {
      const htmlElement = element as HTMLElement;

      return !!(
        htmlElement.querySelector('button[aria-label="Edit all"]') ||
        htmlElement.querySelector('button[aria-label="Show comments"]') ||
        htmlElement.querySelector('.od-Command--Comment')
      );
    }) as HTMLElement;

    if (!commandBar) {
      return;
    }

    commandBar.classList.add("pnp-modern-search-details-command-bar");
    iframeDocument.body?.classList.add("pnp-modern-search-has-details-bottom-command-bar");

    this._ensureFrameStyle(iframeDocument, "pnp-modern-search-details-command-bar-style", `
      .pnp-modern-search-details-command-bar {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 1000 !important;
        background: inherit !important;
        border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
        padding: 8px 12px !important;
        box-sizing: border-box !important;
      }

      body.pnp-modern-search-has-details-bottom-command-bar {
        padding-bottom: 72px !important;
      }
    `);
  };

  private _hasRenderableDetailsFrameContent(iframeDocument: Document): boolean {
    const detailsRegion = iframeDocument.querySelector('[role="region"][aria-label="Details pane"]');
    const detailsTerms = iframeDocument.querySelectorAll("dt, dd");
    const detailsHeadings = Array.from(iframeDocument.querySelectorAll("h1, h2, h3")).filter((element) => {
      return (element.textContent || "").trim().length > 0;
    });

    return !!detailsRegion || detailsTerms.length > 0 || detailsHeadings.length > 0;
  }

  private _hasInitialDetailsFrameShell(iframeDocument: Document): boolean {
    const detailsHeadings = Array.from(iframeDocument.querySelectorAll("h1, h2, h3")).filter((element) => {
      return (element.textContent || "").trim().length > 0;
    });
    const hasSecondaryPane = !!iframeDocument.querySelector(".od-DetailsPane-SecondaryPane-wrapper, .od-DetailsPane-ScrollableSection, .od-DetailsPane-SecondaryPane");
    const hasCommandBar = !!iframeDocument.querySelector('div[role="menubar"]');

    return detailsHeadings.length > 0 && (hasSecondaryPane || hasCommandBar);
  }

  private _getDetailsPanelSurfaceStyle(): React.CSSProperties {
    const theme = (this.props.themeVariant as ITheme) || getTheme();
    const backgroundColor = theme.semanticColors?.bodyBackground ?? theme.semanticColors?.bodyStandoutBackground ?? theme.palette?.white;
    const color = theme.semanticColors?.bodyText ?? theme.palette?.neutralPrimary;

    return {
      backgroundColor,
      color,
    };
  }

  private _buildDetailsFormUrl(item: any): string | null {
    const webUrl = this._resolveExternalItemFieldValue(item, "SPWebUrl") ?? this._resolveExternalItemFieldValue(item, "SPSiteURL") ?? this._resolveExternalItemFieldValue(item, "SitePath");
    const listId = this._resolveExternalItemFieldValue(item, "ListId") ?? this._resolveExternalItemFieldValue(item, "NormListID") ?? this._resolveExternalItemFieldValue(item, "IdentityListId");
    const listItemId = this._resolveDetailsListItemId(item);

    if (!webUrl) {
      return null;
    }

    try {
      const baseUrl = new URL(webUrl, window.location.origin);

      if (baseUrl.origin !== window.location.origin) {
        return null;
      }

      if (this._isDetailsDocumentItem(item)) {
        return this._buildDocumentViewerUrl(item, baseUrl) ?? this._buildDocumentDetailsPaneUrl(item, baseUrl);
      }

      if (!listId || !listItemId) {
        return null;
      }

      if (!this._isDetailsListItem(item, listItemId)) {
        return null;
      }

      const formUrl = new URL(baseUrl.origin);
      formUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/_layouts/15/listform.aspx`;
      formUrl.searchParams.set("PageType", "4");
      formUrl.searchParams.set("ListId", this._normalizeDetailsGuid(listId));
      formUrl.searchParams.set("ID", String(listItemId));
      formUrl.searchParams.set("env", "Embedded");

      return formUrl.toString();
    } catch {
      return null;
    }
  }

  private _resolveDetailsListItemId(item: any): string | number | null {
    const explicitListItemId = this._resolveExternalItemFieldValue(item, "ListItemID") ?? this._resolveExternalItemFieldValue(item, "Id");

    if (this._hasRenderableValue(explicitListItemId)) {
      return explicitListItemId;
    }

    const itemPath = this._resolveExternalItemFieldValue(item, "Path") ?? this._resolveExternalItemFieldValue(item, "OriginalPath") ?? this._resolveExternalItemFieldValue(item, "AutoPreviewUrl");

    if (typeof itemPath === "string") {
      try {
        const itemUrl = new URL(itemPath, window.location.origin);
        const queryListItemId = itemUrl.searchParams.get("ID");

        if (this._hasRenderableValue(queryListItemId)) {
          return queryListItemId;
        }
      } catch {
        // Ignore malformed item URLs and fall back to null.
      }
    }

    return null;
  }

  private _buildDocumentDetailsPaneUrl(item: any, baseUrl: URL): string | null {
    const itemPath = this._resolveExternalItemFieldValue(item, "Path") ?? this._resolveExternalItemFieldValue(item, "OriginalPath") ?? this._resolveExternalItemFieldValue(item, "ServerRedirectedURL");
    const selectedItemId = this._resolveDetailsListItemId(item);
    const normalizedSelectedItemId = /^\d+$/.test(String(selectedItemId ?? "")) ? String(selectedItemId) : null;

    if (!itemPath) {
      return null;
    }

    try {
      const itemUrl = new URL(itemPath, window.location.origin);
      const webServerRelativePath = baseUrl.pathname.replace(/\/$/, "");
      const itemServerRelativePath = itemUrl.pathname;

      if (!itemServerRelativePath.startsWith(`${webServerRelativePath}/`)) {
        return null;
      }

      const relativeSegments = itemServerRelativePath.slice(webServerRelativePath.length).split("/").filter(Boolean);

      if (relativeSegments.length < 2) {
        return null;
      }

      const listUrl = `${webServerRelativePath}/${relativeSegments[0]}`;
      const parentPath = itemServerRelativePath.slice(0, itemServerRelativePath.lastIndexOf("/"));
      const detailsPaneUrl = new URL(baseUrl.origin);
      detailsPaneUrl.pathname = `${webServerRelativePath}/_layouts/15/modernFrame.aspx`;
      detailsPaneUrl.searchParams.set("origin", window.location.origin);
      detailsPaneUrl.searchParams.set("parent", parentPath);
      detailsPaneUrl.searchParams.set("listUrl", listUrl);
      detailsPaneUrl.searchParams.set("scenario", "detailsPane");
      detailsPaneUrl.searchParams.set("channelId", this._getDetailsChannelId());
      detailsPaneUrl.searchParams.set("app", "OneUp");
      detailsPaneUrl.searchParams.set("component", "detailsPane");
      detailsPaneUrl.searchParams.set("isDarkMode", String(this._getDetailsIsDarkMode()));
      detailsPaneUrl.searchParams.set("options", JSON.stringify({
        itemIds: [`id=${encodeURIComponent(itemServerRelativePath)}`],
        isOD3UIEnabled: true,
        isCrossList: false,
        ...(normalizedSelectedItemId ? { selectedItemIds: [normalizedSelectedItemId] } : {}),
      }));
      detailsPaneUrl.searchParams.set("hidePreview", "1");
      detailsPaneUrl.searchParams.set("disableAutoScroll", "1");

      return detailsPaneUrl.toString();
    } catch {
      return null;
    }
  }

  private _buildDocumentViewerUrl(item: any, baseUrl: URL): string | null {
    const autoPreviewUrl = this._resolveExternalItemFieldValue(item, "AutoPreviewUrl");

    if (autoPreviewUrl) {
      try {
        return new URL(autoPreviewUrl, window.location.origin).toString();
      } catch {
        // Fall back to a sourcedoc-based viewer URL.
      }
    }

    const documentUniqueId = this._resolveExternalItemFieldValue(item, "UniqueID") ?? this._resolveExternalItemFieldValue(item, "NormUniqueID");

    const normalizedDocumentGuid = documentUniqueId ? this._tryNormalizeDetailsGuid(String(documentUniqueId)) : null;

    if (!normalizedDocumentGuid) {
      return null;
    }

    try {
      const viewerUrl = new URL(baseUrl.origin);
      viewerUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/_layouts/15/viewer.aspx`;
      viewerUrl.searchParams.set("sourcedoc", `{${normalizedDocumentGuid}}`);

      return viewerUrl.toString();
    } catch {
      return null;
    }
  }

  private _getDetailsChannelId(): string {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `pnp-modern-search-${Date.now()}`;
  }

  private _getDetailsIsDarkMode(): boolean {
    const theme = (this.props.themeVariant as ITheme) || getTheme();

    if (theme.isInverted) {
      return true;
    }

    const backgroundColor = theme.semanticColors?.bodyBackground ?? theme.semanticColors?.bodyStandoutBackground ?? theme.palette?.white;

    return this._isDarkColor(backgroundColor);
  }

  private _isDarkColor(colorValue?: string): boolean {
    if (!colorValue) {
      return false;
    }

    const normalizedColorValue = colorValue.trim();
    const hexMatch = HEX_COLOR_REGEXP.exec(normalizedColorValue);

    if (hexMatch) {
      const hex = hexMatch[1];
      const expandedHex = hex.length === 3 ? hex.split("").map((value) => `${value}${value}`).join("") : hex;
      const red = Number.parseInt(expandedHex.slice(0, 2), 16);
      const green = Number.parseInt(expandedHex.slice(2, 4), 16);
      const blue = Number.parseInt(expandedHex.slice(4, 6), 16);

      return this._getRelativeLuminance(red, green, blue) < 0.5;
    }

    const rgbMatch = RGB_COLOR_REGEXP.exec(normalizedColorValue);

    if (rgbMatch) {
      const red = Number.parseInt(rgbMatch[1], 10);
      const green = Number.parseInt(rgbMatch[2], 10);
      const blue = Number.parseInt(rgbMatch[3], 10);

      return this._getRelativeLuminance(red, green, blue) < 0.5;
    }

    return false;
  }

  private _getRelativeLuminance(red: number, green: number, blue: number): number {
    return ((0.299 * red) + (0.587 * green) + (0.114 * blue)) / 255;
  }

  private _normalizeDetailsPaneUrl(rawUrl: string): string {
    const detailsPaneUrl = new URL(rawUrl, window.location.origin);
    detailsPaneUrl.searchParams.set("isDarkMode", String(this._getDetailsIsDarkMode()));
    return detailsPaneUrl.toString();
  }

  private _isDetailsListItem(item: any, listItemId: any): boolean {
    const contentClass = String(ObjectHelper.byPath(item, BuiltinTemplateSlots.ContentClass) ?? "").toLowerCase();
    const itemPath = this._resolveExternalItemFieldValue(item, "Path") ?? this._resolveExternalItemFieldValue(item, "OriginalPath") ?? this._resolveExternalItemFieldValue(item, "AutoPreviewUrl");
    const normalizedItemPath = typeof itemPath === "string" ? itemPath.toLowerCase() : "";

    if (contentClass === "sts_list_documentlibrary" || /\/allitems\.aspx(?:$|\?)/i.test(normalizedItemPath)) {
      return false;
    }

    const isListItemContentClass = contentClass.includes("listitem");
    const isListItemFormPath = /\/(dispform|editform|newform)\.aspx(?:$|\?)/i.test(normalizedItemPath);

    if (!isListItemContentClass && !isListItemFormPath) {
      return false;
    }

    return /^\d+$/.test(String(listItemId ?? ""));
  }

  private _isDetailsDocumentItem(item: any): boolean {
    const isContainer = this.props.isContainerField ? ObjectHelper.byPath(item, this.props.isContainerField) : this._resolveExternalItemFieldValue(item, "IsContainer");

    if (isContainer === true || String(isContainer).toLowerCase() === "true") {
      return false;
    }

    const contentClass = String(ObjectHelper.byPath(item, BuiltinTemplateSlots.ContentClass) ?? "").toLowerCase();

    if (contentClass.startsWith("sts_list_") && !contentClass.includes("listitem")) {
      return false;
    }

    if (contentClass === "sts_list_documentlibrary") {
      return false;
    }

    if (contentClass.includes("document")) {
      return true;
    }

    const fileExtension = this.props.fileExtensionField ? ObjectHelper.byPath(item, this.props.fileExtensionField) : this._resolveExternalItemFieldValue(item, "FileExtension");

    if (this._hasRenderableValue(fileExtension)) {
      return true;
    }

    const fileName = this._resolveExternalItemFieldValue(item, "Filename") ?? this._resolveExternalItemFieldValue(item, "Path");

    if (typeof fileName === "string" && /\/(forms\/allitems|lists\/[^/]+\/(allitems|dispform|editform|newform))\.aspx(?:$|\?)/i.test(fileName)) {
      return false;
    }

    return typeof fileName === "string" && /\.[^./\\]+$/.test(fileName);
  }

  private _getDetailsItemTitle(item: any): string {
    return this._resolveExternalItemFieldValue(item, "Title") ?? this._resolveExternalItemFieldValue(item, "Filename") ?? strings.Layouts.DetailsList.DetailsPanelHeader;
  }

  private _normalizeDetailsGuid(value: string): string {
    return String(value).replace(/[{}]/g, "");
  }

  private _tryNormalizeDetailsGuid(value: string): string | null {
    const normalizedGuid = this._normalizeDetailsGuid(value);

    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(normalizedGuid)
      ? normalizedGuid
      : null;
  }

  private _resolveExternalItemFieldValue(item: any, fieldName: string): any {
    return ObjectHelper.byPath(item, `resource.fields.${fieldName}`)
      ?? ObjectHelper.byPath(item, `resource.properties.${fieldName}`)
      ?? ObjectHelper.byPath(item, `resource.${fieldName}`)
      ?? ObjectHelper.byPath(item, fieldName);
  }

  private _hasRenderableValue(value: any): boolean {
    return value !== undefined && value !== null && value !== "";
  }
}

export class DetailsSelectedItemButtonWebComponent extends BaseWebComponent {
  public static get observedAttributes(): string[] {
    return [
      "data-items",
      "data-context",
      "data-theme-variant",
      "data-file-extension-field",
      "data-is-container-field",
      "data-allow-multi",
    ];
  }

  public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue || !this.isConnected) {
      return;
    }

    this.renderComponent();
  }

  public connectedCallback() {
    this.renderComponent();
  }

  private renderComponent(): void {
    const props = this.resolveAttributes();
    props.hostElement = this;
    props.selectedItemsEditService = this._serviceScope.consume(SelectedItemsEditService.ServiceKey);
    props.taxonomyService = this._serviceScope.consume(TaxonomyService.ServiceKey);
    const pageContext = this._serviceScope.consume(PageContext.serviceKey);
    props.webPartContext = {
      pageContext,
      spHttpClient: this._serviceScope.consume(SPHttpClient.serviceKey),
    };
    props.webAbsoluteUrl = pageContext?.web?.absoluteUrl;
    props.siteAbsoluteUrl = pageContext?.site?.absoluteUrl;
    ReactDOM.render(<DetailsSelectedItemButtonComponent {...props} />, this);
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this);
  }
}