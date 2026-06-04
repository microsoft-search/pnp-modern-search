[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl,

    [string]$AdminUrl,

    [string]$SiteUrl,

    [switch]$UseUniquePageNames,

    [switch]$Force,

    [switch]$SkipAppDeployment,

    [switch]$SkipWebPartProvisioning
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$provisionScriptPath = Join-Path $PSScriptRoot 'Provision-TestEnvironment.ps1'

$provisionParameters = @{
    ScenarioPath = $ScenarioPath
    SkipBuild = $true
    SkipSiteCreation = $true
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

if ($UseUniquePageNames) {
    $provisionParameters.UseUniquePageNames = $true
}

if ($Force) {
    $provisionParameters.Force = $true
}

if ($SkipAppDeployment) {
    $provisionParameters.SkipAppDeployment = $true
}

if ($SkipWebPartProvisioning) {
    $provisionParameters.SkipWebPartProvisioning = $true
}

& $provisionScriptPath @provisionParameters