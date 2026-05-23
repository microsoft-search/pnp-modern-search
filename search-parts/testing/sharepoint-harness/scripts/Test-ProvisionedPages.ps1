[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [switch]$ResolveLatestPageNames,

    [switch]$FailOnUnexpectedWebParts
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:KnownComponents = @{
    'search-box' = @{
        alias = 'pnpSearchBoxWebPart'
        id = '544c1372-7e5a-49ec-8db6-812f76c375f2'
    }
    'search-results' = @{
        alias = 'pnpSearchResultsWebPart'
        id = '544c1372-42df-47c3-94d6-017428cd2baf'
    }
    'search-filters' = @{
        alias = 'pnpSearchFiltersWebPart'
        id = '544c1372-fb1d-4e96-bc1e-31fd66979667'
    }
    'search-verticals' = @{
        alias = 'pnpSearchVerticalsWebPart'
        id = '544c1372-77ae-40a0-9095-805ae2a0d5e9'
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

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 100
}

function Ensure-PnPModule {
    if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
        throw 'PnP.PowerShell is not installed. Install it with: Install-Module PnP.PowerShell -Scope CurrentUser'
    }

    Import-Module PnP.PowerShell -ErrorAction Stop | Out-Null
}

function Get-AuthSettings {
    param(
        [Parameter(Mandatory = $true)]$Scenario,
        [Parameter(Mandatory = $true)][bool]$HasClientIdOverride
    )

    $scenarioAuth = $null
    if ($null -ne $Scenario.auth) {
        $scenarioAuth = $Scenario.auth
    }

    $scenarioClientId = $null
    if ($null -ne $scenarioAuth) {
        $scenarioClientId = $scenarioAuth.PSObject.Properties['clientId']
    }

    $resolvedClientId = $ClientId
    if (-not $HasClientIdOverride -and $null -ne $scenarioClientId -and -not [string]::IsNullOrWhiteSpace([string]$scenarioClientId.Value)) {
        $resolvedClientId = [string]$scenarioClientId.Value
    }

    if ([string]::IsNullOrWhiteSpace($resolvedClientId)) {
        throw 'A PnP client id must be provided either via -ClientId or scenario.auth.clientId.'
    }

    return [pscustomobject]@{
        ClientId = $resolvedClientId
    }
}

function Get-SiteDefinition {
    param([Parameter(Mandatory = $true)]$Scenario)

    if ($null -eq $Scenario.site) {
        throw 'The scenario must contain a site object.'
    }

    if ([string]::IsNullOrWhiteSpace([string]$Scenario.site.url)) {
        throw 'scenario.site.url is required.'
    }

    return [pscustomobject]@{
        Url = [string]$Scenario.site.url
    }
}

function Connect-InteractivePnP {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$ResolvedClientId
    )

    return Connect-PnPOnline -Url $Url -Interactive -ClientId $ResolvedClientId -ReturnConnection
}

