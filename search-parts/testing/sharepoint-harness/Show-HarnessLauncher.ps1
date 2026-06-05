[CmdletBinding()]
param(
    [switch]$ListActions
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:HarnessActions = @(
    [pscustomobject]@{
        Name = 'Compound Test'
        Description = 'Build solution, ensure test site, deploy package, and provision test pages — all in one step.'
        Script = 'scripts/Run-CompoundTest.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
        SupportsSiteUrl = $true
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $false
        SupportsForce = $true
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Run Harness Tests'
        Description = 'Run the harness test runner with the selected tests and result output.'
        Script = 'scripts/Run-HarnessTests.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
        SupportsSiteUrl = $true
        SupportsTests = $true
        SupportsResultsPath = $true
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $true
        SupportsForce = $true
        SupportsSkipWebPartProvisioning = $true
        SupportsFailOnUnexpectedWebParts = $true
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Provision Test Environment'
        Description = 'Run the full provisioning flow for the current scenario.'
        Script = 'scripts/Provision-TestEnvironment.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
        SupportsSiteUrl = $true
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $true
        SupportsForce = $true
        SupportsSkipWebPartProvisioning = $true
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Build Solution Package'
        Description = 'Build the SPFx package only.'
        Script = 'scripts/Build-SolutionPackage.ps1'
        NeedsScenario = $false
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $false
        SupportsClientId = $false
        SupportsTenantUrl = $false
        SupportsAdminUrl = $false
        SupportsSiteUrl = $false
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $false
        SupportsForce = $false
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Ensure Test Site'
        Description = 'Create or reuse the test site and enable the site collection app catalog.'
        Script = 'scripts/Ensure-TestSite.ps1'
        NeedsScenario = $false
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $false
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
        SupportsSiteUrl = $true
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $false
        SupportsForce = $false
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Deploy Site Package'
        Description = 'Upload, publish, and install the current package to the site app catalog.'
        Script = 'scripts/Deploy-SitePackage.ps1'
        NeedsScenario = $false
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
        SupportsSiteUrl = $true
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $false
        SupportsForce = $false
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Provision Test Pages'
        Description = 'Create the pages from the scenario and optionally skip web part placement.'
        Script = 'scripts/Provision-TestPages.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
        SupportsSiteUrl = $true
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $true
        SupportsForce = $true
        SupportsSkipWebPartProvisioning = $true
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Smoke Test Pages'
        Description = 'Validate that the expected pages and web parts exist.'
        Script = 'scripts/Test-ProvisionedPages.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $false
        SupportsAdminUrl = $false
        SupportsSiteUrl = $true
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $false
        SupportsForce = $false
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $true
        SupportsResolveLatestPageNames = $true
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Inspect Provisioned Pages'
        Description = 'Inspect page state and available components for the scenario pages.'
        Script = 'scripts/Inspect-ProvisionedPages.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $false
        SupportsAdminUrl = $false
        SupportsSiteUrl = $true
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $true
        SupportsForce = $false
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
    [pscustomobject]@{
        Name = 'Export Scenario From Page'
        Description = 'Export a configured SharePoint page into a scenario JSON and retain the extracted XML template.'
        Script = 'scripts/Export-ScenarioFromPage.ps1'
        NeedsScenario = $false
        NeedsPageUrl = $true
        RequiresClientId = $true
        SupportsScenario = $false
        SupportsClientId = $true
        SupportsTenantUrl = $false
        SupportsAdminUrl = $false
        SupportsSiteUrl = $false
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $true
        SupportsTemplateOutPath = $true
        SupportsUseUniquePageNames = $false
        SupportsForce = $false
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $false
        SupportsOpen = $false
    }
)

if ($ListActions) {
    $script:HarnessActions | ForEach-Object {
        [pscustomobject]@{
            Name = $_.Name
            Script = $_.Script
            Description = $_.Description
        }
    } | Format-Table -AutoSize | Out-String | Write-Host

    return
}

if (-not $IsWindows) {
    throw 'Show-HarnessLauncher.ps1 currently supports Windows only because it uses WinForms.'
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

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

function Get-DefaultScenarioPath {
    $defaultPath = Resolve-AbsolutePath -Path './exported-scenarios/sample-scenario.json' -BasePath $PSScriptRoot
    if (Test-Path -LiteralPath $defaultPath -PathType Leaf) {
        return $defaultPath
    }

    $scenarioFolder = Resolve-AbsolutePath -Path './exported-scenarios' -BasePath $PSScriptRoot
    if (Test-Path -LiteralPath $scenarioFolder -PathType Container) {
        $fallbackScenario = Get-ChildItem -LiteralPath $scenarioFolder -Filter '*.json' -File -ErrorAction SilentlyContinue |
            Sort-Object -Property Name |
            Select-Object -First 1

        if ($null -ne $fallbackScenario) {
            return $fallbackScenario.FullName
        }
    }

    return $defaultPath
}

function Get-OptionalConfigValue {
    param(
        [Parameter(Mandatory = $true)]$Config,
        [Parameter(Mandatory = $true)][string[]]$PropertyNames
    )

    if ($null -eq $Config) {
        return $null
    }

    foreach ($propertyName in $PropertyNames) {
        if ($Config.PSObject.Properties.Name -contains $propertyName) {
            return $Config.$propertyName
        }
    }

    return $null
}

function Get-ConfigStringValue {
    param(
        [Parameter(Mandatory = $true)]$Config,
        [Parameter(Mandatory = $true)][string[]]$PropertyNames,
        [string]$DefaultValue = ''
    )

    $value = Get-OptionalConfigValue -Config $Config -PropertyNames $PropertyNames
    if ($null -eq $value) {
        return $DefaultValue
    }

    return [string]$value
}

function Get-ConfigBooleanValue {
    param(
        [Parameter(Mandatory = $true)]$Config,
        [Parameter(Mandatory = $true)][string[]]$PropertyNames,
        [bool]$DefaultValue = $false
    )

    $value = Get-OptionalConfigValue -Config $Config -PropertyNames $PropertyNames
    if ($null -eq $value) {
        return $DefaultValue
    }

    return [bool]$value
}

function Resolve-ConfiguredPath {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ''
    }

    return Resolve-AbsolutePath -Path $Path -BasePath $PSScriptRoot
}

function Get-HarnessLauncherConfig {
    $defaults = [pscustomobject]@{
        ScenarioPath = Get-DefaultScenarioPath
        Tests = 'all'
        ResultsPath = ''
        OutPath = ''
        TemplateOutPath = ''
        TargetSiteUrl = ''
        PageUrl = ''
        UseUniquePageNames = $false
        Force = $false
        SkipWebPartProvisioning = $false
        FailOnUnexpectedWebParts = $false
        ResolveLatestPageNames = $false
        OpenBrowser = $false
    }

    $sharedConfigPath = Join-Path $PSScriptRoot 'HarnessLauncher.config.json'
    $userConfigPath = Join-Path $PSScriptRoot 'HarnessLauncher.config.user.json'

    $configPath = if (Test-Path -LiteralPath $userConfigPath -PathType Leaf) {
        $userConfigPath
    }
    elseif (Test-Path -LiteralPath $sharedConfigPath -PathType Leaf) {
        $sharedConfigPath
    }
    else {
        return [pscustomobject]@{
            DefaultTenant = ''
            Tenants = @()
            Defaults = $defaults
        }
    }

    try {
        $loadedConfig = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
    }
    catch {
        throw "Unable to read harness launcher config '$configPath': $($_.Exception.Message)"
    }

    $loadedDefaults = Get-OptionalConfigValue -Config $loadedConfig -PropertyNames @('Defaults')
    if ($null -eq $loadedDefaults) {
        # Backward compatibility with flat shape.
        $loadedDefaults = $loadedConfig
    }

    $tenantEntries = Get-OptionalConfigValue -Config $loadedConfig -PropertyNames @('Tenants')
    if ($null -eq $tenantEntries) {
        $tenantEntries = @()
    }

    $tenants = @()
    foreach ($tenant in $tenantEntries) {
        $tenantName = Get-ConfigStringValue -Config $tenant -PropertyNames @('Name')
        if ([string]::IsNullOrWhiteSpace($tenantName)) {
            continue
        }

        $tenants += [pscustomobject]@{
            Name = $tenantName
            ClientId = Get-ConfigStringValue -Config $tenant -PropertyNames @('ClientId', 'PnpClientId')
            TenantUrl = Get-ConfigStringValue -Config $tenant -PropertyNames @('TenantUrl')
            AdminUrl = Get-ConfigStringValue -Config $tenant -PropertyNames @('AdminUrl')
            TargetSiteUrl = Get-ConfigStringValue -Config $tenant -PropertyNames @('TargetSiteUrl', 'SiteUrl')
        }
    }

    $defaultTenant = Get-ConfigStringValue -Config $loadedConfig -PropertyNames @('DefaultTenant')
    if ([string]::IsNullOrWhiteSpace($defaultTenant) -and $tenants.Count -gt 0) {
        $defaultTenant = $tenants[0].Name
    }

    $scenarioPath = Resolve-ConfiguredPath -Path (Get-ConfigStringValue -Config $loadedDefaults -PropertyNames @('ScenarioPath'))
    if ([string]::IsNullOrWhiteSpace($scenarioPath) -or -not (Test-Path -LiteralPath $scenarioPath -PathType Leaf)) {
        $scenarioPath = $defaults.ScenarioPath
    }

    return [pscustomobject]@{
        DefaultTenant = $defaultTenant
        Tenants = $tenants
        Defaults = [pscustomobject]@{
            ScenarioPath = $scenarioPath
            Tests = Get-ConfigStringValue -Config $loadedDefaults -PropertyNames @('Tests') -DefaultValue $defaults.Tests
            ResultsPath = Resolve-ConfiguredPath -Path (Get-ConfigStringValue -Config $loadedDefaults -PropertyNames @('ResultsPath'))
            OutPath = Resolve-ConfiguredPath -Path (Get-ConfigStringValue -Config $loadedDefaults -PropertyNames @('OutPath'))
            TemplateOutPath = Resolve-ConfiguredPath -Path (Get-ConfigStringValue -Config $loadedDefaults -PropertyNames @('TemplateOutPath'))
            TargetSiteUrl = Get-ConfigStringValue -Config $loadedDefaults -PropertyNames @('TargetSiteUrl', 'SiteUrl')
            PageUrl = Get-ConfigStringValue -Config $loadedDefaults -PropertyNames @('PageUrl')
            UseUniquePageNames = Get-ConfigBooleanValue -Config $loadedDefaults -PropertyNames @('UseUniquePageNames')
            Force = Get-ConfigBooleanValue -Config $loadedDefaults -PropertyNames @('Force')
            SkipWebPartProvisioning = Get-ConfigBooleanValue -Config $loadedDefaults -PropertyNames @('SkipWebPartProvisioning')
            FailOnUnexpectedWebParts = Get-ConfigBooleanValue -Config $loadedDefaults -PropertyNames @('FailOnUnexpectedWebParts')
            ResolveLatestPageNames = Get-ConfigBooleanValue -Config $loadedDefaults -PropertyNames @('ResolveLatestPageNames')
            OpenBrowser = Get-ConfigBooleanValue -Config $loadedDefaults -PropertyNames @('OpenBrowser')
        }
    }
}

function Format-PowerShellLiteral {
    param([Parameter(Mandatory = $true)][string]$Value)

    return "'" + $Value.Replace("'", "''") + "'"
}

function Add-NamedArgument {
    param(
        [Parameter(Mandatory = $true)][System.Collections.Generic.List[string]]$Parts,
        [Parameter(Mandatory = $true)][string]$Name,
        [string]$Value,
        [switch]$IsSwitch
    )

    if ($IsSwitch) {
        $Parts.Add("-$Name") | Out-Null
        return
    }

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return
    }

    $Parts.Add("-$Name") | Out-Null
    $Parts.Add((Format-PowerShellLiteral -Value $Value)) | Out-Null
}

function Build-CommandText {
    param(
        [Parameter(Mandatory = $true)]$Action,
        [Parameter(Mandatory = $true)]$Values
    )

    $parts = [System.Collections.Generic.List[string]]::new()
    $parts.Add('&') | Out-Null
    $parts.Add((Format-PowerShellLiteral -Value (Join-Path $PSScriptRoot $Action.Script))) | Out-Null

    if ($Action.SupportsScenario) {
        Add-NamedArgument -Parts $parts -Name 'ScenarioPath' -Value $Values.ScenarioPath
    }

    if ($Action.SupportsClientId) {
        Add-NamedArgument -Parts $parts -Name 'ClientId' -Value $Values.ClientId
    }

    if ($Action.SupportsTenantUrl) {
        Add-NamedArgument -Parts $parts -Name 'TenantUrl' -Value $Values.TenantUrl
    }

    if ($Action.SupportsAdminUrl) {
        Add-NamedArgument -Parts $parts -Name 'AdminUrl' -Value $Values.AdminUrl
    }

    if ($Action.SupportsSiteUrl) {
        Add-NamedArgument -Parts $parts -Name 'SiteUrl' -Value $Values.SiteUrl
    }

    if ($Action.SupportsTests) {
        Add-NamedArgument -Parts $parts -Name 'Tests' -Value $Values.Tests
    }

    if ($Action.SupportsResultsPath) {
        Add-NamedArgument -Parts $parts -Name 'ResultsPath' -Value $Values.ResultsPath
    }

    if ($Action.SupportsOutPath) {
        Add-NamedArgument -Parts $parts -Name 'OutPath' -Value $Values.OutPath
    }

    if ($Action.SupportsTemplateOutPath) {
        Add-NamedArgument -Parts $parts -Name 'TemplateOutPath' -Value $Values.TemplateOutPath
    }

    if ($Action.NeedsPageUrl) {
        Add-NamedArgument -Parts $parts -Name 'PageUrl' -Value $Values.PageUrl
    }

    if ($Action.SupportsUseUniquePageNames -and $Values.UseUniquePageNames) {
        Add-NamedArgument -Parts $parts -Name 'UseUniquePageNames' -IsSwitch
    }

    if ($Action.SupportsForce -and $Values.Force) {
        Add-NamedArgument -Parts $parts -Name 'Force' -IsSwitch
    }

    if ($Action.SupportsSkipWebPartProvisioning -and $Values.SkipWebPartProvisioning) {
        Add-NamedArgument -Parts $parts -Name 'SkipWebPartProvisioning' -IsSwitch
    }

    if ($Action.SupportsFailOnUnexpectedWebParts -and $Values.FailOnUnexpectedWebParts) {
        Add-NamedArgument -Parts $parts -Name 'FailOnUnexpectedWebParts' -IsSwitch
    }

    if ($Action.SupportsResolveLatestPageNames -and $Values.ResolveLatestPageNames) {
        Add-NamedArgument -Parts $parts -Name 'ResolveLatestPageNames' -IsSwitch
    }

    if ($Action.SupportsOpen -and $Values.OpenBrowser) {
        Add-NamedArgument -Parts $parts -Name 'Open' -IsSwitch
    }

    return ($parts -join ' ')
}

function Invoke-BrowseFile {
    param(
        [Parameter(Mandatory = $true)][System.Windows.Forms.TextBox]$TextBox,
        [Parameter(Mandatory = $true)][string]$Filter,
        [switch]$Save
    )

    if ($Save) {
        $dialog = New-Object System.Windows.Forms.SaveFileDialog
    }
    else {
        $dialog = New-Object System.Windows.Forms.OpenFileDialog
        $dialog.CheckFileExists = $true
    }

    $dialog.Filter = $Filter
    if (-not [string]::IsNullOrWhiteSpace($TextBox.Text)) {
        $dialog.InitialDirectory = Split-Path -Path $TextBox.Text -Parent
        $dialog.FileName = Split-Path -Path $TextBox.Text -Leaf
    }

    if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $TextBox.Text = $dialog.FileName
    }
}

