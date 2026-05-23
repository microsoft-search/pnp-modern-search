[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$PageUrl,

    [string]$ClientId,

    [string]$OutPath,

    [string]$TemplateOutPath,

    [string]$ScenarioTemplatePath = './testing/sharepoint-harness/exported-scenarios/sample-scenario.json',

    [string]$PackagePath = '../../sharepoint/solution/pnp-modern-search-parts-v4.sppkg',

    [bool]$SkipFeatureDeployment = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:KnownComponentsById = @{
    '544c1372-7e5a-49ec-8db6-812f76c375f2' = 'search-box'
    '544c1372-42df-47c3-94d6-017428cd2baf' = 'search-results'
    '544c1372-fb1d-4e96-bc1e-31fd66979667' = 'search-filters'
    '544c1372-77ae-40a0-9095-805ae2a0d5e9' = 'search-verticals'
}

$script:IgnoredControlIds = @(
    'cbe7b0a9-3504-44dd-a3a3-0e5cacd07788'
)

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
        if ($Object.Contains($PropertyName)) {
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

function Get-TenantUrl {
    param([Parameter(Mandatory = $true)][System.Uri]$PageUri)

    return '{0}://{1}' -f $PageUri.Scheme, $PageUri.Host
}

function Get-SiteUrlAndPageName {
    param([Parameter(Mandatory = $true)][string]$TargetPageUrl)

    $pageUri = [System.Uri]$TargetPageUrl
    $pathSegments = @($pageUri.AbsolutePath.Trim('/').Split('/'))
    $sitePagesIndex = [Array]::IndexOf($pathSegments, 'SitePages')
    if ($sitePagesIndex -lt 0 -or $sitePagesIndex -eq ($pathSegments.Length - 1)) {
        throw "Page URL '$TargetPageUrl' is not a supported Site Pages URL."
    }

    $sitePathSegments = if ($sitePagesIndex -gt 0) { $pathSegments[0..($sitePagesIndex - 1)] } else { @() }
    $sitePath = if ($sitePathSegments.Count -gt 0) { '/' + ($sitePathSegments -join '/') } else { '' }

    return [pscustomobject]@{
        TenantUrl = Get-TenantUrl -PageUri $pageUri
        SiteUrl = ('{0}://{1}{2}' -f $pageUri.Scheme, $pageUri.Host, $sitePath)
        PageName = $pathSegments[$sitePagesIndex + 1]
    }
}

function Get-DefaultOutPath {
    param([Parameter(Mandatory = $true)]$PageIdentity)

    $pageBaseName = [System.IO.Path]::GetFileNameWithoutExtension([string]$PageIdentity.PageName)
    $fileName = "$pageBaseName-scenario.json"
    $defaultDirectory = './testing/sharepoint-harness/exported-scenarios'

    return Resolve-AbsolutePath -Path (Join-Path $defaultDirectory $fileName) -BasePath (Get-Location).Path
}

function Get-TemplateOutPath {
    param(
        [Parameter(Mandatory = $true)]$PageIdentity,
        [Parameter(Mandatory = $true)][string]$ScenarioOutPath,
        [string]$ConfiguredTemplateOutPath
    )

    if (-not [string]::IsNullOrWhiteSpace($ConfiguredTemplateOutPath)) {
        return Resolve-AbsolutePath -Path $ConfiguredTemplateOutPath -BasePath (Get-Location).Path
    }

    $pageBaseName = [System.IO.Path]::GetFileNameWithoutExtension([string]$PageIdentity.PageName)
    $scenarioDirectory = Split-Path -Path $ScenarioOutPath -Parent
    $templateFileName = "$pageBaseName-template.xml"

    return Join-Path $scenarioDirectory $templateFileName
}

function Get-ScenarioTemplate {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return $null
    }

    $resolvedPath = Resolve-AbsolutePath -Path $Path -BasePath (Get-Location).Path
    if (-not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
        return $null
    }

    return Read-JsonFile -Path $resolvedPath
}

function Connect-InteractivePnP {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$ResolvedClientId
    )

    return Connect-PnPOnline -Url $Url -Interactive -ClientId $ResolvedClientId -ReturnConnection
}

function Get-ControlDefinition {
    param([Parameter(Mandatory = $true)]$CanvasControlNode)

    $jsonControlData = [string]$CanvasControlNode.JsonControlData
    if ([string]::IsNullOrWhiteSpace($jsonControlData)) {
        return $null
    }

    return $jsonControlData | ConvertFrom-Json -Depth 100
}

