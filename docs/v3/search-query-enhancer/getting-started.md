# Search Query Enhancer - v3
[Table of contents](../index.md)
## Summary

The search query enhancer function can be used in conjunction with the [Query Modifier feature](../../search-extensibility-library/getting-started#create-a-custom-query-modifier) to alter the query before being sent to the search results Web Part. This sample demonstrates the following principles to help you with the setup:

- Create an Azure function using TypeScript and Webpack. The original setup was reused from this [article](https://medium.com/burak-tasci/backend-development-on-azure-functions-with-typescript-56113b6be4b9) with only few adjustments.
- Connect Azure Function to an SPFx component
- Use third party back end services like Microsoft LUIS or Text Analysis to interpret a search query and enhance it with NLP services.

***In this sample, the function is secured by a function code. For production use, refer to [this article](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient-enterpriseapi) to protect and use it with Azure AD and SPFx.***

***In real world scenarios, you may want add your own intents and build your enhanced search queries accordingly. Use this sample as a starter.***

## Why LUIS instead of SharePoint search query rules?

- Easy to manage for power users .They don't have to deal with complex SharePoint concepts. With LUIS, they can manage and refine the model more easily in a friendly comprehensive interface.
- Real time monitoring. Power users can review utterances submitted by end users in the LUIS portal and what keywords are entered. They can add new terms as synonyms automatically from the utterances and identify new intentions more precisely.
- Extensible model with custom intents mapped to predefined well know SharePoint search queries.
- Able to plug in the Bing Spell checker automatically to correct mispeleld words and get a clean query

## Set up the solution

- In the [www.luis.ai](https://www.luis.ai) portal, imports new applications from the JSON files in the [/luis](../../search-query-enhancer/luis) folder.

![LUIS Apps](../images/luis_apps.png)

- In Azure, create keys for the following Microsoft Cognitive Services:
    - Language Understanding
    - Bing Spell Check v7
    - Text Analytics

![Azure Keys](../images/azure_keys.png)

- Fill the following values in the `local.settings.json` file according to your environment:

| Setting | Description
| ------- | ---------
**LUIS_SubscriptionKey** | The key value for LUIS retrieved from the Azure portal.
**LUIS_AzureRegion** | Azure region where you created the LUIS key. Ex: '_westus_'.
**Bing_SpellCheckApiKey** | The Bing Spell Check API key retrieved from the Azure portal.
**TextAnalytics_SubscriptionKey** | The key value for Text Analytics Service retrieved from the Azure portal 
**TextAnalytics_AzureRegion** | Azure region where you created the Text Analytics key. Ex: '_westus_'.

- Add keys to your LUIS applications

![LUIS Keys](../images/luis_key_manage.png)

- Train and publish the LUIS applications
- Fill LUIS app IDs in the `luismappings.json` file in the `functions/enhanceQuery/config/` folder according to your environment.
- Play with the function!

### Intents

| Intent | Description
| ------ | -----------
| **PnP.SearchByKeywords** | The default intent for the search query. Used to improve free text searches for SharePoint (90% of users queries in the portal).
| None | Needed to avoid unrelevant query such as noise words, trolling or insulting words

### Entities

| Entity | Type | Description | Recognition method |
| ------ | ---- | ----------- | ------------ |
| **[keyPhrase](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-quickstart-intent-and-key-phrase)** | Builtin | This prebuilt enity catches important keywords in the phrase. In this case, we treat these values as a "free" keyword which will be matched with all relevant SharePoint search managed properties. | Machine Learning