$launcherConfig = Get-HarnessLauncherConfig
$script:TenantProfiles = @($launcherConfig.Tenants)

$form = New-Object System.Windows.Forms.Form
$form.Text = 'SharePoint Harness Launcher'
$form.StartPosition = 'CenterScreen'
$form.Size = New-Object System.Drawing.Size(920, 828)
$form.MinimumSize = New-Object System.Drawing.Size(920, 828)
$script:LauncherForm = $form

$font = New-Object System.Drawing.Font('Segoe UI', 9)
$boldFont = New-Object System.Drawing.Font('Segoe UI', 9, [System.Drawing.FontStyle]::Bold)
$form.Font = $font

$panel = New-Object System.Windows.Forms.Panel
$panel.Dock = 'Fill'
$panel.AutoScroll = $true
$form.Controls.Add($panel)

$leftLabel = 16
$leftField = 180
$fieldWidth = 590
$browseLeft = 780
$browseWidth = 100
$y = 16
$rowHeight = 30

function New-Label {
    param([string]$Text, [int]$Top)

    $label = New-Object System.Windows.Forms.Label
    $label.Text = $Text
    $label.Left = $leftLabel
    $label.Top = $Top + 5
    $label.Width = 155
    $panel.Controls.Add($label)
    return $label
}