function Convert-ControlToScenarioWebPart {
    param(
        [Parameter(Mandatory = $true)]$CanvasControlNode,
        [Parameter(Mandatory = $true)][int]$SectionNumber
    )

    $controlId = [string]$CanvasControlNode.ControlId
    if ($controlId -in $script:IgnoredControlIds) {
        return $null
    }

    $controlDefinition = Get-ControlDefinition -CanvasControlNode $CanvasControlNode
    if ($null -eq $controlDefinition) {
        return $null
    }

    $webPartId = [string](Get-OptionalPropertyValue -Object $controlDefinition -PropertyName 'webPartId')
    if ([string]::IsNullOrWhiteSpace($webPartId)) {
        $webPartId = $controlId
    }

    if ($webPartId -in $script:IgnoredControlIds) {
        return $null
    }

    $webPartDefinition = [ordered]@{
        section = $SectionNumber
        column = if (-not [string]::IsNullOrWhiteSpace([string]$CanvasControlNode.Column)) { [int]$CanvasControlNode.Column } else { 1 }
        order = if (-not [string]::IsNullOrWhiteSpace([string]$CanvasControlNode.Order)) { [int]$CanvasControlNode.Order } else { 1 }
    }

    $componentKey = $script:KnownComponentsById[$webPartId]
    if ([string]::IsNullOrWhiteSpace([string]$componentKey)) {
        $webPartDefinition.componentId = $webPartId
    }
    else {
        $webPartDefinition.componentKey = $componentKey
    }

    $properties = Get-OptionalPropertyValue -Object $controlDefinition -PropertyName 'properties'
    if ($null -ne $properties) {
        $webPartDefinition.propertiesJson = $properties
    }

    return [pscustomobject]$webPartDefinition
}

function Convert-PageNodeToScenario {
    param([Parameter(Mandatory = $true)]$PageNode)

    $sectionNodes = @($PageNode.SelectNodes('pnp:Sections/pnp:Section', $script:XmlNamespaceManager)) |
        Sort-Object { [int]$_.Order }

    $scenarioSections = [System.Collections.Generic.List[object]]::new()
    $scenarioWebParts = [System.Collections.Generic.List[object]]::new()
    $sectionNumber = 1

    foreach ($sectionNode in $sectionNodes) {
        $scenarioSections.Add([pscustomobject][ordered]@{
            template = [string]$sectionNode.Type
            order = [int]$sectionNode.Order
        }) | Out-Null

        $controlNodes = @($sectionNode.SelectNodes('pnp:Controls/pnp:CanvasControl', $script:XmlNamespaceManager)) |
            Sort-Object { [int]$_.Column }, { [int]$_.Order }

        foreach ($controlNode in $controlNodes) {
            $scenarioWebPart = Convert-ControlToScenarioWebPart -CanvasControlNode $controlNode -SectionNumber $sectionNumber
            if ($null -ne $scenarioWebPart) {
                $scenarioWebParts.Add($scenarioWebPart) | Out-Null
            }
        }

        $sectionNumber++
    }

    return [pscustomobject][ordered]@{
        name = [string]$PageNode.PageName
        title = [string]$PageNode.Title
        publish = $true
        sections = @($scenarioSections)
        webParts = @($scenarioWebParts)
    }
}

Import-Module PnP.PowerShell -ErrorAction Stop | Out-Null

$pageIdentity = Get-SiteUrlAndPageName -TargetPageUrl $PageUrl
if ([string]::IsNullOrWhiteSpace($ClientId)) {
    throw 'A PnP client id must be provided via -ClientId.'
}

$connection = Connect-InteractivePnP -Url $pageIdentity.SiteUrl -ResolvedClientId $ClientId
$web = Get-PnPWeb -Connection $connection -Includes Title, Description
$scenarioTemplate = Get-ScenarioTemplate -Path $ScenarioTemplatePath

$templateTenantUrl = if ($null -ne $scenarioTemplate) { Get-OptionalPropertyValue -Object $scenarioTemplate.auth -PropertyName 'tenantUrl' } else { $null }
$templateSiteUrl = if ($null -ne $scenarioTemplate) { Get-OptionalPropertyValue -Object $scenarioTemplate.site -PropertyName 'url' } else { $null }
$templateSiteTitle = if ($null -ne $scenarioTemplate) { Get-OptionalPropertyValue -Object $scenarioTemplate.site -PropertyName 'title' } else { $null }
$templateSiteType = if ($null -ne $scenarioTemplate) { Get-OptionalPropertyValue -Object $scenarioTemplate.site -PropertyName 'type' } else { $null }
$templateSiteDescription = if ($null -ne $scenarioTemplate) { Get-OptionalPropertyValue -Object $scenarioTemplate.site -PropertyName 'description' } else { $null }
$templatePackagePath = if ($null -ne $scenarioTemplate) { Get-OptionalPropertyValue -Object $scenarioTemplate.package -PropertyName 'path' } else { $null }
$templateSkipFeatureDeployment = if ($null -ne $scenarioTemplate) { Get-OptionalPropertyValue -Object $scenarioTemplate.package -PropertyName 'skipFeatureDeployment' } else { $null }

