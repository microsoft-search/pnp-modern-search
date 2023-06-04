declare interface ICommonStrings {
    Tokens: {
      SelectTokenLabel: string;
      Context: {
        ContextTokensGroupName: string;
        SiteAbsoluteUrl: string;
        SiteRelativeUrl: string;
        WebAbsoluteUrl: string;
        WebRelativeUrl: string;
        WebTitle: string;
        InputQueryText: string;
      },
      Custom: {
        CustomTokensGroupName: string;
        CustomValuePlaceholder: string;
        InvalidtokenFormatErrorMessage: string;
      },
      Date: {
        DateTokensGroupName: string;
        Today: string;
        Yesterday: string;
        Tomorrow: string;
        OneWeekAgo: string;
        OneMonthAgo: string;
        OneYearAgo: string;
      },
      Page: {
        PageTokensGroupName: string;
        PageId: string;
        PageTitle: string;
        PageCustom: string;
      },
      User: {
        UserTokensGroupName: string;
        UserName: string;
        Me: string;
        UserDepartment: string;
        UserCustom: string;
      }
    },
    General:{
      Version: string;
      InstanceId: string;
      About: string;
      Authors: string;
      Resources: {
        GroupName: string;
        Documentation: string;
        PleaseReferToDocumentationMessage: string;
      },
      Extensibility: {
        InvalidDataSourceInstance: string;
        DataSourceDefinitionNotFound: string;
        LayoutDefinitionNotFound: string;
        ProviderDefinitionNotFound: string;
		QueryModifierDefinitionNotFound: string;
        InvalidProviderInstance: string;
        InvalidLayoutInstance: string;
		InvalidQueryModifierInstance: string;
        DefaultExtensibilityLibraryName: string;
      },
      OnTextLabel: string;
      OffTextLabel: string;
      StaticArrayFieldName: string;
      DateFromLabel: string;
      DateTolabel: string;
      DatePickerStrings: {
          months: string[],
          shortMonths: string[],
          days: string[],
          shortDays: string[],
          goToToday: string,
          prevMonthAriaLabel: string,
          nextMonthAriaLabel: string,
          prevYearAriaLabel: string,
          nextYearAriaLabel: string,
          closeButtonAriaLabel: string,
          isRequiredErrorMessage: string,
          invalidInputErrorMessage: string
      };
      DateIntervalStrings: {
        AnyTime: string;
        PastDay: string;
        PastWeek: string;
        PastMonth: string;
        Past3Months: string;
        PastYear: string;
        Older: string;
      }
      SameTabOpenBehavior: string;
      NewTabOpenBehavior: string;
      PageOpenBehaviorLabel: string;
      EmptyFieldErrorMessage: string;
      TagPickerStrings: {
        NoResultsSearchMessage: string;
        SearchPlaceholder: string;
      }
      CurrentVerticalNotSelectedMessage: string;
    },
    DataSources: {
      SharePointSearch: {
        SourceName: string;
        SourceConfigurationGroupName: string;
        QueryTextFieldLabel: string;
        QueryTextFieldInfoMessage: string;
        QueryTemplateFieldLabel: string;
        QueryTemplatePlaceHolderText: string;
        QueryTemplateFieldDescription: string;
        ResultSourceIdLabel: string;
        ResultSourceIdDescription: string;
        InvalidResultSourceIdMessage: string;
        EnableQueryRulesLabel: string;
        TrimDuplicates: string;
        RefinementFilters: string;
        RefinementFiltersDescription: string;
        EnableLocalizationLabel: string;
        EnableLocalizationOnLabel: string;
        EnableLocalizationOffLabel: string;
        QueryCultureLabel: string;
        QueryCultureUseUiLanguageLabel: string;
        SelectedPropertiesFieldLabel: string;
        SelectedPropertiesFieldDescription: string;
        SelectedPropertiesPlaceholderLabel: string;
        HitHighlightedPropertiesFieldLabel: string;
        HitHighlightedPropertiesFieldDescription: string;
        TermNotFound: string;
        ApplyQueryTemplateBtnText: string;
        EnableAudienceTargetingTglLabel: string;
        CollapseSpecificationLabel: string;
      },
      MicrosoftSearch: {
        QueryTextFieldLabel: string;
        QueryTextFieldInfoMessage: string;
        SourceName: string;
        SourceConfigurationGroupName: string;
        EntityTypesField: string;
        SelectedFieldsPropertiesFieldLabel: string;
        SelectedFieldsPropertiesFieldDescription: string;
        SelectedFieldsPlaceholderLabel: string;
        ContentSourcesFieldLabel: string;
        ContentSourcesFieldDescriptionLabel: string;
        ContentSourcesFieldPlaceholderLabel: string;
        EnableTopResultsLabel: string;
        EnableSuggestionLabel: string;
        EnableModificationLabel: string;
        QueryTemplateFieldLabel: string;
        QueryTemplatePlaceHolderText: string;
        QueryTemplateFieldDescription: string;
        ApplyQueryTemplateBtnText: string;
        UseBetaEndpoint: string;
        TrimDuplicates: string;
        CollapseProperties: {
          EditCollapsePropertiesLabel: string;
          CollapsePropertiesDescription: string;
          CollapsePropertiesPropertyPaneFieldLabel: string;
          CollapseLimitFieldLabel: string;
          CollapsePropertiesFieldColumnPlaceholder: string;
        }
      },
      SearchCommon: {
        Sort: {
          SortPropertyPaneFieldLabel
          SortListDescription: string;
          SortDirectionAscendingLabel:string;
          SortDirectionDescendingLabel:string;
          SortErrorMessage:string;
          SortPanelSortFieldLabel:string;
          SortPanelSortFieldAria:string;
          SortPanelSortFieldPlaceHolder:string;
          SortPanelSortDirectionLabel:string;
          SortDirectionColumnLabel: string;
          SortFieldColumnLabel: string;
          SortFieldDefaultSortLabel: string;
          SortFieldUserSortLabel: string;
          SortFieldFriendlyNameLabel: string;
          EditSortLabel: string;
          SortInvalidSortableFieldMessage: string;
          SortFieldColumnPlaceholder: string;
        };
      }
    },
    Controls: {
      TextDialogButtonText: string;
      TextDialogTitle: string;
      TextDialogCancelButtonText: string;
      TextDialogSaveButtonText: string;
      SelectItemComboPlaceHolder: string;
      AddStaticDataLabel: string;
      TextFieldApplyButtonText: string;
      SortByPlaceholderText: string;
      SortByDefaultOptionText: string;
    },
    Layouts: {
      Debug: {
        Name: string;
      };
      CustomHandlebars: {
        Name: string;
      };
      CustomAdaptiveCards: {
        Name: string;
      },
      SimpleList: {
        Name: string;
        ShowFileIconLabel: string;
        ShowItemThumbnailLabel: string;
      }
      DetailsList: {
        Name: string;
        UseHandlebarsExpressionLabel: string;
        MinimumWidthColumnLabel: string;
        MaximumWidthColumnLabel: string;
        SortableColumnLabel: string;
        ResizableColumnLabel: string;
        MultilineColumnLabel: string;
        LinkToItemColumnLabel: string;
        ShowFileIcon: string;
        CompactModeLabel: string;
        ManageDetailsListColumnLabel: string;
        ManageDetailsListColumnDescription: string;
        DisplayNameColumnLabel: string;
        ValueColumnLabel: string;
        ValueSortingColumnLabel: string;
        ValueSortingColumnNoFieldsLabel: string;
        FileExtensionFieldLabel: string;
        GroupByFieldLabel: string;
        GroupingDescription: string;
        EnableGrouping: string;
        CollapsedGroupsByDefault: string;
        ResetFieldsBtnLabel: string;
      };
      Cards: {
        Name: string;
        ManageTilesFieldsLabel: string;
        ManageTilesFieldsPanelDescriptionLabel: string;
        PlaceholderNameFieldLabel: string;
        SupportHTMLColumnLabel: string;
        PlaceholderValueFieldLabel: string;
        UseHandlebarsExpressionLabel: string;
        EnableItemPreview: string;
        EnableItemPreviewHoverMessage: string;
        ShowFileIcon: string;
        CompactModeLabel: string;
        PreferedCardNumberPerRow: string;
        Fields: {
          Title: string;
          Location: string;
          Tags: string;
          PreviewImage: string;
          PreviewUrl: string;
          Url: string;
          Date: string;
          Author: string;
          ProfileImage: string;
          FileExtension: string;
          IsContainer: string;
        },
        ResetFieldsBtnLabel: string;
      };
      Slider: {
        Name: string;
        SliderAutoPlay: string;
        SliderAutoPlayDuration: string;
        SliderPauseAutoPlayOnHover: string;
        SliderGroupCells: string;
        SliderShowPageDots: string;
        SliderWrapAround: string;
        SlideWidth: string;
        SlideHeight: string;
      };
      People: {
        Name: string;
        ManagePeopleFieldsLabel: string;
        ManagePeopleFieldsPanelDescriptionLabel: string;
        PlaceholderNameFieldLabel: string;
        PlaceholderValueFieldLabel: string;
        UseHandlebarsExpressionLabel: string;
        PersonaSizeOptionsLabel: string,
        PersonaSizeExtraSmall: string;
        PersonaSizeSmall: string;
        PersonaSizeRegular: string;
        PersonaSizeLarge: string;
        PersonaSizeExtraLarge: string;
        ShowInitialsToggleLabel: string;
        SupportHTMLColumnLabel: string;
        ResetFieldsBtnLabel: string;
        ShowPersonaCardOnHover: string;
        ShowPersonaCardOnHoverCalloutMsg: string;
        Fields: {
          ImageUrl: string;
          PrimaryText: string;
          SecondaryText: string;
          TertiaryText: string;
          OptionalText: string;
        }
      };
      Vertical: {
        Name: string;
      },
      Horizontal: {
        Name: string;
        PreferedFilterNumberPerRow: string;
      },
      Panel: {
        Name: string;
        IsModal: string;
        IsLightDismiss: string;
        Size: string;
        ButtonLabel: string;
        ButtonLabelFieldName: string;
        HeaderText: string;
        HeaderTextFieldName: string;
        SizeOptions: {
          SmallFixedFar: string;
          SmallFixedNear: string;
          Medium: string;
          Large: string;
          LargeFixed: string;
          ExtraLarge: string;
          SmallFluid: string;
        }
      }
    },
    HandlebarsHelpers: {
      CountMessageLong: string;
      CountMessageShort: string;
    },
    PropertyPane: {
      ConnectionsPage: {
        DataConnectionsGroupName: string;
        UseDataVerticalsWebPartLabel: string;
        UseDataVerticalsFromComponentLabel: string;
      },
      InformationPage: {
        Extensibility: {
          GroupName: string;
          FieldLabel: string;
          ManageBtnLabel: string;
          Columns: {
            Name: string;
            Id: string;
            Enabled: string;
          }
        },
        ImportExport: string;
      }
    },
    Filters: {
      ApplyAllFiltersButtonLabel: string;
      ClearAllFiltersButtonLabel: string;
      FilterNoValuesMessage: string;
      OrOperator: string;
      AndOperator: string;
      ComboBoxPlaceHolder: string;
      UseAndOperatorValues: string;
      UseOrOperatorValues: string;
      UseValuesOperators: string;
    },
    SuggestionProviders: {
      SharePointStatic: {
        ProviderName: string;
        ProviderDescription: string;
      }
    }
}

declare module 'CommonStrings' {
  const strings: ICommonStrings;
  export = strings;
}
