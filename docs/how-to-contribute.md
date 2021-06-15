# How to contribute?

You can contribute to this project at multiple levels:

- Help us with the [issues list](https://github.com/microsoft-search/pnp-modern-search/issues) by:
    - Answer questions from the community
    - Fix issues in the code
- [Improve documentation](./build-the-doc.md) by:
    - Correcting typos
    - Clarify configuration and examples
    - Add business scenario tutorials
- Add new reusable [components](./extensibility/custom_web_component.md) or [suggestions providers](./extensibility/custom_suggestions_provider.md) to the extensibility library.
- Add Web Part translations

As a result, we accept pull requests from the community. You can refer to [this post](https://tahoeninjas.blog/2019/08/18/my-github-cheat-sheet-for-pnp-contributions-an-interactive-cheat-sheet/) by Hugo Bernier to know how make a PR on a GitHub repository.

!!! note
    Your PR must target the `develop` branch.

!!! important
    
    **Your PR will be automatically rejected if**

    - It alters too much the core architecture of the solution or the amount of code is to important to be reviewed properly.
    - You don't provide any detailled steps to test it.
    - It contains a new feature that was not discussed previously with the maintainers.

# Setting up the solution locally 

Before making any PR, you need to setup this project locally on your machine. This solution is composed of three distinct parts:

| Project | Description
| --------| ----------
| `search-parts` | SPFx Web Parts code
| `search-extensibility` | SPFx library component containing shared code between core Web Parts and extensibilty library.
| `search-extensibility-demo`  | Reusable components to extend capabilities of core Web Parts https://github.com/microsoft-search/pnp-modern-search-extensibility-samples.

## Setup the **search-extensibility** project

!!! note
    By default, the `search-parts` and `search-extensibility-demo` projects use the npm reference [`@pnp/modern-search-extensibility`](https://www.npmjs.com/package/@pnp/modern-search-extensibility){:target="_blank"}.
    
    Follow these steps only if you intend to perform some changes on the `search-extensibility` project.

!!! important
    Because this project is published as an npm reference, any change is critical.
    
    Please do not commit changes if you are not sure about what you are doing.

The `search-extensibilty` project is an SPFx library component containing all the shared interfaces for the `search-parts` and `search-extensibility-demo` other SPFx projects. As a result, **a symbolic link must be build to these projects first before it can be used**:

1. Open the `search-extensibility` project and install dependencies using `npm i` or your favorite package manager.
2. Build the project using the command `npm run build` or `gulp bundle`.
3. Run the command `npm link` to create a symbolic link.

You can also refer to the official [SPFx documentation about library component usage](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/library-component-tutorial).

> _A symbolic link is a shortcut that points to another directory or another project (in this case) on your system_

## Setup the **search-parts** and **search-extensibility-demo** projects

1. From the `search-parts` or `search-extensibility-demo` project, run `npm i`.
2. Build the project using `npm run build` or `gulp bundle`.

!!! note
    If you made local changes on the `search-extensibility` project, after each `npm i`, you must link your local `search-extensibility` project using the command `npm link @pnp/modern-search-extensibility`

## Debug the solution

- From Visual Studio Code console or any other console, from the `search-parts` folder, use the `npm run serve` command to start the server. We use [SPFx Fast Serve Tool](https://github.com/s-KaiNet/spfx-fast-serve) from Sergei Sergeev to speed up development process.
- From Visual Studio Code, use the 'Hosted Workbench' debug configuration with your URL to debug the Web Parts. Any changes to the code will trigger a new build and refresh your page automatically within seconds.