function New-TextBoxRow {
    param(
        [string]$Label,
        [int]$Top,
        [string]$InitialText,
        [switch]$WithBrowse,
        [switch]$SaveDialog,
        [string]$Filter = 'All files (*.*)|*.*'
    )

    New-Label -Text $Label -Top $Top | Out-Null

    $textBox = New-Object System.Windows.Forms.TextBox
    $textBox.Left = $leftField
    $textBox.Top = $Top
    $textBox.Width = $fieldWidth
    $textBox.Text = $InitialText
    $panel.Controls.Add($textBox)

    if ($WithBrowse) {
        $button = New-Object System.Windows.Forms.Button
        $button.Text = 'Browse...'
        $button.Left = $browseLeft
        $button.Top = $Top - 1
        $button.Width = $browseWidth
        $browseTextBox = $textBox
        $browseFilter = $Filter
        $browseSaveDialog = [bool]$SaveDialog
        $button.Add_Click({ Invoke-BrowseFile -TextBox $browseTextBox -Filter $browseFilter -Save:$browseSaveDialog }.GetNewClosure())
        $panel.Controls.Add($button)
        return [pscustomobject]@{ TextBox = $textBox; Button = $button }
    }

    return [pscustomobject]@{ TextBox = $textBox; Button = $null }
}

