[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl,

    [string]$AdminUrl,

    [string]$SiteUrl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$provisionScriptPath = Join-Path $PSScriptRoot 'Provision-TestEnvironment.ps1'

$provisionParameters = @{
    ScenarioPath = $ScenarioPath
    DeleteSite = $true
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

& $provisionScriptPath @provisionParameters