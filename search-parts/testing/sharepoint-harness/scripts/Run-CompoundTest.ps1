[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl,

    [string]$AdminUrl,

    [string]$SiteUrl,

    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PSScriptPath = $PSScriptRoot

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-StepHeader {
    param([int]$Number, [string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host ('=' * 60) -ForegroundColor DarkCyan
    Write-Host "  Step ${Number}: ${Title}" -ForegroundColor White
    Write-Host ('=' * 60) -ForegroundColor DarkCyan
}

$commonArgs = @{
    ScenarioPath = $ScenarioPath
}

if (-not [string]::IsNullOrWhiteSpace($ClientId))  { $commonArgs.ClientId  = $ClientId  }
if (-not [string]::IsNullOrWhiteSpace($TenantUrl)) { $commonArgs.TenantUrl = $TenantUrl }
if (-not [string]::IsNullOrWhiteSpace($AdminUrl))  { $commonArgs.AdminUrl  = $AdminUrl  }
if (-not [string]::IsNullOrWhiteSpace($SiteUrl))   { $commonArgs.SiteUrl   = $SiteUrl   }

# ---------------------------------------------------------------------------
# Step 1: Build the solution package
# ---------------------------------------------------------------------------
Write-StepHeader -Number 1 -Title 'Build Solution Package'
& (Join-Path $PSScriptPath 'Build-SolutionPackage.ps1')
Write-Step 'Build completed.'

# ---------------------------------------------------------------------------
# Step 2: Ensure the test site exists and app catalog is enabled
# ---------------------------------------------------------------------------
Write-StepHeader -Number 2 -Title 'Ensure Test Site'
$ensureArgs = @{}
if (-not [string]::IsNullOrWhiteSpace($ClientId))  { $ensureArgs.ClientId  = $ClientId  }
if (-not [string]::IsNullOrWhiteSpace($TenantUrl)) { $ensureArgs.TenantUrl = $TenantUrl }
if (-not [string]::IsNullOrWhiteSpace($AdminUrl))  { $ensureArgs.AdminUrl  = $AdminUrl  }
if (-not [string]::IsNullOrWhiteSpace($SiteUrl))   { $ensureArgs.SiteUrl   = $SiteUrl   }
& (Join-Path $PSScriptPath 'Ensure-TestSite.ps1') @ensureArgs
Write-Step 'Test site ready.'

# ---------------------------------------------------------------------------
# Step 3: Deploy the site package
# ---------------------------------------------------------------------------
Write-StepHeader -Number 3 -Title 'Deploy Site Package'
& (Join-Path $PSScriptPath 'Deploy-SitePackage.ps1') @ensureArgs
Write-Step 'Site package deployed.'

# ---------------------------------------------------------------------------
# Step 4: Provision test pages
# ---------------------------------------------------------------------------
Write-StepHeader -Number 4 -Title 'Provision Test Pages'
$pageArgs = @{} + $commonArgs
if ($Force) { $pageArgs.Force = $true }
& (Join-Path $PSScriptPath 'Provision-TestPages.ps1') @pageArgs
Write-Step 'Test pages provisioned.'

# ---------------------------------------------------------------------------
# Step 5: Smoke test provisioned pages
# ---------------------------------------------------------------------------
Write-StepHeader -Number 5 -Title 'Smoke Test Provisioned Pages'
$smokeArgs = @{}
foreach ($entry in $commonArgs.GetEnumerator()) {
    if ($entry.Key -in @('ScenarioPath', 'ClientId', 'SiteUrl')) {
        $smokeArgs[$entry.Key] = $entry.Value
    }
}

& (Join-Path $PSScriptPath 'Test-ProvisionedPages.ps1') @smokeArgs
Write-Step 'Smoke test passed.'

Write-Host ''
Write-Host ('=' * 60) -ForegroundColor Green
Write-Host '  Compound test completed successfully.' -ForegroundColor Green
Write-Host ('=' * 60) -ForegroundColor Green
