import * as React from "react";
import * as ReactDOM from "react-dom";
import { BaseWebComponent, BuiltinTemplateSlots } from "@pnp/modern-search-extensibility";
import { ActionButton, IIconProps, ITheme, getTheme, Panel, PanelType, IconButton, Spinner, SpinnerSize } from "@fluentui/react";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { ISearchResultsTemplateContext } from "../models/common/ITemplateContext";
import { ObjectHelper } from "../helpers/ObjectHelper";
import * as strings from "CommonStrings";

const MIN_DETAILS_PANEL_HEIGHT = 520;
const DETAILS_PANEL_RIGHT_OFFSET = 32;
const HEX_COLOR_REGEXP = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_COLOR_REGEXP = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i;

interface IDetailsSelectedItemButtonProps {
  context?: ISearchResultsTemplateContext;
  items?: { [key: string]: any }[];
  themeVariant?: IReadonlyTheme;
  fileExtensionField?: string;
  isContainerField?: string;
  allowMulti?: boolean;
}

interface IDetailsSelectedItemButtonState {
  activeDetailsFormUrl?: string;
  activeDetailsItemTitle?: string;
  isDetailsFrameReady?: boolean;
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

  constructor(props: IDetailsSelectedItemButtonProps) {
    super(props);

    this.state = {
      activeDetailsFormUrl: null,
      activeDetailsItemTitle: null,
      isDetailsFrameReady: false,
    };
  }

  public componentDidMount(): void {
    window.addEventListener("resize", this._refreshDetailsPanelLayout);
    window.addEventListener("scroll", this._refreshDetailsPanelLayout, { capture: true, passive: true });
    this._updateSelectedItems();
    this._restoreDetailsPanelIfNeeded();
  }

  public componentDidUpdate(prevProps: IDetailsSelectedItemButtonProps): void {
    if (prevProps.context?.selectedKeys !== this.props.context?.selectedKeys || prevProps.items !== this.props.items) {
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
    const detailsFormUrl = selectedItem ? this._buildDetailsFormUrl(selectedItem) : null;
    const shouldRenderButton = this._selectedItems.length > 0 && (isMultiSelectEnabled || !!detailsFormUrl);
    const isButtonDisabled = isMultiSelectEnabled || !selectedItem || !detailsFormUrl;

    return (
      <>
        {shouldRenderButton && (
          <ActionButton
            text={strings.Layouts.DetailsList.DetailsButtonLabel}
            iconProps={detailsIcon}
            disabled={isButtonDisabled}
            onClick={(event) => this._openDetailsPanel(event, selectedItem)}
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

  private _syncOpenPanelWithSelection(): void {
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

    if (!detailsPanelSessionState.isOpen || this.state.activeDetailsFormUrl) {
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

    return (
      <Panel
        isOpen={!!activeDetailsFormUrl}
        isBlocking={false}
        type={PanelType.custom}
        customWidth="320px"
        onDismiss={this._closeDetailsPanel}
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
          ariaLabel={strings.Layouts.PersonCard.CloseCardLabel}
          iconProps={{ iconName: "Cancel" }}
          onClick={this._closeDetailsPanel}
          styles={{ root: { backgroundColor: panelBackgroundColor, color: panelTextColor } }}
        />
      </div>
    );
  };

  private readonly _renderDetailsPanelBody = (): JSX.Element => {
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
    if (!this._getResolvedDetailsFormUrl() || this._detailsLayoutAnimationFrame !== null) {
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

  private readonly _openDetailsPanel = (event: React.MouseEvent<any>, item: any): void => {
    event.preventDefault();
    event.stopPropagation();

    const detailsFormUrl = this._buildDetailsFormUrl(item);
    const detailsPanelSessionState = this._getDetailsPanelSessionState();

    if (!detailsFormUrl) {
      return;
    }

    detailsPanelSessionState.isOpen = true;
    detailsPanelSessionState.activeDetailsFormUrl = detailsFormUrl;
    detailsPanelSessionState.activeDetailsItemTitle = this._getDetailsItemTitle(item);

    this.setState({
      activeDetailsFormUrl: detailsFormUrl,
      activeDetailsItemTitle: this._getDetailsItemTitle(item),
      isDetailsFrameReady: false,
    });
  };

  private readonly _closeDetailsPanel = (): void => {
    const detailsPanelSessionState = this._getDetailsPanelSessionState();

    detailsPanelSessionState.isOpen = false;
    detailsPanelSessionState.activeDetailsFormUrl = null;
    detailsPanelSessionState.activeDetailsItemTitle = null;

    this.setState({
      activeDetailsFormUrl: null,
      activeDetailsItemTitle: null,
      isDetailsFrameReady: false,
    });
  };

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

    const documentUniqueId = this._resolveExternalItemFieldValue(item, "UniqueID") ?? this._resolveExternalItemFieldValue(item, "NormUniqueID") ?? this._resolveExternalItemFieldValue(item, "IdentityListItemId") ?? this._resolveExternalItemFieldValue(item, "ListItemID") ?? this._resolveExternalItemFieldValue(item, "Id");

    if (!documentUniqueId) {
      return null;
    }

    try {
      const viewerUrl = new URL(baseUrl.origin);
      viewerUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/_layouts/15/viewer.aspx`;
      viewerUrl.searchParams.set("sourcedoc", `{${this._normalizeDetailsGuid(String(documentUniqueId))}}`);

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
  public connectedCallback() {
    const props = this.resolveAttributes();
    ReactDOM.render(<DetailsSelectedItemButtonComponent {...props} />, this);
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this);
  }
}