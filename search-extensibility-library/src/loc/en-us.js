define([], function() {
  return {
    "Library": {
      "Name"        : "Search Extensibility Reference Library",
      "Description" : "Reference library demonstrates common examples for developing third party extensions."
    },
    "Extensions" : {
      "HandlebarsHelper": {
        "Custom": {
          "DisplayName": "Log",
          "Description": "Logs the input to the console: {{log 'value'}}"
        },
        "Switch": {
          "DisplayName": "Switch",
          "Description": "Switch statement start tag helper: {{switch 'value'}}"
        },
        "Case": {
          "DisplayName": "Switch Case",
          "Description": "Switch case statement helper: {{case 'value'}}"
        },
        "Default": {
          "DisplayName": "Switch Default",
          "Description": "Switch default statement helper: {{default 'value'}}"
        }
      },
      "QueryModifier": {
        "Custom" : {
          "DisplayName": "Sample Query Modifier",
          "Description": "Adds a filter to the query so that only word documents are returned."
        }
      },
      "Suggestion" : {
        "SharePoint":{
          "GroupName": "Others have search for",
          "DisplayName": "SharePoint Query Suggestions",
          "Description": "Default SharePoint query suggestions."
        },
        "Custom": {
          "DisplayName": "SharePoint Patterns and Practices Suggestion Provider",
          "Description": "An example custom suggestion provider",
          "GroupName": "Custom suggestions",
          "Zero": {
            "DisplayText": "SharePoint Patterns and Practices",
            "Description": "aka.ms/sppnp",
            "HoverText": "The SharePoint Development Community (also known as the SharePoint PnP community) is an open-source initiative coordinated by SharePoint engineering. This community controls SharePoint development documentation, samples, reusable controls, and other relevant open-source initiatives related to SharePoint development."
          },
          "ResultOne": {
            "GroupName":"SharePoint Framework",
            "DisplayText": "SPFx Training",
            "Description": "Sample Suggestion"
          },
          "ResultTwo": {
            "GroupName":"SharePoint Framework",
            "DisplayText": "SPFx Documentation",
            "Description": "Sample Suggestion"
          }
        }
      },
      "WebComponent": {
        "Custom": {
          "DisplayName": "Example Panel",
          "Description": "Example panel web component"
        },
        "Example": {
          "DisplayName": "Hyperlink",
          "Description": "Example web component with child elements coming from main template"
        }          
      }
    }
  }
});