import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as strings from 'CommonStrings';

const DISAMBIGUATION = "pnp-modern-search";

export const loadMsGraphToolkit = async (context: WebPartContext) => {
    // Load Microsoft Graph Toolkit dynamically
    const { customElementHelper } = await import(
      /* webpackChunkName: 'microsoft-graph-toolkit' */
      '@microsoft/mgt-element/dist/es6/components/customElementHelper'
    );

    customElementHelper.withDisambiguation(DISAMBIGUATION);

    const component = window.customElements.get(`${customElementHelper.prefix}-person`);
    if (!component) {
        const { Providers } = await import(
          /* webpackChunkName: 'microsoft-graph-toolkit' */
          '@microsoft/mgt-element/dist/es6/providers/Providers'
        );

        const { registerMgtComponents } = await import(
          /* webpackChunkName: 'microsoft-graph-toolkit' */
          '@microsoft/mgt-components/dist/es6/registerMgtComponents'
        );

        if (!Providers.globalProvider) {
            const { SharePointProvider } = await import(
                /* webpackChunkName: 'microsoft-graph-toolkit' */
                '@microsoft/mgt-sharepoint-provider/dist/es6'
            );

            Providers.globalProvider = new SharePointProvider(context);
        }
        registerMgtComponents();
    }

    const { LocalizationHelper } = await import(
      /* webpackChunkName: 'microsoft-graph-toolkit' */
      '@microsoft/mgt-element/dist/es6/utils/LocalizationHelper'
    );

    LocalizationHelper.strings = {
      _components: {
        "pnp-modern-search-person-card": {
          sendEmailLinkSubtitle: strings.Layouts.PersonCard.SendEmailLinkSubtitle,
          startChatLinkSubtitle: strings.Layouts.PersonCard.StartChatLinkSubtitle,
          showMoreSectionButton: strings.Layouts.PersonCard.ShowMoreSectionButton,
          endOfCard: strings.Layouts.PersonCard.EndOfCard,
          quickMessage: strings.Layouts.PersonCard.QuickMessage,
          expandDetailsLabel: strings.Layouts.PersonCard.ExpandDetailsLabel,
          sendMessageLabel: strings.Layouts.PersonCard.SendMessageLabel,
          emailButtonLabel: strings.Layouts.PersonCard.EmailButtonLabel,
          callButtonLabel: strings.Layouts.PersonCard.CallButtonLabel,
          chatButtonLabel: strings.Layouts.PersonCard.ChatButtonLabel,
          closeCardLabel: strings.Layouts.PersonCard.CloseCardLabel,
          videoButtonLabel: strings.Layouts.PersonCard.VideoButtonLabel,
          goBackLabel: strings.Layouts.PersonCard.GoBackLabel
        
        },
        "pnp-modern-search-contact": {
          contactSectionTitle: strings.Layouts.PersonCard.ContactSectionTitle,
          emailTitle: strings.Layouts.PersonCard.EmailTitle,
          chatTitle: strings.Layouts.PersonCard.ChatTitle,
          businessPhoneTitle: strings.Layouts.PersonCard.BusinessPhoneTitle,
          cellPhoneTitle: strings.Layouts.PersonCard.CellPhoneTitle,
          departmentTitle: strings.Layouts.PersonCard.DepartmentTitle,
          personTitle: strings.Layouts.PersonCard.PersonTitle,
          officeLocationTitle: strings.Layouts.PersonCard.OfficeLocationTitle,
          copyToClipboardButton: strings.Layouts.PersonCard.CopyToClipboardButton
        },
        "pnp-modern-search-organization": {
          reportsToSectionTitle: strings.Layouts.PersonCard.ReportsToSectionTitle,
          directReportsSectionTitle: strings.Layouts.PersonCard.DirectReportsSectionTitle,
          organizationSectionTitle: strings.Layouts.PersonCard.OrganizationSectionTitle,
          youWorkWithSubSectionTitle: strings.Layouts.PersonCard.YouWorkWithSubSectionTitle,
          userWorksWithSubSectionTitle: strings.Layouts.PersonCard.UserWorksWithSubSectionTitle
        },
        "pnp-modern-search-messages": {
          emailsSectionTitle: strings.Layouts.PersonCard.EmailsSectionTitle,
          contactSectionTitle: strings.Layouts.PersonCard.ContactSectionTitle,
          emailTitle: strings.Layouts.PersonCard.EmailTitle,
          chatTitle: strings.Layouts.PersonCard.ChatTitle,
          businessPhoneTitle: strings.Layouts.PersonCard.BusinessPhoneTitle,
          cellPhoneTitle: strings.Layouts.PersonCard.CellPhoneTitle,
          departmentTitle: strings.Layouts.PersonCard.DepartmentTitle,
          personTitle: strings.Layouts.PersonCard.PersonTitle,
          officeLocationTitle: strings.Layouts.PersonCard.OfficeLocationTitle,
          copyToClipboardButton: strings.Layouts.PersonCard.CopyToClipboardButton
        },
        "pnp-modern-search-file-list": {
          filesSectionTitle: strings.Layouts.PersonCard.FilesSectionTitle,
          sharedTextSubtitle: strings.Layouts.PersonCard.SharedTextSubtitle,
          showMoreSubtitle: strings.Layouts.PersonCard.ShowMoreSubtitle,
        },
        "pnp-modern-search-profile": {
          SkillsAndExperienceSectionTitle: strings.Layouts.PersonCard.SkillsAndExperienceSectionTitle,
          AboutCompactSectionTitle: strings.Layouts.PersonCard.AboutCompactSectionTitle,
          SkillsSubSectionTitle: strings.Layouts.PersonCard.SkillsSubSectionTitle,
          LanguagesSubSectionTitle: strings.Layouts.PersonCard.LanguagesSubSectionTitle,
          WorkExperienceSubSectionTitle: strings.Layouts.PersonCard.WorkExperienceSubSectionTitle,
          EducationSubSectionTitle: strings.Layouts.PersonCard.EducationSubSectionTitle,
          professionalInterestsSubSectionTitle: strings.Layouts.PersonCard.ProfessionalInterestsSubSectionTitle,
          personalInterestsSubSectionTitle: strings.Layouts.PersonCard.PersonalInterestsSubSectionTitle,
          birthdaySubSectionTitle: strings.Layouts.PersonCard.BirthdaySubSectionTitle,
          currentYearSubtitle: strings.Layouts.PersonCard.CurrentYearSubtitle,
          socialMediaSubSectionTitle: strings.Layouts.PersonCard.SocialMediaSubSectionTitle
        }
      }
    };

}