$resolvedTenantUrl = if ([string]::IsNullOrWhiteSpace([string]$templateTenantUrl)) { $pageIdentity.TenantUrl } else { [string]$templateTenantUrl }
$resolvedSiteUrl = if ([string]::IsNullOrWhiteSpace([string]$templateSiteUrl)) { $pageIdentity.SiteUrl } else { [string]$templateSiteUrl }
$resolvedSiteTitle = if ([string]::IsNullOrWhiteSpace([string]$templateSiteTitle)) { [string](Get-OptionalPropertyValue -Object $web -PropertyName 'Title') } else { [string]$templateSiteTitle }
$resolvedSiteType = if ([string]::IsNullOrWhiteSpace([string]$templateSiteType)) { $null } else { [string]$templateSiteType }
$resolvedSiteDescription = if ([string]::IsNullOrWhiteSpace([string]$templateSiteDescription)) { [string](Get-OptionalPropertyValue -Object $web -PropertyName 'Description') } else { [string]$templateSiteDescription }
$resolvedPackagePath = if ([string]::IsNullOrWhiteSpace([string]$templatePackagePath)) { $PackagePath } else { [string]$templatePackagePath }
$resolvedSkipFeatureDeployment = if ($null -eq $templateSkipFeatureDeployment) { [bool]$SkipFeatureDeployment } else { [bool]$templateSkipFeatureDeployment }

$resolvedOutPath = if ([string]::IsNullOrWhiteSpace($OutPath)) {
    Get-DefaultOutPath -PageIdentity $pageIdentity
}
else {
    Resolve-AbsolutePath -Path $OutPath -BasePath (Get-Location).Path
}

$outDirectory = Split-Path -Path $resolvedOutPath -Parent
if (-not (Test-Path -LiteralPath $outDirectory -PathType Container)) {
    New-Item -ItemType Directory -Path $outDirectory -Force | Out-Null
}

$resolvedTemplateOutPath = Get-TemplateOutPath -PageIdentity $pageIdentity -ScenarioOutPath $resolvedOutPath -ConfiguredTemplateOutPath $TemplateOutPath
$templateOutDirectory = Split-Path -Path $resolvedTemplateOutPath -Parent
if (-not (Test-Path -LiteralPath $templateOutDirectory -PathType Container)) {
    New-Item -ItemType Directory -Path $templateOutDirectory -Force | Out-Null
}

Get-PnPSiteTemplate -Connection $connection -Handlers PageContents,Pages -IncludeAllPages -Force -Out $resolvedTemplateOutPath

[xml]$templateXml = Get-Content -LiteralPath $resolvedTemplateOutPath -Raw
    $script:XmlNamespaceManager = [System.Xml.XmlNamespaceManager]::new($templateXml.NameTable)
    $script:XmlNamespaceManager.AddNamespace('pnp', 'http://schemas.dev.office.com/PnP/2022/09/ProvisioningSchema')

$pageNode = $templateXml.SelectSingleNode("//pnp:ClientSidePage[@PageName='$($pageIdentity.PageName)']", $script:XmlNamespaceManager)
if ($null -eq $pageNode) {
    throw "Unable to find page '$($pageIdentity.PageName)' in the extracted site template."
}

$scenarioObject = [ordered]@{
    auth = [ordered]@{
        tenantUrl = $resolvedTenantUrl
        clientId = $ClientId
    }
    site = [ordered]@{
        url = $resolvedSiteUrl
        title = $resolvedSiteTitle
        type = $resolvedSiteType
        description = $resolvedSiteDescription
    }
    package = [ordered]@{
        path = $resolvedPackagePath
        skipFeatureDeployment = $resolvedSkipFeatureDeployment
    }
    pages = @(
        Convert-PageNodeToScenario -PageNode $pageNode
    )
}

$scenarioObject | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $resolvedOutPath -Encoding utf8
Write-Host "Scenario exported to $resolvedOutPath" -ForegroundColor Green
Write-Host "Provisioning template exported to $resolvedTemplateOutPath" -ForegroundColor Green