function New-ComboBoxRow {
    param(
        [string]$Label,
        [int]$Top,
        [string[]]$Items
    )

    New-Label -Text $Label -Top $Top | Out-Null

    $comboBox = New-Object System.Windows.Forms.ComboBox
    $comboBox.Left = $leftField
    $comboBox.Top = $Top
    $comboBox.Width = 300
    $comboBox.DropDownStyle = 'DropDownList'

    foreach ($item in $Items) {
        [void]$comboBox.Items.Add($item)
    }

    $panel.Controls.Add($comboBox)

    return [pscustomobject]@{ ComboBox = $comboBox }
}

New-Label -Text 'Action' -Top $y | Out-Null
$actionCombo = New-Object System.Windows.Forms.ComboBox
$actionCombo.Left = $leftField
$actionCombo.Top = $y
$actionCombo.Width = 300
$actionCombo.DropDownStyle = 'DropDownList'
$script:HarnessActions | ForEach-Object { [void]$actionCombo.Items.Add($_.Name) }
$panel.Controls.Add($actionCombo)
$y += $rowHeight

$descriptionLabel = New-Object System.Windows.Forms.Label
$descriptionLabel.Left = $leftField
$descriptionLabel.Top = $y
$descriptionLabel.Width = 700
$descriptionLabel.Height = 52
$descriptionLabel.Font = $boldFont
$panel.Controls.Add($descriptionLabel)
$y += 60

