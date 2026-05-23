[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl,

    [string]$AdminUrl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$provisionScriptPath = Join-Path $PSScriptRoot 'Provision-TestEnvironment.ps1'

$provisionParameters = @{
    ScenarioPath = $ScenarioPath
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

& $provisionScriptPath @provisionParameters