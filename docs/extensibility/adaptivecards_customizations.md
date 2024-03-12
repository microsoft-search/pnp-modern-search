# Register Adaptive Cards Actions handlers customizations

If you want to render the search results using a custom Adaptive Card, you might also want to handle custom events upon actions happening in the Adaptive Cards instances. 

To register a new Adaptive Cards Actions handler customization for the targeted Web Part (i.e. the Web Part instances where the extensibility library is registered and enabled):

1.  In the library main entry point (i.e. the class implementing the `IExtensibilityLibrary` in interface), implement the `invokeCardAction(action: any): void` method.

2. From within the method write your own implementation of any of the custom actions that you want to handle.

```typescript
public invokeCardAction(action: any): void {

    // Process the action based on type
    if (action.type == "Action.OpenUrl") {
      window.open(action.url, "_blank");
    } else if (action.type == "Action.Submit") {
      // Process the action based on title
      switch (action.title) {
        case 'Click on item':
          console.log(action.data);
          break;
        case 'Global click':
          alert(action);
          break;
        default:
          console.log('Action not supported!');
          break;
      }
    }
}
```

3. In the JSON of the custom Adaptive Card, you can define the custom actions, like in the following code excerpt:

```json
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.3",
  "body": [
    {
      "type": "TextBlock",
      "text": "**${$root.data.totalItemsCount}** results",
      "size": "Medium",
      "wrap": true,
      "$when": "${$root.properties.showResultsCount == true}"
    },
    {
      "type": "Container",
      "$data": "${data.items}",
      "items": [
        {
          "type": "ColumnSet",
          "id": "${hitId}",
          "columns": [
            {
              "type": "Column",
              "items": [
                {
                  "type": "TextBlock",
                  "wrap": true,
                  "text": "<pnp-iconfile class='icon' data-extension='${if(empty($root.slots['FileType']),'',string(jPath($data, concat('.',$root.slots['FileType']))[0]))}'></pnp-iconfile>"
                }
              ],
              "width": "auto"
            },
            {
              "type": "Column",
              "items": [
                {
                  "type": "TextBlock",
                  "wrap": true,
                  "text": "[${string(jPath($data, concat('.',$root.slots['Title']))[0])}](${string(jPath($data, concat('.',$root.slots['Path']))[0])})"
                }
              ],
              "width": "auto"
            },
            {
              "type": "Column",
              "items": [
                {
                  "type": "ActionSet",
                  "actions": [
                    {
                      "type": "Action.Submit",
                      "title": "Click on item",
                      "style": "positive",
                      "data": {
                        "id": "123"
                      }
                    }
                  ],
                  "spacing": "medium"
                }
              ],
              "width": "auto"
            }
          ]
        }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Global click",
      "data": {
        "id": "456"
      }
    },
    {
      "type": "Action.OpenUrl",
      "title": "Open URL",
      "url": "https://pnp.github.io/"
    }
  ]
}
```