$scenarioRow = New-TextBoxRow -Label 'Scenario JSON' -Top $y -InitialText $launcherConfig.Defaults.ScenarioPath -WithBrowse -Filter 'JSON files (*.json)|*.json|All files (*.*)|*.*'
$y += $rowHeight

$tenantNames = @($script:TenantProfiles | ForEach-Object { $_.Name })
if ($tenantNames.Count -eq 0) {
    $tenantNames = @('Manual entry')
}

$tenantRow = New-ComboBoxRow -Label 'Tenant' -Top $y -Items $tenantNames
$y += $rowHeight
$clientIdRow = New-TextBoxRow -Label 'Client ID' -Top $y -InitialText ''
$y += $rowHeight
$tenantUrlRow = New-TextBoxRow -Label 'Tenant URL' -Top $y -InitialText ''
$y += $rowHeight
$adminUrlRow = New-TextBoxRow -Label 'Admin URL' -Top $y -InitialText ''
$y += $rowHeight
$siteUrlRow = New-TextBoxRow -Label 'Target Site URL' -Top $y -InitialText $launcherConfig.Defaults.TargetSiteUrl
$y += $rowHeight
$pageUrlRow = New-TextBoxRow -Label 'Page URL' -Top $y -InitialText $launcherConfig.Defaults.PageUrl
$y += $rowHeight
$testsRow = New-TextBoxRow -Label 'Tests' -Top $y -InitialText $launcherConfig.Defaults.Tests
$y += $rowHeight
$resultsPathRow = New-TextBoxRow -Label 'Results Path' -Top $y -InitialText $launcherConfig.Defaults.ResultsPath -WithBrowse -SaveDialog -Filter 'JSON files (*.json)|*.json|All files (*.*)|*.*'
$y += $rowHeight
$outPathRow = New-TextBoxRow -Label 'Scenario Out Path' -Top $y -InitialText $launcherConfig.Defaults.OutPath -WithBrowse -SaveDialog -Filter 'JSON files (*.json)|*.json|All files (*.*)|*.*'
$y += $rowHeight
$templateOutPathRow = New-TextBoxRow -Label 'Template XML Path' -Top $y -InitialText $launcherConfig.Defaults.TemplateOutPath -WithBrowse -SaveDialog -Filter 'XML files (*.xml)|*.xml|All files (*.*)|*.*'
$y += $rowHeight + 8

$optionsLabel = New-Object System.Windows.Forms.Label
$optionsLabel.Text = 'Options'
$optionsLabel.Left = $leftLabel
$optionsLabel.Top = $y + 4
$optionsLabel.Width = 155
$panel.Controls.Add($optionsLabel)

$useUniqueCheck = New-Object System.Windows.Forms.CheckBox
$useUniqueCheck.Text = 'Use unique page names'
$useUniqueCheck.Left = $leftField
$useUniqueCheck.Top = $y
$useUniqueCheck.Width = 180
$panel.Controls.Add($useUniqueCheck)

$forceCheck = New-Object System.Windows.Forms.CheckBox
$forceCheck.Text = 'Force'
$forceCheck.Left = 380
$forceCheck.Top = $y
$forceCheck.Width = 90
$panel.Controls.Add($forceCheck)

$skipWebPartCheck = New-Object System.Windows.Forms.CheckBox
$skipWebPartCheck.Text = 'Skip web part provisioning'
$skipWebPartCheck.Left = 490
$skipWebPartCheck.Top = $y
$skipWebPartCheck.Width = 200
$panel.Controls.Add($skipWebPartCheck)

$y += $rowHeight

$failUnexpectedCheck = New-Object System.Windows.Forms.CheckBox
$failUnexpectedCheck.Text = 'Fail on unexpected web parts'
$failUnexpectedCheck.Left = $leftField
$failUnexpectedCheck.Top = $y
$failUnexpectedCheck.Width = 210
$panel.Controls.Add($failUnexpectedCheck)

$resolveLatestCheck = New-Object System.Windows.Forms.CheckBox
$resolveLatestCheck.Text = 'Resolve latest page names'
$resolveLatestCheck.Left = 380
$resolveLatestCheck.Top = $y
$resolveLatestCheck.Width = 180
$panel.Controls.Add($resolveLatestCheck)

$openCheck = New-Object System.Windows.Forms.CheckBox
$openCheck.Text = 'Open URLs in browser'
$openCheck.Left = 590
$openCheck.Top = $y
$openCheck.Width = 160
$panel.Controls.Add($openCheck)

$useUniqueCheck.Checked = $launcherConfig.Defaults.UseUniquePageNames
$forceCheck.Checked = $launcherConfig.Defaults.Force
$skipWebPartCheck.Checked = $launcherConfig.Defaults.SkipWebPartProvisioning
$failUnexpectedCheck.Checked = $launcherConfig.Defaults.FailOnUnexpectedWebParts
$resolveLatestCheck.Checked = $launcherConfig.Defaults.ResolveLatestPageNames
$openCheck.Checked = $launcherConfig.Defaults.OpenBrowser

