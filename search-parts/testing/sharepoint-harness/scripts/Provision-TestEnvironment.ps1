[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl = "https://tcwlv.sharepoint.com",

    [string]$AdminUrl,

    [string]$SiteUrl,

    [switch]$SkipBuild,

    [switch]$SkipSiteCreation,

    [switch]$SkipAppCatalog,

    [switch]$SkipAppDeployment,

    [switch]$SkipPageProvisioning,

    [switch]$SkipWebPartProvisioning,

    [switch]$DeleteSite,

    [switch]$Force,

    [switch]$UseUniquePageNames
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:HasSiteUrlOverride = $PSBoundParameters.ContainsKey('SiteUrl') -and -not [string]::IsNullOrWhiteSpace($SiteUrl)

$script:KnownComponents = @{
    'search-box' = @{
        alias = 'pnpSearchBoxWebPart'
        id = '544c1372-7e5a-49ec-8db6-812f76c375f2'
        title = 'PnP - Search Box'
    }
    'search-results' = @{
        alias = 'pnpSearchResultsWebPart'
        id = '544c1372-42df-47c3-94d6-017428cd2baf'
        title = 'PnP - Search Results'
    }
    'search-filters' = @{
        alias = 'pnpSearchFiltersWebPart'
        id = '544c1372-fb1d-4e96-bc1e-31fd66979667'
        title = 'PnP - Search Filters'
    }
    'search-verticals' = @{
        alias = 'pnpSearchVerticalsWebPart'
        id = '544c1372-77ae-40a0-9095-805ae2a0d5e9'
        title = 'PnP - Search Verticals'
    }
}

$script:FullWidthSupportedComponentIds = @(
    # Built-in page title control
    'cbe7b0a9-3504-44dd-a3a3-0e5cacd07788'
    # Built-in hero web part
    'c4bd7b2f-7b6e-4599-8485-16504575f590'
    # Built-in image web part
    'd1d91016-032f-456d-98a4-721247c305e8'
)

function Write-Step {
    param([string]$Message)

    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Resolve-AbsolutePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$BasePath
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $BasePath $Path))
}

function Get-RepositoryRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\..'))
}

function Get-SearchPartsRoot {
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
}

function Get-PageServerRelativeUrl {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $web = Get-PnPWeb -Connection $SiteConnection
    $serverRelativeUrl = [string](Get-OptionalPropertyValue -Object $web -PropertyName 'ServerRelativeUrl')
    if ([string]::IsNullOrWhiteSpace($serverRelativeUrl) -or $serverRelativeUrl -eq '/') {
        return "/SitePages/$PageName"
    }

    return "$serverRelativeUrl/SitePages/$PageName"
}

function New-UniquePageName {
    param([Parameter(Mandatory = $true)][string]$PageName)

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($PageName)
    $extension = [System.IO.Path]::GetExtension($PageName)
    $timestampSuffix = Get-Date -Format 'yyyyMMdd-HHmmss'

    if ([string]::IsNullOrWhiteSpace($extension)) {
        return "$baseName-$timestampSuffix"
    }

    return "$baseName-$timestampSuffix$extension"
}

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 100
}

function Get-OptionalPropertyValue {
    param(
        [Parameter(Mandatory = $false)]$Object,
        [Parameter(Mandatory = $true)][string]$PropertyName
    )

    if ($null -eq $Object) {
        return $null
    }

    $property = $Object.PSObject.Properties[$PropertyName]
    if ($null -eq $property) {
        return $null
    }

    return $property.Value
}

function Get-PackageSettings {
    param(
        [Parameter(Mandatory = $true)]$Scenario,
        [Parameter(Mandatory = $true)][string]$ScenarioDirectory,
        [Parameter(Mandatory = $true)][string]$SearchPartsRoot
    )

    $packageSolutionPath = Join-Path $SearchPartsRoot 'config\package-solution.json'
    $packageSolution = Read-JsonFile -Path $packageSolutionPath

    $defaultPackagePath = [System.IO.Path]::GetFullPath((Join-Path $SearchPartsRoot "sharepoint\$($packageSolution.paths.zippedPackage)"))
    $configuredPackagePath = $null
    $packagePath = Get-OptionalPropertyValue -Object $Scenario.package -PropertyName 'path'
    if (-not [string]::IsNullOrWhiteSpace([string]$packagePath)) {
        $configuredPackagePath = Resolve-AbsolutePath -Path [string]$packagePath -BasePath $ScenarioDirectory
    }

    if ([string]::IsNullOrWhiteSpace([string]$configuredPackagePath)) {
        $configuredPackagePath = $defaultPackagePath
    }

    if (-not (Test-Path -LiteralPath $configuredPackagePath -PathType Leaf) -and (Test-Path -LiteralPath $defaultPackagePath -PathType Leaf)) {
        $configuredPackagePath = $defaultPackagePath
    }

    $skipFeatureDeployment = $false
    $scenarioSkipFeatureDeployment = Get-OptionalPropertyValue -Object $Scenario.package -PropertyName 'skipFeatureDeployment'
    if ($null -ne $scenarioSkipFeatureDeployment) {
        $skipFeatureDeployment = [bool]$scenarioSkipFeatureDeployment
    }
    else {
        $skipFeatureDeployment = [bool]$packageSolution.solution.skipFeatureDeployment
    }

    return [pscustomobject]@{
        Path = $configuredPackagePath
        SkipFeatureDeployment = $skipFeatureDeployment
        SolutionId = [string]$packageSolution.solution.id
        SolutionName = [string]$packageSolution.solution.name
        SolutionVersion = [string]$packageSolution.solution.version
    }
}

function Get-AuthSettings {
    param(
        [Parameter(Mandatory = $true)]$Scenario,
        [Parameter(Mandatory = $true)][bool]$HasTenantUrlOverride,
        [Parameter(Mandatory = $true)][bool]$HasClientIdOverride,
        [Parameter(Mandatory = $true)][bool]$HasAdminUrlOverride
    )

    $scenarioAuth = $null
    if ($null -ne $Scenario.auth) {
        $scenarioAuth = $Scenario.auth
    }

    $scenarioTenantUrl = $null
    $scenarioClientId = $null
    $scenarioAdminUrl = $null
    if ($null -ne $scenarioAuth) {
        $scenarioTenantUrl = $scenarioAuth.PSObject.Properties['tenantUrl']
        $scenarioClientId = $scenarioAuth.PSObject.Properties['clientId']
        $scenarioAdminUrl = $scenarioAuth.PSObject.Properties['adminUrl']
    }

    $resolvedTenantUrl = $TenantUrl
    if (-not $HasTenantUrlOverride -and $null -ne $scenarioTenantUrl -and -not [string]::IsNullOrWhiteSpace([string]$scenarioTenantUrl.Value)) {
        $resolvedTenantUrl = [string]$scenarioTenantUrl.Value
    }

    $resolvedClientId = $ClientId
    if (-not $HasClientIdOverride -and $null -ne $scenarioClientId -and -not [string]::IsNullOrWhiteSpace([string]$scenarioClientId.Value)) {
        $resolvedClientId = [string]$scenarioClientId.Value
    }

    $resolvedAdminUrl = $AdminUrl
    if (-not $HasAdminUrlOverride -and $null -ne $scenarioAdminUrl -and -not [string]::IsNullOrWhiteSpace([string]$scenarioAdminUrl.Value)) {
        $resolvedAdminUrl = [string]$scenarioAdminUrl.Value
    }

    if ([string]::IsNullOrWhiteSpace($resolvedTenantUrl)) {
        throw 'A tenant URL must be provided either via -TenantUrl or scenario.auth.tenantUrl.'
    }

    if ([string]::IsNullOrWhiteSpace($resolvedClientId)) {
        throw 'A PnP client id must be provided either via -ClientId or scenario.auth.clientId.'
    }

    return [pscustomobject]@{
        TenantUrl = $resolvedTenantUrl
        ClientId = $resolvedClientId
        AdminUrl = $resolvedAdminUrl
    }
}

