[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [string]$TenantUrl,

    [string]$AdminUrl,

    [string]$SiteUrl,

    [string[]]$Tests = @('all'),

    [switch]$UseUniquePageNames,

    [switch]$Force,

    [switch]$SkipWebPartProvisioning,

    [switch]$FailOnUnexpectedWebParts,

    [string]$ResultsPath,

    [switch]$ListTests
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string]$Message)

    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

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

function New-DefaultResultsPath {
    $harnessRoot = Split-Path -Path $PSScriptRoot -Parent
    $resultsDirectory = Join-Path $harnessRoot 'results'
    if (-not (Test-Path -LiteralPath $resultsDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $resultsDirectory -Force | Out-Null
    }

    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    return Join-Path $resultsDirectory "harness-results-$timestamp.json"
}

function Write-ResultsFile {
    param(
        [Parameter(Mandatory = $true)]$RunState,
        [Parameter(Mandatory = $true)][string]$OutputPath
    )

    $outputDirectory = Split-Path -Path $OutputPath -Parent
    if (-not [string]::IsNullOrWhiteSpace($outputDirectory) -and -not (Test-Path -LiteralPath $outputDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    }

    $RunState | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $OutputPath -Encoding utf8
}

    function Get-ProvisionBatchTests {
        param([Parameter(Mandatory = $true)][string[]]$SelectedTests)

        return @($SelectedTests | Where-Object { $_ -in @('site', 'package', 'pages') })
    }

    function Invoke-ProvisionBatch {
        param(
            [Parameter(Mandatory = $true)][string[]]$BatchTests,
            [Parameter(Mandatory = $true)]$CommonParameters,
            [Parameter(Mandatory = $true)][bool]$UseUniquePageNamesValue,
            [Parameter(Mandatory = $true)][bool]$ForceValue,
            [Parameter(Mandatory = $true)][bool]$SkipWebPartProvisioningValue
        )

        $provisionParameters = @{
            ScenarioPath = $CommonParameters.ScenarioPath
            SkipBuild = $true
            SkipSiteCreation = -not ($BatchTests -contains 'site')
            SkipAppCatalog = -not ($BatchTests -contains 'site')
            SkipAppDeployment = -not ($BatchTests -contains 'package')
            SkipPageProvisioning = -not ($BatchTests -contains 'pages')
        }

        foreach ($parameterName in @('ClientId', 'TenantUrl', 'AdminUrl', 'SiteUrl')) {
            if ($CommonParameters.ContainsKey($parameterName) -and -not [string]::IsNullOrWhiteSpace([string]$CommonParameters[$parameterName])) {
                $provisionParameters[$parameterName] = $CommonParameters[$parameterName]
            }
        }

        if ($UseUniquePageNamesValue) {
            $provisionParameters.UseUniquePageNames = $true
        }

        if ($ForceValue) {
            $provisionParameters.Force = $true
        }

        if ($SkipWebPartProvisioningValue) {
            $provisionParameters.SkipWebPartProvisioning = $true
        }

        & (Join-Path $PSScriptRoot 'Provision-TestEnvironment.ps1') @provisionParameters
    }

$availableTests = [ordered]@{
    build = 'Build the current SPFx .sppkg package'
    site = 'Create or reuse the test site and enable the site collection app catalog'
    package = 'Upload, publish, and install the current package to the site app catalog'
    pages = 'Provision pages from the scenario'
    smoke = 'Validate provisioned pages and expected web parts'
    inspect = 'Inspect the latest provisioned pages and page component state'
    'debug-urls' = 'Generate local debug-manifest URLs for the scenario pages'
}

$defaultTests = @('build', 'site', 'package', 'pages', 'smoke')

Write-Host 'Available tests:' -ForegroundColor Yellow
foreach ($entry in $availableTests.GetEnumerator()) {
    Write-Host ("  {0,-10} {1}" -f $entry.Key, $entry.Value)
}
Write-Host ("  {0,-10} {1}" -f 'all', ('Run default set: ' + ($defaultTests -join ', ')))

if ($ListTests) {
    return
}

$selectedTests = [System.Collections.Generic.List[string]]::new()
foreach ($requestedTest in $Tests) {
    foreach ($testToken in @([string]$requestedTest -split ',')) {
        $normalizedTest = $testToken.Trim()
        if ([string]::IsNullOrWhiteSpace($normalizedTest)) {
            continue
        }

        if ($normalizedTest -eq 'all') {
            foreach ($defaultTest in $defaultTests) {
                if (-not $selectedTests.Contains($defaultTest)) {
                    $selectedTests.Add($defaultTest)
                }
            }

            continue
        }

        if (-not $availableTests.Contains($normalizedTest)) {
            throw "Unknown test '$normalizedTest'. Use -ListTests to see the supported values."
        }

        if (-not $selectedTests.Contains($normalizedTest)) {
            $selectedTests.Add($normalizedTest)
        }
    }
}

if ($selectedTests.Count -eq 0) {
    throw 'No tests were selected.'
}

Write-Step ("Selected tests: " + ($selectedTests -join ', '))

$resolvedResultsPath = if ([string]::IsNullOrWhiteSpace($ResultsPath)) {
    New-DefaultResultsPath
}
else {
    Resolve-AbsolutePath -Path $ResultsPath -BasePath (Get-Location).Path
}

$invokeCommonParameters = @{}
if (-not [string]::IsNullOrWhiteSpace($ScenarioPath)) {
    $invokeCommonParameters.ScenarioPath = $ScenarioPath
}

if (-not [string]::IsNullOrWhiteSpace($ClientId)) {
    $invokeCommonParameters.ClientId = $ClientId
}

if (-not [string]::IsNullOrWhiteSpace($TenantUrl)) {
    $invokeCommonParameters.TenantUrl = $TenantUrl
}

if (-not [string]::IsNullOrWhiteSpace($AdminUrl)) {
    $invokeCommonParameters.AdminUrl = $AdminUrl
}

if (-not [string]::IsNullOrWhiteSpace($SiteUrl)) {
    $invokeCommonParameters.SiteUrl = $SiteUrl
}

$runStartedAt = Get-Date
$runState = [ordered]@{
    startedAt = $runStartedAt.ToString('o')
    finishedAt = $null
    status = 'Running'
    scenarioPath = $ScenarioPath
    resolvedResultsPath = $resolvedResultsPath
    selectedTests = @($selectedTests)
    useUniquePageNames = [bool]$UseUniquePageNames
    skipWebPartProvisioning = [bool]$SkipWebPartProvisioning
    tests = [System.Collections.Generic.List[object]]::new()
}

Write-ResultsFile -RunState $runState -OutputPath $resolvedResultsPath

try {
    $provisionBatchTests = Get-ProvisionBatchTests -SelectedTests @($selectedTests)
    $provisionBatchExecuted = $false

    foreach ($selectedTest in $selectedTests) {
        $isProvisionBatchTest = $selectedTest -in @('site', 'package', 'pages')
        if ($isProvisionBatchTest -and $provisionBatchExecuted) {
            continue
        }

        $testStartedAt = Get-Date
        $testsToExecute = if ($isProvisionBatchTest) { @($provisionBatchTests) } else { @($selectedTest) }
        $groupResults = [System.Collections.Generic.List[object]]::new()

        foreach ($testName in $testsToExecute) {
            $testResult = [pscustomobject][ordered]@{
                name = $testName
                description = $availableTests[$testName]
                startedAt = $testStartedAt.ToString('o')
                finishedAt = $null
                durationSeconds = $null
                status = 'Running'
                error = $null
            }

            $runState.tests.Add($testResult) | Out-Null
            $groupResults.Add($testResult) | Out-Null
        }

        Write-ResultsFile -RunState $runState -OutputPath $resolvedResultsPath

        try {
            switch ($selectedTest) {
                'build' {
                    Write-Step 'Running build test'
                    & (Join-Path $PSScriptRoot 'Build-SolutionPackage.ps1')
                }
                'site' {
                    Write-Step ("Running provisioning batch for: " + ($provisionBatchTests -join ', '))
                    Invoke-ProvisionBatch -BatchTests @($provisionBatchTests) -CommonParameters $invokeCommonParameters -UseUniquePageNamesValue ([bool]$UseUniquePageNames) -ForceValue ([bool]$Force) -SkipWebPartProvisioningValue ([bool]$SkipWebPartProvisioning)
                    $provisionBatchExecuted = $true
                }
                'package' {
                    Write-Step ("Running provisioning batch for: " + ($provisionBatchTests -join ', '))
                    Invoke-ProvisionBatch -BatchTests @($provisionBatchTests) -CommonParameters $invokeCommonParameters -UseUniquePageNamesValue ([bool]$UseUniquePageNames) -ForceValue ([bool]$Force) -SkipWebPartProvisioningValue ([bool]$SkipWebPartProvisioning)
                    $provisionBatchExecuted = $true
                }
                'pages' {
                    Write-Step ("Running provisioning batch for: " + ($provisionBatchTests -join ', '))
                    Invoke-ProvisionBatch -BatchTests @($provisionBatchTests) -CommonParameters $invokeCommonParameters -UseUniquePageNamesValue ([bool]$UseUniquePageNames) -ForceValue ([bool]$Force) -SkipWebPartProvisioningValue ([bool]$SkipWebPartProvisioning)
                    $provisionBatchExecuted = $true
                }
                'inspect' {
                    Write-Step 'Running smoke test'
                    $smokeParameters = @{}
                    foreach ($entry in $invokeCommonParameters.GetEnumerator()) {
                        if ($entry.Key -in @('ScenarioPath', 'ClientId', 'SiteUrl')) {
                            $smokeParameters[$entry.Key] = $entry.Value
                        }
                    }

                    if ($FailOnUnexpectedWebParts) {
                        $smokeParameters.FailOnUnexpectedWebParts = $true
                    }

                    if ($UseUniquePageNames) {
                        $smokeParameters.ResolveLatestPageNames = $true
                    }

                    & (Join-Path $PSScriptRoot 'Test-ProvisionedPages.ps1') @smokeParameters
                }
                'inspect' {
                    Write-Step 'Running inspection utility'
                    $inspectParameters = @{}
                    foreach ($entry in $invokeCommonParameters.GetEnumerator()) {
                        if ($entry.Key -in @('ScenarioPath', 'ClientId', 'SiteUrl')) {
                            $inspectParameters[$entry.Key] = $entry.Value
                        }
                    }

                    & (Join-Path $PSScriptRoot 'Inspect-ProvisionedPages.ps1') @inspectParameters
                }
                'debug-urls' {
                    Write-Step 'Generating local debug page URLs'
                    $debugUrlParameters = @{}
                    foreach ($entry in $invokeCommonParameters.GetEnumerator()) {
                        if ($entry.Key -in @('ScenarioPath', 'ClientId', 'TenantUrl', 'SiteUrl')) {
                            $debugUrlParameters[$entry.Key] = $entry.Value
                        }
                    }

                    if ($UseUniquePageNames) {
                        $debugUrlParameters.ResolveLatestPageNames = $true
                    }

                    & (Join-Path $PSScriptRoot 'Get-LocalDebugPageUrls.ps1') @debugUrlParameters
                }
            }

            foreach ($groupResult in $groupResults) {
                $groupResult.status = 'Passed'
            }
        }
        catch {
            foreach ($groupResult in $groupResults) {
                $groupResult.status = 'Failed'
                $groupResult.error = $_.Exception.Message
            }

            $runState.status = 'Failed'
            throw
        }
        finally {
            $testFinishedAt = Get-Date
            foreach ($groupResult in $groupResults) {
                $groupResult.finishedAt = $testFinishedAt.ToString('o')
                $groupResult.durationSeconds = [math]::Round(($testFinishedAt - $testStartedAt).TotalSeconds, 3)
            }

            Write-ResultsFile -RunState $runState -OutputPath $resolvedResultsPath
        }
    }

    if ($runState.status -ne 'Failed') {
        $runState.status = 'Passed'
    }
}
finally {
    $runFinishedAt = Get-Date
    $runState.finishedAt = $runFinishedAt.ToString('o')
    $runState.durationSeconds = [math]::Round(($runFinishedAt - $runStartedAt).TotalSeconds, 3)
    Write-ResultsFile -RunState $runState -OutputPath $resolvedResultsPath
    Write-Step "Structured results written to $resolvedResultsPath"
}