$y += 50

$commandLabel = New-Object System.Windows.Forms.Label
$commandLabel.Text = 'Command Preview'
$commandLabel.Left = $leftLabel
$commandLabel.Top = $y
$commandLabel.Width = 155
$panel.Controls.Add($commandLabel)

$commandPreview = New-Object System.Windows.Forms.TextBox
$commandPreview.Left = $leftField
$commandPreview.Top = $y
$commandPreview.Width = 700
$commandPreview.Height = 110
$commandPreview.Multiline = $true
$commandPreview.ScrollBars = 'Vertical'
$commandPreview.ReadOnly = $true
$panel.Controls.Add($commandPreview)

$y += 130

$runButton = New-Object System.Windows.Forms.Button
$runButton.Text = 'Run Action'
$runButton.Left = $leftField
$runButton.Top = $y
$runButton.Width = 120
$panel.Controls.Add($runButton)

$copyButton = New-Object System.Windows.Forms.Button
$copyButton.Text = 'Copy Command'
$copyButton.Left = 315
$copyButton.Top = $y
$copyButton.Width = 120
$panel.Controls.Add($copyButton)

$closeButton = New-Object System.Windows.Forms.Button
$closeButton.Text = 'Close'
$closeButton.Left = 450
$closeButton.Top = $y
$closeButton.Width = 120
$panel.Controls.Add($closeButton)

$y += 45

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = 'Last Action Status'
$statusLabel.Left = $leftLabel
$statusLabel.Top = $y
$statusLabel.Width = 155
$panel.Controls.Add($statusLabel)

$statusTextBox = New-Object System.Windows.Forms.TextBox
$statusTextBox.Left = $leftField
$statusTextBox.Top = $y
$statusTextBox.Width = 700
$statusTextBox.Height = 90
$statusTextBox.Multiline = $true
$statusTextBox.ScrollBars = 'Vertical'
$statusTextBox.ReadOnly = $true
$statusTextBox.Text = 'No action has been run yet.'
$panel.Controls.Add($statusTextBox)

function Get-CurrentValues {
    return [pscustomobject]@{
        ScenarioPath = $scenarioRow.TextBox.Text.Trim()
        ClientId = $clientIdRow.TextBox.Text.Trim()
        TenantUrl = $tenantUrlRow.TextBox.Text.Trim()
        AdminUrl = $adminUrlRow.TextBox.Text.Trim()
        SiteUrl = $siteUrlRow.TextBox.Text.Trim()
        PageUrl = $pageUrlRow.TextBox.Text.Trim()
        Tests = $testsRow.TextBox.Text.Trim()
        ResultsPath = $resultsPathRow.TextBox.Text.Trim()
        OutPath = $outPathRow.TextBox.Text.Trim()
        TemplateOutPath = $templateOutPathRow.TextBox.Text.Trim()
        UseUniquePageNames = [bool]$useUniqueCheck.Checked
        Force = [bool]$forceCheck.Checked
        SkipWebPartProvisioning = [bool]$skipWebPartCheck.Checked
        FailOnUnexpectedWebParts = [bool]$failUnexpectedCheck.Checked
        ResolveLatestPageNames = [bool]$resolveLatestCheck.Checked
        OpenBrowser = [bool]$openCheck.Checked
    }
}

function Get-SelectedAction {
    return $script:HarnessActions | Where-Object { $_.Name -eq [string]$actionCombo.SelectedItem } | Select-Object -First 1
}

function Get-SelectedTenantProfile {
    $selectedTenantName = [string]$tenantRow.ComboBox.SelectedItem
    return $script:TenantProfiles | Where-Object { $_.Name -eq $selectedTenantName } | Select-Object -First 1
}

function Apply-SelectedTenantProfile {
    $selectedTenant = Get-SelectedTenantProfile
    if ($null -eq $selectedTenant) {
        return
    }

    $clientIdRow.TextBox.Text = $selectedTenant.ClientId
    $tenantUrlRow.TextBox.Text = $selectedTenant.TenantUrl
    $adminUrlRow.TextBox.Text = $selectedTenant.AdminUrl
    $siteUrlRow.TextBox.Text = $selectedTenant.TargetSiteUrl
}

function Set-ControlEnabled {
    param($Row, [bool]$Enabled)

    $Row.TextBox.Enabled = $Enabled
    if ($null -ne $Row.Button) {
        $Row.Button.Enabled = $Enabled
    }
}