function Connect-InteractivePnP {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$ResolvedClientId
    )

    return Connect-PnPOnline -Url $Url -Interactive -ClientId $ResolvedClientId -PersistLogin -ReturnConnection
}

function Get-AdminUrl {
    param(
        [Parameter(Mandatory = $true)][string]$BaseTenantUrl,
        [string]$ConfiguredAdminUrl
    )

    if (-not [string]::IsNullOrWhiteSpace($ConfiguredAdminUrl)) {
        return $ConfiguredAdminUrl
    }

    $uri = [System.Uri]$BaseTenantUrl
    $hostParts = $uri.Host.Split('.')
    return "{0}://{1}-admin.{2}" -f $uri.Scheme, $hostParts[0], ($hostParts[1..($hostParts.Length - 1)] -join '.')
}

function Ensure-PnPModule {
    if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
        throw 'PnP.PowerShell is not installed. Install it with: Install-Module PnP.PowerShell -Scope CurrentUser'
    }

    Import-Module PnP.PowerShell -ErrorAction Stop | Out-Null
}

function Invoke-SearchPartsBuild {
    param([Parameter(Mandatory = $true)][string]$SearchPartsRoot)

    Write-Step 'Building the current SPFx package'
    Push-Location $SearchPartsRoot
    try {
        & pnpm build
        if ($LASTEXITCODE -ne 0) {
            throw "pnpm build failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

function Get-SiteDefinition {
    param([Parameter(Mandatory = $true)]$Scenario)

    $site = $Scenario.site
    if ($null -eq $site) {
        throw 'The scenario must contain a site object.'
    }

    $siteUrl = if ($script:HasSiteUrlOverride) { $SiteUrl } else { Get-OptionalPropertyValue -Object $site -PropertyName 'url' }
    if ([string]::IsNullOrWhiteSpace([string]$siteUrl)) {
        throw 'scenario.site.url is required.'
    }

    $siteTitle = Get-OptionalPropertyValue -Object $site -PropertyName 'title'
    if ([string]::IsNullOrWhiteSpace([string]$siteTitle)) {
        throw 'scenario.site.title is required.'
    }

    $siteType = Get-OptionalPropertyValue -Object $site -PropertyName 'type'
    $type = if ([string]::IsNullOrWhiteSpace([string]$siteType)) { 'CommunicationSite' } else { [string]$siteType }
    return [pscustomobject]@{
        Url = [string]$siteUrl
        Title = [string]$siteTitle
        Type = $type
        Owner = [string](Get-OptionalPropertyValue -Object $site -PropertyName 'owner')
        SiteDesign = [string](Get-OptionalPropertyValue -Object $site -PropertyName 'siteDesign')
        Description = [string](Get-OptionalPropertyValue -Object $site -PropertyName 'description')
        Lcid = if ($null -ne (Get-OptionalPropertyValue -Object $site -PropertyName 'lcid')) { [int](Get-OptionalPropertyValue -Object $site -PropertyName 'lcid') } else { $null }
        TimeZone = if ($null -ne (Get-OptionalPropertyValue -Object $site -PropertyName 'timeZoneId')) { [int](Get-OptionalPropertyValue -Object $site -PropertyName 'timeZoneId') } else { $null }
    }
}

function Ensure-TestSite {
    param(
        [Parameter(Mandatory = $true)]$SiteDefinition,
        [Parameter(Mandatory = $true)]$AdminConnection
    )

    $existingSite = Get-PnPTenantSite -Identity $SiteDefinition.Url -Connection $AdminConnection -ErrorAction SilentlyContinue
    if ($null -ne $existingSite) {
        Write-Step "Using existing site $($SiteDefinition.Url)"
        return
    }

    Write-Step "Creating site $($SiteDefinition.Url)"

    $newSiteParameters = @{
        Type = $SiteDefinition.Type
        Title = $SiteDefinition.Title
        Url = $SiteDefinition.Url
        Wait = $true
        Connection = $AdminConnection
    }

    if (-not [string]::IsNullOrWhiteSpace($SiteDefinition.Owner)) {
        $newSiteParameters.Owner = $SiteDefinition.Owner
    }

    if (-not [string]::IsNullOrWhiteSpace($SiteDefinition.SiteDesign)) {
        $newSiteParameters.SiteDesign = $SiteDefinition.SiteDesign
    }

    if (-not [string]::IsNullOrWhiteSpace($SiteDefinition.Description)) {
        $newSiteParameters.Description = $SiteDefinition.Description
    }

    if ($null -ne $SiteDefinition.Lcid) {
        $newSiteParameters.Lcid = $SiteDefinition.Lcid
    }

    if ($null -ne $SiteDefinition.TimeZone) {
        $newSiteParameters.TimeZone = $SiteDefinition.TimeZone
    }

    New-PnPSite @newSiteParameters | Out-Null
}

function Ensure-SiteCollectionAppCatalog {
    param(
        [Parameter(Mandatory = $true)][string]$SiteUrl,
        [Parameter(Mandatory = $true)]$AdminConnection
    )

    $existingCatalog = @(Get-PnPSiteCollectionAppCatalog -Connection $AdminConnection -ExcludeDeletedSites -SkipUrlValidation -ErrorAction SilentlyContinue) |
        Where-Object {
            $catalogUrl = Get-OptionalPropertyValue -Object $_ -PropertyName 'Url'
            $catalogSiteUrl = Get-OptionalPropertyValue -Object $_ -PropertyName 'SiteUrl'
            $catalogAbsoluteUrl = Get-OptionalPropertyValue -Object $_ -PropertyName 'AbsoluteUrl'

            $catalogUrl -eq $SiteUrl -or $catalogSiteUrl -eq $SiteUrl -or $catalogAbsoluteUrl -eq $SiteUrl
        } |
        Select-Object -First 1

    if ($null -ne $existingCatalog) {
        Write-Step 'Site collection app catalog already enabled'
        return
    }

    Write-Step 'Enabling the site collection app catalog'
    Add-PnPSiteCollectionAppCatalog -Site $SiteUrl -Connection $AdminConnection | Out-Null
}

function Remove-StaleSiteAppPackage {
    param(
        [Parameter(Mandatory = $true)]$PackageSettings,
        [Parameter(Mandatory = $true)][string]$PackagePath,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $packageFileName = [System.IO.Path]::GetFileName($PackagePath)
    $siteApps = @(Get-PnPApp -Scope Site -Connection $SiteConnection -ErrorAction SilentlyContinue)

    $matchingApps = @($siteApps | Where-Object {
        $appId = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Id')
        $productId = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'ProductId')
        $title = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Title')
        $appFileName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'AppCatalogVersion')

        $appId -eq $PackageSettings.SolutionId -or
        $productId -eq $PackageSettings.SolutionId -or
        $title -eq $PackageSettings.SolutionName -or
        $appFileName -eq $packageFileName
    })

    if ($matchingApps.Count -gt 0) {
        Write-Step 'Removing existing site app before reinstalling the current package'
        foreach ($existingApp in $matchingApps) {
            $existingAppId = [string](Get-OptionalPropertyValue -Object $existingApp -PropertyName 'Id')
            if ([string]::IsNullOrWhiteSpace($existingAppId)) {
                continue
            }

            try {
                Uninstall-PnPApp -Identity $existingAppId -Scope Site -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
            }
            catch {
            }

            Remove-PnPApp -Identity $existingAppId -Scope Site -Force -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
        }
    }

    $recycleBinItems = @()
    $recycleBinItems += @(Get-PnPRecycleBinItem -Connection $SiteConnection -RowLimit 500 -Includes 'LeafName','Title','DirName' -ErrorAction SilentlyContinue)
    $recycleBinItems += @(Get-PnPRecycleBinItem -Connection $SiteConnection -SecondStage -RowLimit 500 -Includes 'LeafName','Title','DirName' -ErrorAction SilentlyContinue)

    $matchingRecycleBinItems = @($recycleBinItems | Where-Object {
        $leafName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'LeafName')
        $title = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Title')
        $dirName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'DirName')

        $leafName -eq $packageFileName -or $title -eq $packageFileName -or $dirName -like "*$packageFileName*"
    })

    if ($matchingRecycleBinItems.Count -gt 0) {
        Write-Step 'Clearing matching package entries from the site recycle bin'
        foreach ($recycleBinItem in $matchingRecycleBinItems) {
            $recycleBinItemId = Get-OptionalPropertyValue -Object $recycleBinItem -PropertyName 'Id'
            if ($null -eq $recycleBinItemId) {
                continue
            }

            Clear-PnPRecycleBinItem -Identity $recycleBinItemId -Force -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
        }
    }
}

