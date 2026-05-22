# PnP Modern Search extensibility library - Compatibility matrix

When developing a new extensibility library for the PnP Modern Search solution, your SPFx library project must use the same SPFx version as the main solution.
The following table lists the SPFx version used by each PnP Modern Search release, helping you determine the appropriate version for your extensibility project.

!!! note "Extensibility package v2.0.0+"
    Starting with `@pnp/modern-search-extensibility` v2.0.0, the npm package itself has **zero SPFx runtime dependencies** and uses its own semver versioning (decoupled from SPFx). However, your extensibility library project still needs to target the same SPFx version as the web part solution because the SPFx build tooling embeds version-specific framework references in the component manifest.

| PnP Modern Search Release | Release Date       | SPFx Version used | Extensibility Package | Toolchain |
|----------------------------|--------------------|--------------------|----------------------|-----------|
| 4.23.0                     | _upcoming_         | 1.22.2             | 2.0.0                | Heft      |
| 4.22.0                     | May 2026          | 1.22.2             | 1.22.3               | Heft      |
| 4.21.0                     | April 2026        | 1.22.2             | 1.22.3               | Heft      |
| 4.16.0                     | February 2025     | 1.20.0             | 1.20.0               | Gulp      |
| 4.15.0                     | January 2025      | 1.20.0             | 1.20.0               | Gulp      |
| 4.14.0                     | November 2024     | 1.18.2             | 1.18.2               | Gulp      |
| 4.13.1                     | September 2024    | 1.18.2             | 1.18.2               | Gulp      |
| 4.12.2                     | June 2024         | 1.18.2             | 1.18.2               | Gulp      |
| 4.12.1                     | June 2024         | 1.18.2             | 1.18.2               | Gulp      |
| 4.11.1                     | April 2024        | 1.18.2             | 1.18.2               | Gulp      |
| 4.11.0                     | March 2024        | 1.18.2             | 1.18.2               | Gulp      |
| 4.10.2                     | February 2024     | 1.18.2             | 1.18.2               | Gulp      |
| 4.10.1                     | December 2023     | 1.18.2             | 1.18.2               | Gulp      |
| 4.9.3                      | August 2023       | 1.15.2             | 1.15.2               | Gulp      |
| 4.9.2                      | August 2023       | 1.15.2             | 1.15.2               | Gulp      |
| 4.9.1                      | July 2023         | 1.15.2             | 1.15.2               | Gulp      |
| 4.9.0                      | June 2023         | 1.15.2             | 1.15.2               | Gulp      |
| 4.8.0                      | November 2022     | 1.15.2             | 1.15.2               | Gulp      |
| 4.7.0                      | June 2022         | 1.14.0             | 1.14.0               | Gulp      |
| 4.6.1                      | April 2022        | 1.12.1             | 1.12.1               | Gulp      |
| 4.5.4                      | February 2022     | 1.12.1             | 1.12.1               | Gulp      |
| 4.5.3                      | December 2021     | 1.12.1             | 1.12.1               | Gulp      |
| 3.23.0                     | December 2021     | 1.12.1             | 1.12.1               | Gulp      |
| 4.4.1                      | October 2021      | 1.12.1             | 1.12.1               | Gulp      |
| 3.22.0                     | October 2021      | 1.12.1             | 1.12.1               | Gulp      |
| 4.3.0                      | July 2021         | 1.12.1             | 1.12.1               | Gulp      |
| 3.21.0                     | July 2021         | 1.12.1             | 1.12.1               | Gulp      |
| 4.2.3                      | June 2021         | 1.12.1             | 1.12.1               | Gulp      |
| 3.20.0                     | June 2021         | 1.12.1             | 1.12.1               | Gulp      |
| 3.19.2                     | April 2021        | 1.10.0             | 1.10.0               | Gulp      |
| 4.1.0                      | March 2021        | 1.11.0             | 1.11.0               | Gulp      |
| 3.18.2                     | March 2021        | 1.10.0             | 1.10.0               | Gulp      |
| 4.0.0                      | January 2021      | 1.11.0             | 1.11.0               | Gulp      |
| 3.17.0                     | January 2021      | 1.10.0             | 1.10.0               | Gulp      |
| 3.16.0                     | November 2020     | 1.10.0             | 1.10.0               | Gulp      |
| 3.15.3                     | September 2020    | 1.10.0             | 1.10.0               | Gulp      |
| 3.14.2                     | June 2020         | 1.10.0             | 1.10.0               | Gulp      |
| 3.13.0                     | May 2020          | 1.10.0             | 1.10.0               | Gulp      |
| 3.12.1                     | April 2020        | 1.10.0             | 1.10.0               | Gulp      |
| 3.11.1                     | March 2020        | 1.10.0             | 1.10.0               | Gulp      |
| 3.10.0                     | February 2020     | 1.10.0             | 1.10.0               | Gulp      |
| 3.9.0                      | January 2020      | 1.10.0             | 1.10.0               | Gulp      |
| 3.8.0                      | December 2019     | 1.9.1              | 1.9.1                | Gulp      |
| 3.7.0                      | October 2019      | 1.9.1              | 1.9.1                | Gulp      |

