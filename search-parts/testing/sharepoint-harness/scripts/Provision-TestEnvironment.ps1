[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl = "https://tcwlv.sharepoint.com",

    [string]$AdminUrl,

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

    return Connect-PnPOnline -Url $Url -Interactive -ClientId $ResolvedClientId -ReturnConnection
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

    $siteUrl = Get-OptionalPropertyValue -Object $site -PropertyName 'url'
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

    Remove-StaleSiteAppPackage -PackageSettings $PackageSettings -PackagePath $resolvedPackagePath -SiteConnection $SiteConnection

    Write-Step "Uploading package $resolvedPackagePath"
    $uploadedApp = Add-PnPApp -Path $resolvedPackagePath -Scope Site -Overwrite -Connection $SiteConnection

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

function Find-AvailableComponent {
    param(
        [Parameter(Mandatory = $true)]$AvailableComponents,
        [Parameter(Mandatory = $true)]$Descriptor
    )

    foreach ($component in $AvailableComponents) {
        $componentId = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Id')
        $definitionId = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'DefinitionId')
        $name = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Name')
        $title = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Title')

        if ($Descriptor.Id -and ($componentId -eq $Descriptor.Id -or $definitionId -eq $Descriptor.Id)) {
            return $component
        }

        if ($Descriptor.Alias -and ($name -eq $Descriptor.Alias -or $title -eq $Descriptor.Alias)) {
            return $component
        }

        if ($Descriptor.Title -and $title -eq $Descriptor.Title) {
            return $component
        }
    }

    $identity = if ($Descriptor.Id) { $Descriptor.Id } else { $Descriptor.Alias }
    throw "Unable to find a page component matching '$identity'."
}

function Wait-ForAvailableComponent {
    param(
        [Parameter(Mandatory = $true)]$Page,
        [Parameter(Mandatory = $true)]$Descriptor,
        [Parameter(Mandatory = $true)]$SiteConnection,
        [int]$RetryCount = 12,
        [int]$RetryDelaySeconds = 5
    )

    $componentLabel = if (-not [string]::IsNullOrWhiteSpace([string]$Descriptor.Alias)) {
        [string]$Descriptor.Alias
    }
    else {
        [string]$Descriptor.Id
    }

    $lastError = $null
    for ($attempt = 1; $attempt -le $RetryCount; $attempt++) {
        $availableComponents = @(Get-PnPPageComponent -Page $Page -ListAvailable -Connection $SiteConnection -ErrorAction SilentlyContinue)

        try {
            $component = Find-AvailableComponent -AvailableComponents $availableComponents -Descriptor $Descriptor
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
        $latestAvailableComponents = @(Get-PnPPageComponent -Page $Page -ListAvailable -Connection $SiteConnection -ErrorAction SilentlyContinue)
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

function Ensure-PageSections {
    param(
        [Parameter(Mandatory = $true)]$Page,
        [Parameter(Mandatory = $true)]$PageDefinition,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $sectionIndex = 1
    foreach ($section in @(Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'sections')) {
        $sectionParams = @{
            Page = $Page
            SectionTemplate = [string](Get-OptionalPropertyValue -Object $section -PropertyName 'template')
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
        [Parameter(Mandatory = $true)]$Page,
        [Parameter(Mandatory = $true)]$WebPartDefinition,
        [Parameter(Mandatory = $true)]$AvailableComponents,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $descriptor = Resolve-ComponentDescriptor -WebPart $WebPartDefinition
    $component = Find-AvailableComponent -AvailableComponents $AvailableComponents -Descriptor $descriptor

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
        $addParams.WebPartProperties = $propertiesJson
    }

    Add-PnPPageWebPart @addParams | Out-Null
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

        if ($null -ne (Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'sections')) {
            Ensure-PageSections -Page $page -PageDefinition $PageDefinition -SiteConnection $SiteConnection
        }

        $pageWebParts = @(Get-OptionalPropertyValue -Object $PageDefinition -PropertyName 'webParts')
        if ($SkipWebPartProvisioning) {
            Write-Step "Skipping web part provisioning for page $pageName"
        }
        else {
            foreach ($webPart in $pageWebParts) {
                $descriptor = Resolve-ComponentDescriptor -WebPart $webPart
                $componentResolution = Wait-ForAvailableComponent -Page $page -Descriptor $descriptor -SiteConnection $SiteConnection
                Add-ConfiguredWebPart -Page $page -WebPartDefinition $webPart -AvailableComponents $componentResolution.AvailableComponents -SiteConnection $SiteConnection
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