function Publish-SolutionToSiteCatalog {
    param(
        [Parameter(Mandatory = $true)]$PackageSettings,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    function Get-MatchingSiteApp {
        param(
            [Parameter(Mandatory = $true)]$SiteApps,
            [Parameter(Mandatory = $true)]$PackageSettingsValue
        )

        return $SiteApps |
            Where-Object {
                $appId = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Id')
                $productId = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'ProductId')
                $title = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Title')

                $appId -eq $PackageSettingsValue.SolutionId -or
                $productId -eq $PackageSettingsValue.SolutionId -or
                $title -eq $PackageSettingsValue.SolutionName
            } |
            Select-Object -First 1
    }

    function Get-NormalizedVersionString {
        param([string]$Value)

        if ([string]::IsNullOrWhiteSpace($Value)) {
            return $null
        }

        $versionMatch = [regex]::Match($Value, '\d+(?:\.\d+){1,3}')
        if (-not $versionMatch.Success) {
            return $null
        }

        $segments = @($versionMatch.Value.Split('.'))
        while ($segments.Count -lt 4) {
            $segments += '0'
        }

        try {
            return ([version]::Parse(($segments -join '.'))).ToString()
        }
        catch {
            return $null
        }
    }

    $resolvedPackagePath = $PackageSettings.Path
    if (-not [string]::IsNullOrWhiteSpace([string]$resolvedPackagePath)) {
        try {
            $resolvedPackagePath = (Resolve-Path -LiteralPath $resolvedPackagePath -ErrorAction Stop).Path
        }
        catch {
        }
    }

    if (-not (Test-Path -LiteralPath $resolvedPackagePath -PathType Leaf)) {
        throw "The SPFx package was not found at '$resolvedPackagePath'."
    }

    $localPackageVersion = Get-NormalizedVersionString -Value ([string]$PackageSettings.SolutionVersion)
    $existingSiteApps = @(Get-PnPApp -Scope Site -Connection $SiteConnection -ErrorAction SilentlyContinue)
    $existingMatchingApp = Get-MatchingSiteApp -SiteApps $existingSiteApps -PackageSettingsValue $PackageSettings

    $localPackageVersionRaw = [string]$PackageSettings.SolutionVersion
    if ([string]::IsNullOrWhiteSpace($localPackageVersionRaw)) {
        $localPackageVersionRaw = '<unknown>'
    }

    Write-Step "Local package version: raw='$localPackageVersionRaw'; normalized='$localPackageVersion'"

    if ($null -ne $existingMatchingApp -and -not [string]::IsNullOrWhiteSpace($localPackageVersion)) {
        $existingCatalogVersionRaw = [string](Get-OptionalPropertyValue -Object $existingMatchingApp -PropertyName 'AppCatalogVersion')
        $existingInstalledVersionRaw = [string](Get-OptionalPropertyValue -Object $existingMatchingApp -PropertyName 'InstalledVersion')

        $existingCatalogVersion = Get-NormalizedVersionString -Value $existingCatalogVersionRaw
        $existingInstalledVersion = Get-NormalizedVersionString -Value $existingInstalledVersionRaw

        if ([string]::IsNullOrWhiteSpace($existingCatalogVersion)) {
            $existingCatalogVersion = $existingInstalledVersion
        }

        if ([string]::IsNullOrWhiteSpace($existingCatalogVersionRaw)) {
            $existingCatalogVersionRaw = '<empty>'
        }

        if ([string]::IsNullOrWhiteSpace($existingInstalledVersionRaw)) {
            $existingInstalledVersionRaw = '<empty>'
        }

        Write-Step "Site package version (catalog): raw='$existingCatalogVersionRaw'; normalized='$existingCatalogVersion'"
        Write-Step "Site package version (installed): raw='$existingInstalledVersionRaw'; normalized='$existingInstalledVersion'"

        if (-not [string]::IsNullOrWhiteSpace($existingCatalogVersion) -and $existingCatalogVersion -eq $localPackageVersion) {
            Write-Step "Skipping package update because local version '$localPackageVersion' matches the site app catalog version."
            return $existingMatchingApp
        }

        Write-Step "Package update required because local version '$localPackageVersion' does not match site app catalog version '$existingCatalogVersion'."
    }
    elseif ($null -eq $existingMatchingApp) {
        Write-Step "No matching app was found in the site app catalog for solution '$($PackageSettings.SolutionName)' / '$($PackageSettings.SolutionId)'. Upload is required."
    }
    else {
        Write-Step 'Local package version is unavailable, so package upload will proceed.'
    }

    Remove-StaleSiteAppPackage -PackageSettings $PackageSettings -PackagePath $resolvedPackagePath -SiteConnection $SiteConnection

    Write-Step "Uploading package $resolvedPackagePath"
    $uploadedApp = $null
    $maxUploadAttempts = 6
    $uploadRetryDelaySeconds = 5

    for ($attempt = 1; $attempt -le $maxUploadAttempts; $attempt++) {
        try {
            $uploadedApp = Add-PnPApp -Path $resolvedPackagePath -Scope Site -Overwrite -Connection $SiteConnection
            break
        }
        catch {
            $errorMessage = [string]$_.Exception.Message
            $isSiteCatalogEndpointIssue =
                $errorMessage -like '*SP.RequestContext.current/web/sitecollectionappcatalog*' -or
                $errorMessage -like '*ResourceNotFoundException*'

            if ($isSiteCatalogEndpointIssue -and $attempt -lt $maxUploadAttempts) {
                Write-Step "Site app catalog endpoint not ready yet (attempt $attempt of $maxUploadAttempts). Retrying in $uploadRetryDelaySeconds seconds."
                Start-Sleep -Seconds $uploadRetryDelaySeconds
                continue
            }

            throw
        }
    }

    if ($null -eq $uploadedApp) {
        $siteAppsAfterUpload = @(Get-PnPApp -Scope Site -Connection $SiteConnection -ErrorAction SilentlyContinue)
        $uploadedApp = Get-MatchingSiteApp -SiteApps $siteAppsAfterUpload -PackageSettingsValue $PackageSettings
    }

    if ($null -eq $uploadedApp) {
        throw 'Package upload did not return an app object and no matching app could be resolved from the site app catalog.'
    }

    Write-Step 'Publishing the package in the site app catalog'
    $publishParameters = @{
        Identity = $uploadedApp.Id
        Scope = 'Site'
        Connection = $SiteConnection
        Force = $true
    }

    if ($PackageSettings.SkipFeatureDeployment) {
        $publishParameters.SkipFeatureDeployment = $true
    }

    Publish-PnPApp @publishParameters | Out-Null

    Write-Step 'Installing the package in the site'
    Install-PnPApp -Identity $uploadedApp.Id -Scope Site -Wait -Connection $SiteConnection | Out-Null

    return Get-PnPApp -Identity $uploadedApp.Id -Scope Site -Connection $SiteConnection
}

