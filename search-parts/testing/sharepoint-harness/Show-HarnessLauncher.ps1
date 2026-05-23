[CmdletBinding()]
param(
    [switch]$ListActions
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:HarnessActions = @(
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
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
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
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
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
        Name = 'Generate Debug URLs'
        Description = 'Generate local debug-manifest URLs for the scenario pages.'
        Script = 'scripts/Get-LocalDebugPageUrls.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $false
        SupportsTests = $false
        SupportsResultsPath = $false
        SupportsOutPath = $false
        SupportsTemplateOutPath = $false
        SupportsUseUniquePageNames = $false
        SupportsForce = $false
        SupportsSkipWebPartProvisioning = $false
        SupportsFailOnUnexpectedWebParts = $false
        SupportsResolveLatestPageNames = $true
        SupportsOpen = $true
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
    [pscustomobject]@{
        Name = 'Remove Test Site'
        Description = 'Delete the test site defined in the scenario.'
        Script = 'scripts/Remove-TestSite.ps1'
        NeedsScenario = $true
        NeedsPageUrl = $false
        RequiresClientId = $false
        SupportsScenario = $true
        SupportsClientId = $true
        SupportsTenantUrl = $true
        SupportsAdminUrl = $true
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
    return Resolve-AbsolutePath -Path './exported-scenarios/sample-scenario.json' -BasePath $PSScriptRoot
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

$form = New-Object System.Windows.Forms.Form
$form.Text = 'SharePoint Harness Launcher'
$form.StartPosition = 'CenterScreen'
$form.Size = New-Object System.Drawing.Size(920, 690)
$form.MinimumSize = New-Object System.Drawing.Size(920, 690)

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

$scenarioRow = New-TextBoxRow -Label 'Scenario JSON' -Top $y -InitialText (Get-DefaultScenarioPath) -WithBrowse -Filter 'JSON files (*.json)|*.json|All files (*.*)|*.*'
$y += $rowHeight
$clientIdRow = New-TextBoxRow -Label 'Client ID' -Top $y -InitialText ''
$y += $rowHeight
$tenantUrlRow = New-TextBoxRow -Label 'Tenant URL' -Top $y -InitialText ''
$y += $rowHeight
$adminUrlRow = New-TextBoxRow -Label 'Admin URL' -Top $y -InitialText ''
$y += $rowHeight
$pageUrlRow = New-TextBoxRow -Label 'Page URL' -Top $y -InitialText ''
$y += $rowHeight
$testsRow = New-TextBoxRow -Label 'Tests' -Top $y -InitialText 'all'
$y += $rowHeight
$resultsPathRow = New-TextBoxRow -Label 'Results Path' -Top $y -InitialText '' -WithBrowse -SaveDialog -Filter 'JSON files (*.json)|*.json|All files (*.*)|*.*'
$y += $rowHeight
$outPathRow = New-TextBoxRow -Label 'Scenario Out Path' -Top $y -InitialText '' -WithBrowse -SaveDialog -Filter 'JSON files (*.json)|*.json|All files (*.*)|*.*'
$y += $rowHeight
$templateOutPathRow = New-TextBoxRow -Label 'Template XML Path' -Top $y -InitialText '' -WithBrowse -SaveDialog -Filter 'XML files (*.xml)|*.xml|All files (*.*)|*.*'
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

function Get-CurrentValues {
    return [pscustomobject]@{
        ScenarioPath = $scenarioRow.TextBox.Text.Trim()
        ClientId = $clientIdRow.TextBox.Text.Trim()
        TenantUrl = $tenantUrlRow.TextBox.Text.Trim()
        AdminUrl = $adminUrlRow.TextBox.Text.Trim()
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
}

$actionCombo.Add_SelectedIndexChanged({ Update-ActionUi })

foreach ($textBox in @(
    $scenarioRow.TextBox,
    $clientIdRow.TextBox,
    $tenantUrlRow.TextBox,
    $adminUrlRow.TextBox,
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

        Start-Process -FilePath 'pwsh' -WorkingDirectory (Resolve-AbsolutePath -Path '../..' -BasePath $PSScriptRoot) -ArgumentList @('-NoExit', '-Command', $commandText) | Out-Null
    }
    catch {
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Harness Launcher') | Out-Null
    }
})

$closeButton.Add_Click({ $form.Close() })

$actionCombo.SelectedItem = $script:HarnessActions[0].Name
[void]$form.ShowDialog()