function Update-ActionUi {
    $action = Get-SelectedAction
    if ($null -eq $action) {
        return
    }

    $descriptionLabel.Text = $action.Description

    Set-ControlEnabled -Row $scenarioRow -Enabled $action.SupportsScenario
    Set-ControlEnabled -Row $clientIdRow -Enabled $action.SupportsClientId
    Set-ControlEnabled -Row $tenantUrlRow -Enabled $action.SupportsTenantUrl
    Set-ControlEnabled -Row $adminUrlRow -Enabled $action.SupportsAdminUrl
    Set-ControlEnabled -Row $siteUrlRow -Enabled $action.SupportsSiteUrl
    Set-ControlEnabled -Row $pageUrlRow -Enabled $action.NeedsPageUrl
    Set-ControlEnabled -Row $testsRow -Enabled $action.SupportsTests
    Set-ControlEnabled -Row $resultsPathRow -Enabled $action.SupportsResultsPath
    Set-ControlEnabled -Row $outPathRow -Enabled $action.SupportsOutPath
    Set-ControlEnabled -Row $templateOutPathRow -Enabled $action.SupportsTemplateOutPath

    $useUniqueCheck.Enabled = $action.SupportsUseUniquePageNames
    $forceCheck.Enabled = $action.SupportsForce
    $skipWebPartCheck.Enabled = $action.SupportsSkipWebPartProvisioning
    $failUnexpectedCheck.Enabled = $action.SupportsFailOnUnexpectedWebParts
    $resolveLatestCheck.Enabled = $action.SupportsResolveLatestPageNames
    $openCheck.Enabled = $action.SupportsOpen

    if (-not $action.SupportsTests) { $testsRow.TextBox.Text = 'all' }
    if (-not $action.SupportsResultsPath) { $resultsPathRow.TextBox.Text = '' }
    if (-not $action.SupportsOutPath) { $outPathRow.TextBox.Text = '' }
    if (-not $action.SupportsTemplateOutPath) { $templateOutPathRow.TextBox.Text = '' }

    if (-not $action.SupportsUseUniquePageNames) { $useUniqueCheck.Checked = $false }
    if (-not $action.SupportsForce) { $forceCheck.Checked = $false }
    if (-not $action.SupportsSkipWebPartProvisioning) { $skipWebPartCheck.Checked = $false }
    if (-not $action.SupportsFailOnUnexpectedWebParts) { $failUnexpectedCheck.Checked = $false }
    if (-not $action.SupportsResolveLatestPageNames) { $resolveLatestCheck.Checked = $false }
    if (-not $action.SupportsOpen) { $openCheck.Checked = $false }

    $commandPreview.Text = Build-CommandText -Action $action -Values (Get-CurrentValues)
}

function Validate-Selection {
    param(
        [Parameter(Mandatory = $true)]$Action,
        [Parameter(Mandatory = $true)]$Values
    )

    if ($Action.NeedsScenario) {
        if ([string]::IsNullOrWhiteSpace($Values.ScenarioPath)) {
            throw 'Scenario JSON is required for this action.'
        }

        if (-not (Test-Path -LiteralPath $Values.ScenarioPath -PathType Leaf)) {
            throw "Scenario JSON was not found: $($Values.ScenarioPath)"
        }
    }

    if ($Action.NeedsPageUrl -and [string]::IsNullOrWhiteSpace($Values.PageUrl)) {
        throw 'Page URL is required for this action.'
    }

    if ($Action.RequiresClientId -and [string]::IsNullOrWhiteSpace($Values.ClientId)) {
        throw 'Client ID is required for this action.'
    }

    if ($Action.SupportsSiteUrl -and [string]::IsNullOrWhiteSpace($Values.SiteUrl)) {
        throw 'Target Site URL is required for this action.'
    }
}

$actionCombo.Add_SelectedIndexChanged({ Update-ActionUi })

$tenantRow.ComboBox.Add_SelectedIndexChanged({
    Apply-SelectedTenantProfile
    Update-ActionUi
})

foreach ($textBox in @(
    $scenarioRow.TextBox,
    $clientIdRow.TextBox,
    $tenantUrlRow.TextBox,
    $adminUrlRow.TextBox,
    $siteUrlRow.TextBox,
    $pageUrlRow.TextBox,
    $testsRow.TextBox,
    $resultsPathRow.TextBox,
    $outPathRow.TextBox,
    $templateOutPathRow.TextBox
)) {
    $textBox.Add_TextChanged({ Update-ActionUi })
}

foreach ($checkBox in @($useUniqueCheck, $forceCheck, $skipWebPartCheck, $failUnexpectedCheck, $resolveLatestCheck, $openCheck)) {
    $checkBox.Add_CheckedChanged({ Update-ActionUi })
}

$copyButton.Add_Click({
    $action = Get-SelectedAction
    if ($null -eq $action) {
        return
    }

    $commandText = Build-CommandText -Action $action -Values (Get-CurrentValues)
    Set-Clipboard -Value $commandText
    [System.Windows.Forms.MessageBox]::Show('Command copied to clipboard.', 'Harness Launcher') | Out-Null
})