function Test-SiteAppReadiness {
    param(
        [Parameter(Mandatory = $true)]$PackageSettings,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    function Get-PropertyBooleanValue {
        param(
            [Parameter(Mandatory = $false)]$Object,
            [Parameter(Mandatory = $true)][string[]]$PropertyNames
        )

        if ($null -eq $Object) {
            return $null
        }

        foreach ($propertyName in $PropertyNames) {
            $rawValue = Get-OptionalPropertyValue -Object $Object -PropertyName $propertyName
            if ($null -eq $rawValue) {
                continue
            }

            if ($rawValue -is [bool]) {
                return [bool]$rawValue
            }

            $rawText = [string]$rawValue
            if ([string]::IsNullOrWhiteSpace($rawText)) {
                continue
            }

            $parsedValue = $false
            if ([bool]::TryParse($rawText, [ref]$parsedValue)) {
                return [bool]$parsedValue
            }
        }

        return $null
    }

    function Get-PropertyStringValue {
        param(
            [Parameter(Mandatory = $false)]$Object,
            [Parameter(Mandatory = $true)][string[]]$PropertyNames
        )

        if ($null -eq $Object) {
            return $null
        }

        foreach ($propertyName in $PropertyNames) {
            $rawValue = Get-OptionalPropertyValue -Object $Object -PropertyName $propertyName
            if ($null -eq $rawValue) {
                continue
            }

            $textValue = [string]$rawValue
            if (-not [string]::IsNullOrWhiteSpace($textValue)) {
                return $textValue
            }
        }

        return $null
    }

    $siteApps = @(Get-PnPApp -Scope Site -Connection $SiteConnection -ErrorAction SilentlyContinue)
    $matchingApp = $siteApps |
        Where-Object {
            $appId = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Id')
            $productId = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'ProductId')
            $title = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Title')

            $appId -eq $PackageSettings.SolutionId -or
            $productId -eq $PackageSettings.SolutionId -or
            $title -eq $PackageSettings.SolutionName
        } |
        Select-Object -First 1

    if ($null -eq $matchingApp) {
        return [pscustomobject]@{
            IsReady = $false
            Reason = "No site-scoped app matching solution '$($PackageSettings.SolutionName)' / '$($PackageSettings.SolutionId)' was found."
        }
    }

    $appInfo = $null
    try {
        $appInfo = @(Get-PnPAppInfo -ProductId ([Guid]$PackageSettings.SolutionId) -Connection $SiteConnection -ErrorAction SilentlyContinue)
    }
    catch {
    }

    $deployedState = Get-PropertyBooleanValue -Object $matchingApp -PropertyNames @('Deployed', 'IsClientSideSolutionCurrentVersionDeployed', 'IsClientSideSolutionDeployed', 'IsDeployed')
    if ($null -eq $deployedState -and $null -ne $appInfo -and $appInfo.Count -gt 0) {
        $deployedState = Get-PropertyBooleanValue -Object $appInfo[0] -PropertyNames @('Deployed', 'IsClientSideSolutionCurrentVersionDeployed', 'IsClientSideSolutionDeployed', 'IsDeployed')
    }

    $installedState = Get-PropertyBooleanValue -Object $matchingApp -PropertyNames @('Installed', 'IsInstalled')
    if ($null -eq $installedState -and $null -ne $appInfo -and $appInfo.Count -gt 0) {
        $installedState = Get-PropertyBooleanValue -Object $appInfo[0] -PropertyNames @('Installed', 'IsInstalled')
    }

    $installedVersion = Get-PropertyStringValue -Object $matchingApp -PropertyNames @('InstalledVersion')
    if ([string]::IsNullOrWhiteSpace($installedVersion) -and $null -ne $appInfo -and $appInfo.Count -gt 0) {
        $installedVersion = Get-PropertyStringValue -Object $appInfo[0] -PropertyNames @('InstalledVersion')
    }

    if ($deployedState -eq $false) {
        return [pscustomobject]@{
            IsReady = $false
            Reason = "The site app '$($PackageSettings.SolutionName)' exists but is not deployed yet."
        }
    }

    if ($installedState -eq $false) {
        return [pscustomobject]@{
            IsReady = $false
            Reason = "The site app '$($PackageSettings.SolutionName)' exists but is not installed yet."
        }
    }

    $hasPositiveReadinessSignal = ($deployedState -eq $true) -or ($installedState -eq $true) -or (-not [string]::IsNullOrWhiteSpace($installedVersion))
    if (-not $hasPositiveReadinessSignal) {
        return [pscustomobject]@{
            IsReady = $false
            Reason = "The site app '$($PackageSettings.SolutionName)' was found, but install/deploy readiness could not be confirmed yet."
        }
    }

    return [pscustomobject]@{
        IsReady = $true
        Reason = $null
        App = $matchingApp
        AppInfo = $appInfo
    }
}

function ConvertTo-PropertiesJson {
    param([Parameter(Mandatory = $false)]$Properties)

    if ($null -eq $Properties) {
        return $null
    }

    if ($Properties -is [string]) {
        return $Properties
    }

    return $Properties | ConvertTo-Json -Depth 100 -Compress
}

