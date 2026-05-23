[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl = 'https://tcwlv.sharepoint.com',

    [string]$DevServerUrl = 'https://localhost:4321',

    [string]$ManifestsPath = '/temp/build/manifests.js',

    [switch]$ResolveLatestPageNames,

    [switch]$Open
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-AbsolutePath {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$BasePath
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

function Get-OptionalPropertyValue {
    param(
        [Parameter(Mandatory = $false)]$Object,
        [Parameter(Mandatory = $true)][string]$PropertyName
    )

    if ($null -eq $Object) {
        return $null
    }

    if ($Object -is [System.Collections.IDictionary]) {
        $keys = $Object.Keys
        if ($null -ne $keys -and $keys -contains $PropertyName) {
            return $Object[$PropertyName]
        }

        return $null
    }

    $keysProperty = $Object.PSObject.Properties['Keys']
    if ($null -ne $keysProperty) {
        $keys = $keysProperty.Value
        if ($null -ne $keys -and $keys -contains $PropertyName) {
            return $Object[$PropertyName]
        }

        return $null
    }

    $containsKeyMethod = $Object.PSObject.Methods['ContainsKey']
    if ($null -ne $containsKeyMethod) {
        if ([bool]$Object.ContainsKey($PropertyName)) {
            return $Object[$PropertyName]
        }

        return $null
    }

    $property = $Object.PSObject.Properties[$PropertyName]
    if ($null -eq $property) {
        return $null
    }

    return $property.Value
}

function Get-AuthSettings {
    param(
        [Parameter(Mandatory = $true)]$Scenario,
        [Parameter(Mandatory = $true)][bool]$HasTenantUrlOverride,
        [Parameter(Mandatory = $true)][bool]$HasClientIdOverride
    )

    $scenarioAuth = Get-OptionalPropertyValue -Object $Scenario -PropertyName 'auth'
    $resolvedTenantUrl = $TenantUrl
    $resolvedClientId = $ClientId

    if (-not $HasTenantUrlOverride) {
        $scenarioTenantUrl = Get-OptionalPropertyValue -Object $scenarioAuth -PropertyName 'tenantUrl'
        if (-not [string]::IsNullOrWhiteSpace([string]$scenarioTenantUrl)) {
            $resolvedTenantUrl = [string]$scenarioTenantUrl
        }
    }

    if (-not $HasClientIdOverride) {
        $scenarioClientId = Get-OptionalPropertyValue -Object $scenarioAuth -PropertyName 'clientId'
        if (-not [string]::IsNullOrWhiteSpace([string]$scenarioClientId)) {
            $resolvedClientId = [string]$scenarioClientId
        }
    }

    return [pscustomobject]@{
        TenantUrl = $resolvedTenantUrl
        ClientId = $resolvedClientId
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
                $fileLeafRef = [string](Get-OptionalPropertyValue -Object $_.FieldValues -PropertyName 'FileLeafRef')
                $fileLeafRef -match $pageNamePattern
            } |
            Sort-Object {
                Get-OptionalPropertyValue -Object $_.FieldValues -PropertyName 'Modified'
            } -Descending
    ) | Select-Object -First 1

    if ($null -eq $matchingPage) {
        throw "Unable to resolve a provisioned page for '$ConfiguredPageName'."
    }

    return [string](Get-OptionalPropertyValue -Object $matchingPage.FieldValues -PropertyName 'FileLeafRef')
}

$scenarioFullPath = Resolve-AbsolutePath -Path $ScenarioPath -BasePath (Get-Location).Path
$scenario = Read-JsonFile -Path $scenarioFullPath
$authSettings = Get-AuthSettings -Scenario $scenario -HasTenantUrlOverride $PSBoundParameters.ContainsKey('TenantUrl') -HasClientIdOverride $PSBoundParameters.ContainsKey('ClientId')

$site = Get-OptionalPropertyValue -Object $scenario -PropertyName 'site'
$siteUrl = [string](Get-OptionalPropertyValue -Object $site -PropertyName 'url')
if ([string]::IsNullOrWhiteSpace($siteUrl)) {
    throw 'scenario.site.url is required.'
}

$manifestBaseUrl = $DevServerUrl.TrimEnd('/')
$manifestRelativePath = if ($ManifestsPath.StartsWith('/')) { $ManifestsPath } else { "/$ManifestsPath" }
$debugManifestsUrl = "$manifestBaseUrl$manifestRelativePath"
$encodedDebugManifestsUrl = [System.Uri]::EscapeDataString($debugManifestsUrl)

$siteConnection = $null
if ($ResolveLatestPageNames) {
    if ([string]::IsNullOrWhiteSpace([string]$authSettings.ClientId)) {
        throw 'A PnP client id is required to resolve the latest provisioned page names.'
    }

    Import-Module PnP.PowerShell -ErrorAction Stop | Out-Null
    $siteConnection = Connect-InteractivePnP -Url $siteUrl -ResolvedClientId $authSettings.ClientId
}

$results = foreach ($pageDefinition in @($scenario.pages)) {
    $configuredPageName = [string](Get-OptionalPropertyValue -Object $pageDefinition -PropertyName 'name')
    if ([string]::IsNullOrWhiteSpace($configuredPageName)) {
        continue
    }

    $resolvedPageName = if ($ResolveLatestPageNames) {
        Resolve-PageName -ConfiguredPageName $configuredPageName -SiteConnection $siteConnection
    }
    else {
        $configuredPageName
    }

    $pageUrl = "$siteUrl/SitePages/$resolvedPageName"
    $separator = if ($pageUrl.Contains('?')) { '&' } else { '?' }
    $debugUrl = "$pageUrl${separator}loadSPFX=true&debugManifestsFile=$encodedDebugManifestsUrl"

    [pscustomobject]@{
        ConfiguredPageName = $configuredPageName
        ResolvedPageName = $resolvedPageName
        DebugUrl = $debugUrl
    }
}

$results

if ($Open) {
    foreach ($result in $results) {
        Start-Process $result.DebugUrl
    }
}