$runButton.Add_Click({
    try {
        $action = Get-SelectedAction
        if ($null -eq $action) {
            throw 'Select an action first.'
        }

        $values = Get-CurrentValues
        Validate-Selection -Action $action -Values $values
        $commandText = Build-CommandText -Action $action -Values $values
        $statusFilePath = [System.IO.Path]::GetTempFileName()
        $statusFileLiteral = Format-PowerShellLiteral -Value $statusFilePath
        $wrappedCommandText = @"
`$ErrorActionPreference = 'Stop'
`$initialErrorCount = `$global:Error.Count

function Write-HarnessActionStatus {
    param([hashtable]`$Status)

    (`$Status | ConvertTo-Json -Compress) | Set-Content -LiteralPath $statusFileLiteral -Encoding utf8
}

try {
    $commandText

    `$errorDelta = `$global:Error.Count - `$initialErrorCount
    `$commandSuccess = [bool]`$?
    `$nativeExitCode = if (`$null -eq `$LASTEXITCODE) { 0 } else { [int]`$LASTEXITCODE }
    `$succeeded = `$commandSuccess

    Write-HarnessActionStatus -Status @{
        success = `$succeeded
        commandSuccess = `$commandSuccess
        errorDelta = `$errorDelta
        nativeExitCode = `$nativeExitCode
    }

    if (`$succeeded) {
        Write-Host (([Environment]::NewLine) + '==> Harness action completed successfully. You can close this window when ready.') -ForegroundColor Green
    }
    else {
        Write-Host (([Environment]::NewLine) + '==> Harness action reported failure. Review the output above, then close this window when ready.') -ForegroundColor Yellow
    }
}
catch {
    Write-HarnessActionStatus -Status @{
        success = `$false
        commandSuccess = `$false
        errorDelta = (`$global:Error.Count - `$initialErrorCount)
        nativeExitCode = if (`$null -eq `$LASTEXITCODE) { 0 } else { [int]`$LASTEXITCODE }
        exception = [string]`$_.Exception.Message
    }
    Write-Error (`$_ | Out-String)
    Write-Host (([Environment]::NewLine) + '==> Harness action threw an exception. Review the output above, then close this window when ready.') -ForegroundColor Yellow
}
"@

        $workingDirectory = Resolve-AbsolutePath -Path '../..' -BasePath $PSScriptRoot
        $process = Start-Process -FilePath 'pwsh' -WorkingDirectory $workingDirectory -ArgumentList @('-NoExit', '-Command', $wrappedCommandText) -PassThru
        $process.EnableRaisingEvents = $true
        $actionNameForEvent = [string]$action.Name
        $statusFilePathForEvent = $statusFilePath
        $null = Register-ObjectEvent -InputObject $process -EventName Exited -Action {
            param($sender, $eventArgs)

            $script:LastHarnessActionExitCode = 1
            if ($null -ne $sender) {
                $script:LastHarnessActionExitCode = [int]$sender.ExitCode
            }

            $statusData = $null
            if (Test-Path -LiteralPath $statusFilePathForEvent -PathType Leaf) {
                try {
                    $statusData = Get-Content -LiteralPath $statusFilePathForEvent -Raw | ConvertFrom-Json
                }
                catch {
                }

                Remove-Item -LiteralPath $statusFilePathForEvent -Force -ErrorAction SilentlyContinue
            }

            if (-not $script:LauncherForm.IsDisposed) {
                $null = $script:LauncherForm.BeginInvoke([Action]{
                    if ($script:LauncherForm.IsDisposed) {
                        return
                    }

                    if ($null -ne $statusData) {
                        $summary = if ([bool]$statusData.success) { 'SUCCESS' } else { 'FAILED' }
                        $message = @(
                            "Action: $actionNameForEvent"
                            "Result: $summary"
                            "Process exit code: $($script:LastHarnessActionExitCode)"
                            "PowerShell success (`$?): $($statusData.commandSuccess)"
                            "Native exit code (`$LASTEXITCODE): $($statusData.nativeExitCode)"
                            "New errors during run: $($statusData.errorDelta)"
                        )

                        if ($statusData.PSObject.Properties.Name -contains 'exception' -and -not [string]::IsNullOrWhiteSpace([string]$statusData.exception)) {
                            $message += "Exception: $($statusData.exception)"
                        }

                        $statusTextBox.Text = $message -join [Environment]::NewLine
                    }
                    else {
                        $statusTextBox.Text = "Action finished with process exit code $($script:LastHarnessActionExitCode), but status diagnostics were unavailable."
                    }
                })
            }
        }.GetNewClosure()
    }
    catch {
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Harness Launcher') | Out-Null
    }
})

$closeButton.Add_Click({ $form.Close() })

if ($script:TenantProfiles.Count -eq 0) {
    $tenantRow.ComboBox.SelectedIndex = 0
    $tenantRow.ComboBox.Enabled = $false
}
else {
    $initialTenantName = if ([string]::IsNullOrWhiteSpace($launcherConfig.DefaultTenant)) {
        $script:TenantProfiles[0].Name
    }
    else {
        $launcherConfig.DefaultTenant
    }

    if ($tenantRow.ComboBox.Items.Contains($initialTenantName)) {
        $tenantRow.ComboBox.SelectedItem = $initialTenantName
    }
    else {
        $tenantRow.ComboBox.SelectedIndex = 0
    }

    Apply-SelectedTenantProfile
}

$actionCombo.SelectedItem = $script:HarnessActions[0].Name
[void]$form.ShowDialog()