function Unlock-PageForReplacement {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $pageServerRelativeUrl = Get-PageServerRelativeUrl -PageName $PageName -SiteConnection $SiteConnection

    try {
        Undo-PnPFileCheckedOut -Url $pageServerRelativeUrl -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
    }

    try {
        Set-PnPFileCheckedIn -Url $pageServerRelativeUrl -Comment 'Released by provisioning harness for replacement' -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
    }
}

function Finalize-PageProvisioning {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)][bool]$PublishPage,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $pageServerRelativeUrl = Get-PageServerRelativeUrl -PageName $PageName -SiteConnection $SiteConnection

    try {
        Set-PnPFileCheckedIn -Url $pageServerRelativeUrl -CheckInType MajorCheckIn -Comment 'Checked in by provisioning harness' -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
    }

    if ($PublishPage) {
        Set-PnPPage -Identity $PageName -Publish -Connection $SiteConnection | Out-Null

        try {
            Set-PnPFileCheckedIn -Url $pageServerRelativeUrl -CheckInType MajorCheckIn -Comment 'Published by provisioning harness' -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
        }
        catch {
        }
    }

    $checkedOutPages = @()
    try {
        $checkedOutPages = @(Get-PnPFileCheckedOut -List 'Site Pages' -Connection $SiteConnection -ErrorAction SilentlyContinue)
    }
    catch {
    }

    $matchingCheckedOutPage = $checkedOutPages |
        Where-Object {
            $leafName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'FileLeafRef')
            $fileName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'FileName')
            $pageName -eq $leafName -or $pageName -eq $fileName
        } |
        Select-Object -First 1

    if ($null -ne $matchingCheckedOutPage) {
        try {
            Undo-PnPFileCheckedOut -Url $pageServerRelativeUrl -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
        }
        catch {
        }

        try {
            Set-PnPFileCheckedIn -Url $pageServerRelativeUrl -CheckInType MajorCheckIn -Comment 'Recovered lingering checkout after provisioning' -Connection $SiteConnection -ErrorAction SilentlyContinue | Out-Null
        }
        catch {
        }

        if ($PublishPage) {
            try {
                Set-PnPPage -Identity $PageName -Publish -Connection $SiteConnection | Out-Null
            }
            catch {
            }
        }
    }
}

function Resolve-ComponentDescriptor {
    param([Parameter(Mandatory = $true)]$WebPart)

    $componentId = Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentId'
    $componentAlias = Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentAlias'
    $componentKey = Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentKey'

    if ($null -ne $componentId -and -not [string]::IsNullOrWhiteSpace([string]$componentId)) {
        return [pscustomobject]@{
            Id = [string]$componentId
            Alias = [string]$componentAlias
            Title = $null
        }
    }

    if ($null -ne $componentAlias -and -not [string]::IsNullOrWhiteSpace([string]$componentAlias)) {
        return [pscustomobject]@{
            Id = $null
            Alias = [string]$componentAlias
            Title = $null
        }
    }

    if ($null -ne $componentKey -and -not [string]::IsNullOrWhiteSpace([string]$componentKey)) {
        $knownComponent = $script:KnownComponents[[string]$componentKey]
        if ($null -eq $knownComponent) {
            throw "Unknown componentKey '$componentKey'."
        }

        return [pscustomobject]@{
            Id = [string]$knownComponent.id
            Alias = [string]$knownComponent.alias
            Title = [string]$knownComponent.title
        }
    }

    throw 'Each web part must define componentId, componentAlias, or componentKey.'
}

function Get-UnsupportedWebPartReason {
    param([Parameter(Mandatory = $true)]$WebPart)

    $componentAlias = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentAlias')
    $componentKey = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentKey')
    $componentId = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentId')
    $propertiesJson = Get-OptionalPropertyValue -Object $WebPart -PropertyName 'propertiesJson'
    $zoneBackground = Get-OptionalPropertyValue -Object $propertiesJson -PropertyName 'zoneBackground'

    # Exported page canvas background controls are not installable web parts.
    if ($null -ne $zoneBackground -and [string]::IsNullOrWhiteSpace($componentAlias) -and [string]::IsNullOrWhiteSpace($componentKey) -and -not [string]::IsNullOrWhiteSpace($componentId)) {
        return 'decorative zone background control'
    }

    return $null
}

function Find-AvailableComponent {
    param(
        [Parameter(Mandatory = $true)]$AvailableComponents,
        [Parameter(Mandatory = $true)]$Descriptor
    )

    function Normalize-IdentityValue {
        param([string]$Value)

        if ([string]::IsNullOrWhiteSpace($Value)) {
            return ''
        }

        return $Value.Trim().TrimStart('{').TrimEnd('}').ToLowerInvariant()
    }

    $descriptorId = Normalize-IdentityValue -Value ([string]$Descriptor.Id)
    $descriptorAlias = Normalize-IdentityValue -Value ([string]$Descriptor.Alias)
    $descriptorTitle = Normalize-IdentityValue -Value ([string]$Descriptor.Title)

    foreach ($component in $AvailableComponents) {
        $componentId = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Id')
        $definitionId = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'DefinitionId')
        $name = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Name')
        $title = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Title')

        # Different PnP.PowerShell versions can expose identity under different fields.
        $extraIdentityValues = @(
            [string](Get-OptionalPropertyValue -Object $component -PropertyName 'WebPartId'),
            [string](Get-OptionalPropertyValue -Object $component -PropertyName 'ComponentId'),
            [string](Get-OptionalPropertyValue -Object $component -PropertyName 'ManifestId')
        )

        $normalizedIdentityValues = @(
            Normalize-IdentityValue -Value $componentId,
            Normalize-IdentityValue -Value $definitionId,
            Normalize-IdentityValue -Value $name,
            Normalize-IdentityValue -Value $title
        ) + @($extraIdentityValues | ForEach-Object { Normalize-IdentityValue -Value $_ })

        if (-not [string]::IsNullOrWhiteSpace($descriptorId) -and $normalizedIdentityValues -contains $descriptorId) {
            return $component
        }

        if (-not [string]::IsNullOrWhiteSpace($descriptorAlias) -and $normalizedIdentityValues -contains $descriptorAlias) {
            return $component
        }

        if (-not [string]::IsNullOrWhiteSpace($descriptorTitle)) {
            $normalizedTitle = Normalize-IdentityValue -Value $title
            if ($normalizedTitle -eq $descriptorTitle -or $normalizedTitle -like "*$descriptorTitle*") {
                return $component
            }
        }

        # Some environments expose only generic GUID names for components.
        # If the visible title contains the expected alias token, treat as a match.
        if (-not [string]::IsNullOrWhiteSpace($descriptorAlias)) {
            $normalizedTitle = Normalize-IdentityValue -Value $title
            if (-not [string]::IsNullOrWhiteSpace($normalizedTitle) -and $normalizedTitle -like "*$descriptorAlias*") {
                return $component
            }
        }

    }

    $identity = if ($Descriptor.Id) { $Descriptor.Id } else { $Descriptor.Alias }
    throw "Unable to find a page component matching '$identity'."
}

