# Connections

The 'Search Results' Web Part can be used alone but also connected to other Web Parts:

!["Available connections"](../../../assets/webparts/search-results/connections/available_connections.png){: .center}

## Input query text

The input query text can be either static or dynamic. In all cases, this value can be used using the `{inputQueryText}` token. See [tokens](../tokens.md) for more information.

**Static value**

It corresponds to a free text keywords that you want to pass to your data source:

!["Static value"](../../../assets/webparts/search-results/connections/input_text_static.png){: .center}

This value will be applied **every time** to your data source.

**Dynamic value**

You can connect a dynamic value from the page environment (ex: a query string parameter, the top bar search box, etc.) or a search box already added to the page.

!["Dynamic value"](../../../assets/webparts/search-results/connections/input_text_dynamic.png){: .center}

Optionaly, you can set a default query text **when there is no value for the connected source** (ex: an empty search box at page load). 

## Filters Web Part

!["Filters"](../../../assets/webparts/search-results/connections/filters.png){: .center}

## Verticals

!["Verticals"](../../../assets/webparts/search-results/connections/verticals.png){: .center}

When you connect the Web Part to a Verticals one, you must specify on which vertical the Web Part content should be displayed.

!["Select vertical"](../../../assets/webparts/search-results/connections/select_vertical.png){: .center}

This mechanism allows to build a complete search center using verticals tabs. 