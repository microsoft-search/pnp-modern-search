[CmdletBinding()]
param(
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl,

    [string]$AdminUrl,

    [string]$SiteUrl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-TemporaryScenarioPath {
    param(
        [Parameter(Mandatory = $true)][string]$ResolvedSiteUrl,
        [Parameter(Mandatory = $true)][string]$ResolvedTenantUrl,
        [string]$ResolvedClientId
    )

    $siteUri = [System.Uri]$ResolvedSiteUrl
    $siteTitle = [string](Split-Path -Path $siteUri.AbsolutePath -Leaf)
    if ([string]::IsNullOrWhiteSpace($siteTitle)) {
        $siteTitle = 'Test Site'
    }

    $scenario = [ordered]@{
        auth = [ordered]@{
            tenantUrl = $ResolvedTenantUrl
        }
        site = [ordered]@{
            url = $ResolvedSiteUrl
            title = $siteTitle
            type = 'CommunicationSite'
            description = ''
        }
        package = [ordered]@{
            path = '../../sharepoint/solution/pnp-modern-search-parts-v4.sppkg'
            skipFeatureDeployment = $true
        }
        pages = @()
    }

    if (-not [string]::IsNullOrWhiteSpace($ResolvedClientId)) {
        $scenario.auth.clientId = $ResolvedClientId
    }

    $tempPath = [System.IO.Path]::ChangeExtension([System.IO.Path]::GetTempFileName(), '.json')
    ($scenario | ConvertTo-Json -Depth 20) | Set-Content -LiteralPath $tempPath -Encoding utf8
    return $tempPath
}

$provisionScriptPath = Join-Path $PSScriptRoot 'Provision-TestEnvironment.ps1'

$scenarioPathToUse = $ScenarioPath
$temporaryScenarioPath = $null

if ([string]::IsNullOrWhiteSpace($scenarioPathToUse)) {
    if ([string]::IsNullOrWhiteSpace($SiteUrl)) {
        throw 'SiteUrl is required when ScenarioPath is not provided.'
    }

    $resolvedTenantUrl = if (-not [string]::IsNullOrWhiteSpace($TenantUrl)) {
        $TenantUrl
    }
    else {
        $siteUriForTenant = [System.Uri]$SiteUrl
        "$($siteUriForTenant.Scheme)://$($siteUriForTenant.Host)"
    }

    $temporaryScenarioPath = New-TemporaryScenarioPath -ResolvedSiteUrl $SiteUrl -ResolvedTenantUrl $resolvedTenantUrl -ResolvedClientId $ClientId
    $scenarioPathToUse = $temporaryScenarioPath
}

$provisionParameters = @{
    ScenarioPath = $scenarioPathToUse
    SkipBuild = $true
    SkipAppDeployment = $true
    SkipPageProvisioning = $true
}

if (-not [string]::IsNullOrWhiteSpace($ClientId)) {
    $provisionParameters.ClientId = $ClientId
}

if (-not [string]::IsNullOrWhiteSpace($TenantUrl)) {
    $provisionParameters.TenantUrl = $TenantUrl
}

if (-not [string]::IsNullOrWhiteSpace($AdminUrl)) {
    $provisionParameters.AdminUrl = $AdminUrl
}

if (-not [string]::IsNullOrWhiteSpace($SiteUrl)) {
    $provisionParameters.SiteUrl = $SiteUrl
}

try {
    & $provisionScriptPath @provisionParameters
}
finally {
    if (-not [string]::IsNullOrWhiteSpace($temporaryScenarioPath) -and (Test-Path -LiteralPath $temporaryScenarioPath -PathType Leaf)) {
        Remove-Item -LiteralPath $temporaryScenarioPath -Force -ErrorAction SilentlyContinue
    }
}