function Wait-ForAvailableComponent {
    param(
        [Parameter(Mandatory = $true)][string]$PageIdentity,
        [Parameter(Mandatory = $true)]$Descriptor,
        [Parameter(Mandatory = $true)]$SiteConnection,
        [int]$RetryCount = 4,
        [int]$RetryDelaySeconds = 3
    )

    $componentLabel = if (-not [string]::IsNullOrWhiteSpace([string]$Descriptor.Alias)) {
        [string]$Descriptor.Alias
    }
    else {
        [string]$Descriptor.Id
    }

    function Normalize-ComponentIdentityValue {
        param([string]$Value)

        if ([string]::IsNullOrWhiteSpace($Value)) {
            return ''
        }

        return $Value.Trim().TrimStart('{').TrimEnd('}').ToLowerInvariant()
    }

    function Test-GuidLikeString {
        param([string]$Value)

        if ([string]::IsNullOrWhiteSpace($Value)) {
            return $false
        }

        $normalized = Normalize-ComponentIdentityValue -Value $Value
        return $normalized -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    }

    $lastError = $null
    for ($attempt = 1; $attempt -le $RetryCount; $attempt++) {
        $availableComponents = @()

        $discoveryPages = [System.Collections.Generic.List[string]]::new()
        if (-not [string]::IsNullOrWhiteSpace($PageIdentity)) {
            [void]$discoveryPages.Add($PageIdentity)
        }

        # Home.aspx is typically stable and contains a reliable component catalog for the site.
        if (-not $discoveryPages.Contains('Home.aspx')) {
            [void]$discoveryPages.Add('Home.aspx')
        }

        foreach ($discoveryPage in $discoveryPages) {
            $availableComponents += @(Get-PnPPageComponent -Page $discoveryPage -ListAvailable -Connection $SiteConnection -ErrorAction SilentlyContinue)
        }

        $availableComponents = @($availableComponents)

        try {
            $component = $null
            $descriptorId = Normalize-ComponentIdentityValue -Value ([string]$Descriptor.Id)
            if (-not [string]::IsNullOrWhiteSpace($descriptorId)) {
                $matchingComponents = @($availableComponents | Where-Object {
                    $id = Normalize-ComponentIdentityValue -Value ([string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Id'))
                    $definitionId = Normalize-ComponentIdentityValue -Value ([string](Get-OptionalPropertyValue -Object $_ -PropertyName 'DefinitionId'))
                    $webPartId = Normalize-ComponentIdentityValue -Value ([string](Get-OptionalPropertyValue -Object $_ -PropertyName 'WebPartId'))

                    $id -eq $descriptorId -or $definitionId -eq $descriptorId -or $webPartId -eq $descriptorId
                })

                $component = $matchingComponents |
                    Where-Object {
                        $componentName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Name')
                        -not (Test-GuidLikeString -Value $componentName)
                    } |
                    Select-Object -First 1

                if ($null -eq $component) {
                    $component = $matchingComponents | Select-Object -First 1
                }
            }

            if ($null -eq $component) {
                $component = Find-AvailableComponent -AvailableComponents $availableComponents -Descriptor $Descriptor
            }

            return [pscustomobject]@{
                Component = $component
                AvailableComponents = $availableComponents
            }
        }
        catch {
            $lastError = $_
            if ($attempt -lt $RetryCount) {
                Write-Step "Waiting for page component '$componentLabel' to become available (attempt $attempt of $RetryCount)"
                Start-Sleep -Seconds $RetryDelaySeconds
            }
        }
    }

    if ($null -ne $lastError) {
        $latestAvailableComponents = @()
        foreach ($discoveryPage in @($PageIdentity, 'Home.aspx') | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique) {
            $latestAvailableComponents += @(Get-PnPPageComponent -Page $discoveryPage -ListAvailable -Connection $SiteConnection -ErrorAction SilentlyContinue)
        }

        $latestAvailableComponents = @($latestAvailableComponents)
        $availableComponentSummary = @(
            $latestAvailableComponents |
                Select-Object -First 20 |
                ForEach-Object {
                    $id = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Id')
                    $definitionId = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'DefinitionId')
                    $name = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Name')
                    $title = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'Title')
                    "Id='$id'; DefinitionId='$definitionId'; Name='$name'; Title='$title'"
                }
        ) -join [Environment]::NewLine

        $identity = if ($Descriptor.Id) { $Descriptor.Id } elseif ($Descriptor.Title) { $Descriptor.Title } else { $Descriptor.Alias }
        throw "Unable to find a page component matching '$identity'. Available components were:`n$availableComponentSummary"
    }

    $identity = if ($Descriptor.Id) { $Descriptor.Id } else { $Descriptor.Alias }
    throw "Unable to find a page component matching '$identity'."
}

function Wait-ForPageAvailability {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)]$SiteConnection,
        [int]$RetryCount = 10,
        [int]$RetryDelaySeconds = 2
    )

    for ($attempt = 1; $attempt -le $RetryCount; $attempt++) {
        $page = Get-PnPPage -Identity $PageName -Connection $SiteConnection -ErrorAction SilentlyContinue
        if ($null -ne $page) {
            return
        }

        if ($attempt -lt $RetryCount) {
            Write-Step "Waiting for new page '$PageName' to become available (attempt $attempt of $RetryCount)"
            Start-Sleep -Seconds $RetryDelaySeconds
        }
    }

    throw "Page '$PageName' was created but did not become available in time."
}