function Resolve-PageName {
    param(
        [Parameter(Mandatory = $true)][string]$ConfiguredPageName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($ConfiguredPageName)
    $extension = [System.IO.Path]::GetExtension($ConfiguredPageName)
    $escapedBaseName = [regex]::Escape($baseName)
    $escapedExtension = [regex]::Escape($extension)
    $pageNamePattern = "^$escapedBaseName(?:-\d{8}-\d{6})?$escapedExtension$"

    $matchingPage = @(
        Get-PnPListItem -List 'Site Pages' -PageSize 200 -Fields 'FileLeafRef', 'Modified' -Connection $SiteConnection |
            Where-Object {
                $fileLeafRef = [string]$_.FieldValues['FileLeafRef']
                $fileLeafRef -match $pageNamePattern
            } |
            Sort-Object {
                $_.FieldValues['Modified']
            } -Descending
    ) | Select-Object -First 1

    if ($null -eq $matchingPage) {
        return $ConfiguredPageName
    }

    return [string]$matchingPage.FieldValues['FileLeafRef']
}

function Resolve-ComponentDescriptor {
    param([Parameter(Mandatory = $true)]$WebPart)

    if ($null -ne $WebPart.componentId -and -not [string]::IsNullOrWhiteSpace([string]$WebPart.componentId)) {
        return [pscustomobject]@{
            Id = [string]$WebPart.componentId
            Alias = [string]$WebPart.componentAlias
        }
    }

    if ($null -ne $WebPart.componentAlias -and -not [string]::IsNullOrWhiteSpace([string]$WebPart.componentAlias)) {
        return [pscustomobject]@{
            Id = $null
            Alias = [string]$WebPart.componentAlias
        }
    }

    if ($null -ne $WebPart.componentKey -and -not [string]::IsNullOrWhiteSpace([string]$WebPart.componentKey)) {
        $knownComponent = $script:KnownComponents[[string]$WebPart.componentKey]
        if ($null -eq $knownComponent) {
            throw "Unknown componentKey '$($WebPart.componentKey)'."
        }

        return [pscustomobject]@{
            Id = [string]$knownComponent.id
            Alias = [string]$knownComponent.alias
        }
    }

    throw 'Each web part must define componentId, componentAlias, or componentKey.'
}

function Get-ComponentIdentityValues {
    param([Parameter(Mandatory = $true)]$Component)

    $values = [System.Collections.Generic.List[string]]::new()

    foreach ($propertyName in 'Id', 'DefinitionId', 'Name', 'Title') {
        $property = $Component.PSObject.Properties[$propertyName]
        if ($null -ne $property -and -not [string]::IsNullOrWhiteSpace([string]$property.Value)) {
            $values.Add([string]$property.Value)
        }
    }

    return $values
}

function Get-ExpectedComponentLabel {
    param([Parameter(Mandatory = $true)]$Descriptor)

    if (-not [string]::IsNullOrWhiteSpace([string]$Descriptor.Alias)) {
        return [string]$Descriptor.Alias
    }

    return [string]$Descriptor.Id
}

function Find-MatchingComponentIndex {
    param(
        [Parameter(Mandatory = $true)]$Components,
        [Parameter(Mandatory = $true)]$Descriptor
    )

    for ($index = 0; $index -lt $Components.Count; $index++) {
        $componentValues = Get-ComponentIdentityValues -Component $Components[$index]

        if (-not [string]::IsNullOrWhiteSpace([string]$Descriptor.Id) -and $componentValues.Contains([string]$Descriptor.Id)) {
            return $index
        }

        if (-not [string]::IsNullOrWhiteSpace([string]$Descriptor.Alias) -and $componentValues.Contains([string]$Descriptor.Alias)) {
            return $index
        }
    }

    return -1
}

function Get-ComponentDisplayLabel {
    param([Parameter(Mandatory = $true)]$Component)

    foreach ($propertyName in 'Title', 'Name', 'DefinitionId', 'Id') {
        $property = $Component.PSObject.Properties[$propertyName]
        if ($null -ne $property -and -not [string]::IsNullOrWhiteSpace([string]$property.Value)) {
            return [string]$property.Value
        }
    }

    return '<unknown component>'
}

function Test-PageDefinition {
    param(
        [Parameter(Mandatory = $true)]$PageDefinition,
        [Parameter(Mandatory = $true)]$SiteConnection,
        [Parameter(Mandatory = $true)]$Failures
    )

    $configuredPageName = [string]$PageDefinition.name
    if ([string]::IsNullOrWhiteSpace($configuredPageName)) {
        $Failures.Add('Encountered a page definition without a name.') | Out-Null
        return
    }

    $pageName = if ($ResolveLatestPageNames) {
        Resolve-PageName -ConfiguredPageName $configuredPageName -SiteConnection $SiteConnection
    }
    else {
        $configuredPageName
    }

    $page = Get-PnPPage -Identity $pageName -Connection $SiteConnection -ErrorAction SilentlyContinue
    if ($null -eq $page) {
        $Failures.Add("Page '$pageName' was not found.") | Out-Null
        return
    }

    $components = [System.Collections.Generic.List[object]]::new()
    foreach ($component in @(Get-PnPPageComponent -Page $pageName -Connection $SiteConnection)) {
        $components.Add($component)
    }

    $expectedWebParts = @($PageDefinition.webParts)
    foreach ($webPartDefinition in $expectedWebParts) {
        $descriptor = Resolve-ComponentDescriptor -WebPart $webPartDefinition
        $matchIndex = Find-MatchingComponentIndex -Components $components -Descriptor $descriptor

        if ($matchIndex -lt 0) {
            $Failures.Add("Page '$pageName' is missing expected web part '$((Get-ExpectedComponentLabel -Descriptor $descriptor))'.") | Out-Null
            continue
        }

        $components.RemoveAt($matchIndex)
    }

    if ($FailOnUnexpectedWebParts -and $components.Count -gt 0) {
        $unexpectedLabels = @($components | ForEach-Object { Get-ComponentDisplayLabel -Component $_ }) -join ', '
        $Failures.Add("Page '$pageName' contains unexpected web parts: $unexpectedLabels") | Out-Null
        return
    }

    Write-Step "Validated page $pageName"
}

Ensure-PnPModule

$scenarioFullPath = Resolve-AbsolutePath -Path $ScenarioPath -BasePath (Get-Location).Path
$scenario = Read-JsonFile -Path $scenarioFullPath
$authSettings = Get-AuthSettings -Scenario $scenario -HasClientIdOverride $PSBoundParameters.ContainsKey('ClientId')
$siteDefinition = Get-SiteDefinition -Scenario $scenario

Write-Step "Connecting to $($siteDefinition.Url)"
$siteConnection = Connect-InteractivePnP -Url $siteDefinition.Url -ResolvedClientId $authSettings.ClientId

$failures = [System.Collections.Generic.List[string]]::new()
foreach ($pageDefinition in @($scenario.pages)) {
    Test-PageDefinition -PageDefinition $pageDefinition -SiteConnection $siteConnection -Failures $failures
}

if ($failures.Count -gt 0) {
    Write-Host ''
    Write-Host 'Smoke test failed:' -ForegroundColor Red
    foreach ($failure in $failures) {
        Write-Host " - $failure" -ForegroundColor Red
    }

    exit 1
}

Write-Step 'Smoke test completed successfully'