function Ensure-PageSections {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)]$PageDefinition,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    function Test-WebPartSupportedInFullWidthSection {
        param([Parameter(Mandatory = $true)]$WebPart)

        $componentId = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentId')
        if (-not [string]::IsNullOrWhiteSpace($componentId)) {
            return $script:FullWidthSupportedComponentIds -contains $componentId.ToLowerInvariant()
        }

        $componentKey = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentKey')
        if (-not [string]::IsNullOrWhiteSpace($componentKey)) {
            return $false
        }

        $componentAlias = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentAlias')
        if (-not [string]::IsNullOrWhiteSpace($componentAlias)) {
            return $false
        }

        return $false
    }

    function Resolve-SectionTemplateForProvisioning {
        param(
            [Parameter(Mandatory = $true)]$Section,
            [Parameter(Mandatory = $true)][int]$SectionNumber,
            [Parameter(Mandatory = $true)]$PageDefinition
        )

        $configuredTemplate = [string](Get-OptionalPropertyValue -Object $Section -PropertyName 'template')
        if ($configuredTemplate -ne 'OneColumnFullWidth') {
            return $configuredTemplate
        }

        $webParts = @(Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'webParts')
        $sectionWebParts = @($webParts | Where-Object {
            $webPartSection = Get-OptionalPropertyValue -Object $_ -PropertyName 'section'
            $resolvedWebPartSection = if ($null -ne $webPartSection) { [int]$webPartSection } else { 1 }
            $resolvedWebPartSection -eq $SectionNumber
        })

        if ($sectionWebParts.Count -eq 0) {
            return $configuredTemplate
        }

        $hasUnsupportedControls = $false
        foreach ($webPart in $sectionWebParts) {
            if (-not (Test-WebPartSupportedInFullWidthSection -WebPart $webPart)) {
                $hasUnsupportedControls = $true
                break
            }
        }

        if ($hasUnsupportedControls) {
            $pageNameForLog = [string](Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'name')
            Write-Step "Section $SectionNumber on page '$pageNameForLog' uses OneColumnFullWidth with unsupported controls. Falling back to OneColumn."
            return 'OneColumn'
        }

        return $configuredTemplate
    }

    $sectionIndex = 1
    foreach ($section in @(Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'sections')) {
        $resolvedSectionTemplate = Resolve-SectionTemplateForProvisioning -Section $section -SectionNumber $sectionIndex -PageDefinition $PageDefinition
        $sectionParams = @{
            Page = $PageName
            SectionTemplate = $resolvedSectionTemplate
            Order = if ($null -ne (Get-OptionalPropertyValue -Object $section -PropertyName 'order')) { [int](Get-OptionalPropertyValue -Object $section -PropertyName 'order') } else { $sectionIndex }
            Connection = $SiteConnection
        }

        $zoneEmphasis = Get-OptionalPropertyValue -Object $section -PropertyName 'zoneEmphasis'
        if ($null -ne $zoneEmphasis) {
            $sectionParams.ZoneEmphasis = [int]$zoneEmphasis
        }

        $verticalZoneEmphasis = Get-OptionalPropertyValue -Object $section -PropertyName 'verticalZoneEmphasis'
        if ($null -ne $verticalZoneEmphasis) {
            $sectionParams.VerticalZoneEmphasis = [int]$verticalZoneEmphasis
        }

        $collapsible = Get-OptionalPropertyValue -Object $section -PropertyName 'collapsible'
        if ($null -ne $collapsible -and [bool]$collapsible) {
            $sectionParams.Collapsible = $true
        }

        $isExpanded = Get-OptionalPropertyValue -Object $section -PropertyName 'isExpanded'
        if ($null -ne $isExpanded -and [bool]$isExpanded) {
            $sectionParams.IsExpanded = $true
        }

        $displayName = Get-OptionalPropertyValue -Object $section -PropertyName 'displayName'
        if ($null -ne $displayName -and -not [string]::IsNullOrWhiteSpace([string]$displayName)) {
            $sectionParams.DisplayName = [string]$displayName
        }

        Add-PnPPageSection @sectionParams | Out-Null
        $sectionIndex++
    }
}

function Add-ConfiguredWebPart {
    param(
        [Parameter(Mandatory = $true)][string]$Page,
        [Parameter(Mandatory = $true)]$WebPartDefinition,
        [Parameter(Mandatory = $true)]$AvailableComponents,
        [Parameter(Mandatory = $false)]$ResolvedComponent,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $descriptor = Resolve-ComponentDescriptor -WebPart $WebPartDefinition
    $component = if ($null -ne $ResolvedComponent) {
        $ResolvedComponent
    }
    elseif (-not [string]::IsNullOrWhiteSpace([string]$descriptor.Id)) {
        if (-not [string]::IsNullOrWhiteSpace([string]$descriptor.Title)) {
            [string]$descriptor.Title
        }
        else {
            [string]$descriptor.Id
        }
    }
    else {
        Find-AvailableComponent -AvailableComponents $AvailableComponents -Descriptor $descriptor
    }

    $resolvedComponentName = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Name')
    $resolvedComponentNameNormalized = $resolvedComponentName.Trim().TrimStart('{').TrimEnd('}').ToLowerInvariant()
    $resolvedNameIsGuidLike = $resolvedComponentNameNormalized -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

    if (-not [string]::IsNullOrWhiteSpace($resolvedComponentName) -and -not $resolvedNameIsGuidLike) {
        $component = $resolvedComponentName
    }
    elseif (-not [string]::IsNullOrWhiteSpace([string]$descriptor.Title)) {
        $component = [string]$descriptor.Title
    }

    $propertiesJson = ConvertTo-PropertiesJson -Properties (Get-OptionalPropertyValue -Object $WebPartDefinition -PropertyName 'propertiesJson')

    $addParams = @{
        Page = $Page
        Component = $component
        Section = if ($null -ne (Get-OptionalPropertyValue -Object $WebPartDefinition -PropertyName 'section')) { [int](Get-OptionalPropertyValue -Object $WebPartDefinition -PropertyName 'section') } else { 1 }
        Column = if ($null -ne (Get-OptionalPropertyValue -Object $WebPartDefinition -PropertyName 'column')) { [int](Get-OptionalPropertyValue -Object $WebPartDefinition -PropertyName 'column') } else { 1 }
        Order = if ($null -ne (Get-OptionalPropertyValue -Object $WebPartDefinition -PropertyName 'order')) { [int](Get-OptionalPropertyValue -Object $WebPartDefinition -PropertyName 'order') } else { 1 }
        Connection = $SiteConnection
    }

    if ($propertiesJson) {
        $addParamsWithProperties = @{}
        foreach ($key in $addParams.Keys) {
            $addParamsWithProperties[$key] = $addParams[$key]
        }

        $addParamsWithProperties.WebPartProperties = $propertiesJson

        try {
            return Add-PnPPageWebPart @addParamsWithProperties
        }
        catch {
            Write-Step "Applying properties failed for component '$component'. Falling back to default web part configuration. Error: $($_.Exception.Message)"
        }
    }

    return Add-PnPPageWebPart @addParams
}

function Get-PageControlSnapshot {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $page = Get-PnPPage -Identity $PageName -Connection $SiteConnection -ErrorAction SilentlyContinue
    if ($null -eq $page) {
        return @()
    }

    return @($page.Controls)
}

function Get-PageCanvasContent {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $item = Get-PnPListItem -List 'Site Pages' -Fields FileLeafRef,CanvasContent1 -PageSize 2000 -Connection $SiteConnection |
        Where-Object { [string](Get-OptionalPropertyValue -Object $_.FieldValues -PropertyName 'FileLeafRef') -eq $PageName } |
        Select-Object -First 1

    if ($null -eq $item) {
        return ''
    }

    return [string](Get-OptionalPropertyValue -Object $item.FieldValues -PropertyName 'CanvasContent1')
}

function Get-ControlIdentitySet {
    param([Parameter(Mandatory = $true)]$Controls)

    $identities = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($control in @($Controls)) {
        $instanceId = [string](Get-OptionalPropertyValue -Object $control -PropertyName 'InstanceId')
        if (-not [string]::IsNullOrWhiteSpace($instanceId)) {
            [void]$identities.Add($instanceId)
        }
    }

    return $identities
}

function Ensure-Page {
    param(
        [Parameter(Mandatory = $true)]$PageDefinition,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    if ([string]::IsNullOrWhiteSpace([string]$PageDefinition.name)) {
        throw 'Each page must define a name.'
    }

    $requestedPageName = [string]$PageDefinition.name
    $pageName = if ($UseUniquePageNames) { New-UniquePageName -PageName $requestedPageName } else { $requestedPageName }
    $existingPage = Get-PnPPage -Identity $pageName -Connection $SiteConnection -ErrorAction SilentlyContinue

    if (-not $UseUniquePageNames -and $null -ne $existingPage) {
        if (-not $Force) {
            throw "Page '$pageName' already exists. Re-run with -Force to replace it."
        }

        Write-Step "Replacing page $pageName"
        Unlock-PageForReplacement -PageName $pageName -SiteConnection $SiteConnection
        Remove-PnPPage -Identity $pageName -Connection $SiteConnection -Force
    }
    else {
        Write-Step "Creating page $pageName"
    }

    $page = $null
    try {
        $pageTitle = Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'title'
        $page = Add-PnPPage -Name $pageName -Title ([string]$pageTitle) -LayoutType Article -Connection $SiteConnection
        Wait-ForPageAvailability -PageName $pageName -SiteConnection $SiteConnection

        if ($null -ne (Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'sections')) {
            Ensure-PageSections -PageName $pageName -PageDefinition $PageDefinition -SiteConnection $SiteConnection
        }

        $pageWebParts = @(Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'webParts')
        $preProvisionControls = Get-PageControlSnapshot -PageName $pageName -SiteConnection $SiteConnection
        $preProvisionControlIds = Get-ControlIdentitySet -Controls $preProvisionControls
        $attemptedWebPartAdds = 0
        $skippedUnsupportedWebParts = 0

        if ($SkipWebPartProvisioning) {
            Write-Step "Skipping web part provisioning for page $pageName"
        }
        else {
            foreach ($webPart in $pageWebParts) {
                $unsupportedReason = Get-UnsupportedWebPartReason -WebPart $webPart
                if (-not [string]::IsNullOrWhiteSpace([string]$unsupportedReason)) {
                    $componentId = [string](Get-OptionalPropertyValue -Object $webPart -PropertyName 'componentId')
                    $componentAlias = [string](Get-OptionalPropertyValue -Object $webPart -PropertyName 'componentAlias')
                    $componentKey = [string](Get-OptionalPropertyValue -Object $webPart -PropertyName 'componentKey')

                    $componentLabel = if (-not [string]::IsNullOrWhiteSpace($componentKey)) {
                        $componentKey
                    }
                    elseif (-not [string]::IsNullOrWhiteSpace($componentAlias)) {
                        $componentAlias
                    }
                    else {
                        $componentId
                    }

                    Write-Step "Skipping unsupported page control '$componentLabel' ($unsupportedReason)"
                    $skippedUnsupportedWebParts++
                    continue
                }

                $descriptor = Resolve-ComponentDescriptor -WebPart $webPart
                $componentResolution = Wait-ForAvailableComponent -PageIdentity $pageName -Descriptor $descriptor -SiteConnection $SiteConnection
                Add-ConfiguredWebPart -Page $pageName -WebPartDefinition $webPart -AvailableComponents $componentResolution.AvailableComponents -ResolvedComponent $componentResolution.Component -SiteConnection $SiteConnection | Out-Null
                $attemptedWebPartAdds++
            }

            if ($attemptedWebPartAdds -gt 0) {
                $postProvisionControls = Get-PageControlSnapshot -PageName $pageName -SiteConnection $SiteConnection
                $postProvisionControlIds = Get-ControlIdentitySet -Controls $postProvisionControls
                $newControlCount = 0

                foreach ($controlId in $postProvisionControlIds) {
                    if (-not $preProvisionControlIds.Contains($controlId)) {
                        $newControlCount++
                    }
                }

                $controlCountDelta = @($postProvisionControls).Count - @($preProvisionControls).Count
                Write-Step "Added $attemptedWebPartAdds web part(s) to page $pageName (new controls: $newControlCount; unsupported skipped: $skippedUnsupportedWebParts)"
            }
        }

        $publishPage = $false
        $publishPageSetting = Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'publish'
        if ($null -ne $publishPageSetting -and [bool]$publishPageSetting) {
            $publishPage = $true
        }

        Finalize-PageProvisioning -PageName $pageName -PublishPage $publishPage -SiteConnection $SiteConnection

        Write-Step "Page available at $($siteDefinition.Url)/SitePages/$pageName"
    }
    catch {
        $failedPage = Get-PnPPage -Identity $pageName -Connection $SiteConnection -ErrorAction SilentlyContinue
        if ($null -ne $failedPage) {
            Write-Step "Removing partially provisioned page $pageName after failure"
            Unlock-PageForReplacement -PageName $pageName -SiteConnection $SiteConnection
            Remove-PnPPage -Identity $pageName -Connection $SiteConnection -Force -ErrorAction SilentlyContinue
        }

        throw
    }
}

function Remove-TestSite {
    param(
        [Parameter(Mandatory = $true)][string]$SiteUrl,
        [Parameter(Mandatory = $true)]$AdminConnection
    )

    Write-Step "Deleting site $SiteUrl"
    Remove-PnPTenantSite -Identity $SiteUrl -Connection $AdminConnection -Force
}

Ensure-PnPModule

$scenarioFullPath = Resolve-AbsolutePath -Path $ScenarioPath -BasePath (Get-Location).Path
$scenarioDirectory = Split-Path -Path $scenarioFullPath -Parent
$scenario = Read-JsonFile -Path $scenarioFullPath
$authSettings = Get-AuthSettings -Scenario $scenario -HasTenantUrlOverride $PSBoundParameters.ContainsKey('TenantUrl') -HasClientIdOverride $PSBoundParameters.ContainsKey('ClientId') -HasAdminUrlOverride $PSBoundParameters.ContainsKey('AdminUrl')
$searchPartsRoot = Get-SearchPartsRoot
$siteDefinition = Get-SiteDefinition -Scenario $scenario
$packageSettings = Get-PackageSettings -Scenario $scenario -ScenarioDirectory $scenarioDirectory -SearchPartsRoot $searchPartsRoot
$resolvedAdminUrl = Get-AdminUrl -BaseTenantUrl $authSettings.TenantUrl -ConfiguredAdminUrl $authSettings.AdminUrl

if (-not $SkipBuild) {
    Invoke-SearchPartsBuild -SearchPartsRoot $searchPartsRoot
}

$adminConnection = Connect-InteractivePnP -Url $resolvedAdminUrl -ResolvedClientId $authSettings.ClientId

if ($DeleteSite) {
    Remove-TestSite -SiteUrl $siteDefinition.Url -AdminConnection $adminConnection
    return
}

if (-not $SkipSiteCreation) {
    Ensure-TestSite -SiteDefinition $siteDefinition -AdminConnection $adminConnection
}

if (-not $SkipAppCatalog) {
    Ensure-SiteCollectionAppCatalog -SiteUrl $siteDefinition.Url -AdminConnection $adminConnection
}

$siteConnection = Connect-InteractivePnP -Url $siteDefinition.Url -ResolvedClientId $authSettings.ClientId

if (-not $SkipAppDeployment) {
    Publish-SolutionToSiteCatalog -PackageSettings $packageSettings -SiteConnection $siteConnection | Out-Null
}

if (-not $SkipPageProvisioning -and -not $SkipWebPartProvisioning) {
    $siteAppReadiness = Test-SiteAppReadiness -PackageSettings $packageSettings -SiteConnection $siteConnection
    if (-not $siteAppReadiness.IsReady) {
        throw "$($siteAppReadiness.Reason) Re-run without -SkipAppDeployment so the package is uploaded, published, and installed for this site before page provisioning."
    }
}

if (-not $SkipPageProvisioning) {
    foreach ($pageDefinition in $scenario.pages) {
        Ensure-Page -PageDefinition $pageDefinition -SiteConnection $siteConnection
    }
}

Write-Step 'Provisioning completed successfully'