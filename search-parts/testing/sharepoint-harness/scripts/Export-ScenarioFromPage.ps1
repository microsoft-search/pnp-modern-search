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

$script:FullWidthSupportedComponentIds = @(
    # Built-in page title control
    'cbe7b0a9-3504-44dd-a3a3-0e5cacd07788'
    # Built-in hero web part
    'c4bd7b2f-7b6e-4599-8485-16504575f590'
    # Built-in image web part
    'd1d91016-032f-456d-98a4-721247c305e8'
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

function Get-ExternalTemplateUrlsFromObject {
    param([Parameter(Mandatory = $false)]$Object)

    $urls = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

    function Visit-Node {
        param([Parameter(Mandatory = $false)]$Node)

        if ($null -eq $Node) {
            return
        }

        if ($Node -is [string]) {
            return
        }

        if ($Node -is [System.Collections.IDictionary]) {
            foreach ($key in @($Node.Keys)) {
                $value = $Node[$key]

                if ([string]$key -eq 'externalTemplateUrl') {
                    $candidate = [string]$value
                    if (-not [string]::IsNullOrWhiteSpace($candidate)) {
                        [void]$urls.Add($candidate)
                    }
                }

                Visit-Node -Node $value
            }

            return
        }

        if ($Node -is [System.Collections.IEnumerable]) {
            foreach ($item in $Node) {
                Visit-Node -Node $item
            }

            return
        }

        foreach ($property in $Node.PSObject.Properties) {
            if ($property.Name -eq 'externalTemplateUrl') {
                $candidate = [string]$property.Value
                if (-not [string]::IsNullOrWhiteSpace($candidate)) {
                    [void]$urls.Add($candidate)
                }
            }

            Visit-Node -Node $property.Value
        }
    }

    Visit-Node -Node $Object
    return @($urls | ForEach-Object { $_ })
}

function Get-ExternalTemplateUrlMetadata {
    param(
        [Parameter(Mandatory = $true)][string]$TemplateUrl,
        [Parameter(Mandatory = $true)][string]$TenantUrl
    )

    $tenantUri = $null
    if (-not [System.Uri]::TryCreate($TenantUrl, [System.UriKind]::Absolute, [ref]$tenantUri)) {
        return $null
    }

    $candidateTemplateUrl = [string]$TemplateUrl
    if ([string]::IsNullOrWhiteSpace($candidateTemplateUrl)) {
        return $null
    }

    $candidateTemplateUrl = $candidateTemplateUrl.Trim()
    $candidateTemplateUrl = $candidateTemplateUrl.Replace('{fqdn}', $tenantUri.Host)

    # Support server-relative URLs by anchoring them to the current tenant host.
    if ($candidateTemplateUrl.StartsWith('/')) {
        $candidateTemplateUrl = "{0}://{1}{2}" -f $tenantUri.Scheme, $tenantUri.Host, $candidateTemplateUrl
    }

    $templateUri = $null
    if (-not [System.Uri]::TryCreate($candidateTemplateUrl, [System.UriKind]::Absolute, [ref]$templateUri)) {
        return $null
    }

    if (-not ($templateUri.Host.Equals($tenantUri.Host, [System.StringComparison]::OrdinalIgnoreCase))) {
        return $null
    }

    $serverRelativePath = [System.Uri]::UnescapeDataString($templateUri.AbsolutePath)
    if ([string]::IsNullOrWhiteSpace($serverRelativePath)) {
        return $null
    }

    $templateSitePath = ''
    $pathSegments = @($templateUri.AbsolutePath.Trim('/').Split('/'))
    if ($pathSegments.Count -ge 2 -and ($pathSegments[0] -in @('sites', 'teams'))) {
        $templateSitePath = '/' + $pathSegments[0] + '/' + $pathSegments[1]
    }

    $templateSiteUrl = '{0}://{1}{2}' -f $templateUri.Scheme, $templateUri.Host, $templateSitePath

    $fileName = [System.IO.Path]::GetFileName($serverRelativePath)
    if ([string]::IsNullOrWhiteSpace($fileName)) {
        return $null
    }

    return [pscustomobject]@{
        Url = $TemplateUrl
        ServerRelativePath = $serverRelativePath
        FileName = $fileName
        TemplateSiteUrl = $templateSiteUrl
    }
}

function Save-ExternalTemplates {
    param(
        [Parameter(Mandatory = $true)]$ScenarioPages,
        [Parameter(Mandatory = $true)][string]$ScenarioOutPath,
        [Parameter(Mandatory = $true)][string]$TenantUrl,
        [Parameter(Mandatory = $true)][string]$ResolvedClientId,
        [Parameter(Mandatory = $true)][string]$PageSiteUrl,
        [Parameter(Mandatory = $true)]$Connection
    )

    $templateUrls = @(Get-ExternalTemplateUrlsFromObject -Object $ScenarioPages)
    if ($templateUrls.Count -eq 0) {
        return @()
    }

    $scenarioDirectory = Split-Path -Path $ScenarioOutPath -Parent
    $scenarioBaseName = [System.IO.Path]::GetFileNameWithoutExtension($ScenarioOutPath)
    $externalTemplatesDirectory = Join-Path $scenarioDirectory "$scenarioBaseName-assets\external-templates"

    if (-not (Test-Path -LiteralPath $externalTemplatesDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $externalTemplatesDirectory -Force | Out-Null
    }

    $templateEntries = [System.Collections.Generic.List[object]]::new()
    $connectionBySite = @{}
    $connectionBySite[$PageSiteUrl] = $Connection

    foreach ($templateUrl in $templateUrls) {
        $metadata = Get-ExternalTemplateUrlMetadata -TemplateUrl $templateUrl -TenantUrl $TenantUrl
        if ($null -eq $metadata) {
            Write-Warning "Skipping external template URL '$templateUrl' because it is not an absolute URL in tenant '$TenantUrl'."
            continue
        }

        $hashInput = [System.Text.Encoding]::UTF8.GetBytes($metadata.Url)
        $hashBytes = [System.Security.Cryptography.SHA1]::HashData($hashInput)
        $hash = -join ($hashBytes | ForEach-Object { $_.ToString('x2') })
        $shortHash = $hash.Substring(0, 8)

        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($metadata.FileName)
        $extension = [System.IO.Path]::GetExtension($metadata.FileName)
        if ([string]::IsNullOrWhiteSpace($extension)) {
            $extension = '.html'
        }

        $safeFileName = "$baseName-$shortHash$extension"
        $localPath = Join-Path $externalTemplatesDirectory $safeFileName

        $downloadConnection = $Connection
        if (-not [string]::IsNullOrWhiteSpace([string]$metadata.TemplateSiteUrl)) {
            if (-not $connectionBySite.ContainsKey($metadata.TemplateSiteUrl)) {
                $connectionBySite[$metadata.TemplateSiteUrl] = Connect-InteractivePnP -Url $metadata.TemplateSiteUrl -ResolvedClientId $ResolvedClientId
            }

            $downloadConnection = $connectionBySite[$metadata.TemplateSiteUrl]
        }

        try {
            $templateContent = Get-PnPFile -Url $metadata.ServerRelativePath -AsString -Connection $downloadConnection
            Set-Content -LiteralPath $localPath -Value $templateContent -Encoding utf8
        }
        catch {
            Write-Warning "Failed to export external template '$templateUrl'. Error: $($_.Exception.Message)"
            continue
        }

        $relativePath = [System.IO.Path]::GetRelativePath($scenarioDirectory, $localPath).Replace('\\', '/')
        $templateEntries.Add([pscustomobject][ordered]@{
            sourceUrl = $metadata.Url
            filePath = $relativePath
            fileName = $safeFileName
        }) | Out-Null
    }

    return @($templateEntries | ForEach-Object { $_ })
}

function Connect-InteractivePnP {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$ResolvedClientId
    )

    return Connect-PnPOnline -Url $Url -Interactive -ClientId $ResolvedClientId -PersistLogin -ReturnConnection
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

    $controlType = Get-OptionalPropertyValue -Object $controlDefinition -PropertyName 'controlType'
    # Skip non-web-part placeholder controls (for example, exported empty section placeholders).
    if ($null -ne $controlType -and [int]$controlType -ne 3) {
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

    function Test-WebPartSupportedInFullWidthSection {
        param([Parameter(Mandatory = $true)]$WebPart)

        $componentId = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentId')
        if (-not [string]::IsNullOrWhiteSpace($componentId)) {
            return $script:FullWidthSupportedComponentIds -contains $componentId.ToLowerInvariant()
        }

        $componentKey = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentKey')
        if (-not [string]::IsNullOrWhiteSpace($componentKey)) {
            return $false
        }

        $componentAlias = [string](Get-OptionalPropertyValue -Object $WebPart -PropertyName 'componentAlias')
        if (-not [string]::IsNullOrWhiteSpace($componentAlias)) {
            return $false
        }

        return $false
    }

    $sectionNodes = @($PageNode.SelectNodes('pnp:Sections/pnp:Section', $script:XmlNamespaceManager)) |
        Sort-Object { [int]$_.Order }

    $scenarioSections = [System.Collections.Generic.List[object]]::new()
    $scenarioWebParts = [System.Collections.Generic.List[object]]::new()
    $sectionNumber = 1

    foreach ($sectionNode in $sectionNodes) {
        $controlNodes = @($sectionNode.SelectNodes('pnp:Controls/pnp:CanvasControl', $script:XmlNamespaceManager)) |
            Sort-Object { [int]$_.Column }, { [int]$_.Order }

        $sectionWebParts = [System.Collections.Generic.List[object]]::new()

        foreach ($controlNode in $controlNodes) {
            $scenarioWebPart = Convert-ControlToScenarioWebPart -CanvasControlNode $controlNode -SectionNumber $sectionNumber
            if ($null -ne $scenarioWebPart) {
                $sectionWebParts.Add($scenarioWebPart) | Out-Null
                $scenarioWebParts.Add($scenarioWebPart) | Out-Null
            }
        }

        $resolvedSectionTemplate = [string]$sectionNode.Type
        if ($resolvedSectionTemplate -eq 'OneColumnFullWidth') {
            $hasUnsupportedControls = $false
            foreach ($sectionWebPart in $sectionWebParts) {
                if (-not (Test-WebPartSupportedInFullWidthSection -WebPart $sectionWebPart)) {
                    $hasUnsupportedControls = $true
                    break
                }
            }

            if ($hasUnsupportedControls) {
                $resolvedSectionTemplate = 'OneColumn'
            }
        }

        $scenarioSections.Add([pscustomobject][ordered]@{
            template = $resolvedSectionTemplate
            order = [int]$sectionNode.Order
        }) | Out-Null

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

function Set-TemplateToSinglePage {
    param(
        [Parameter(Mandatory = $true)]$TemplateXml,
        [Parameter(Mandatory = $true)]$PageNode,
        [Parameter(Mandatory = $true)]$XmlNamespaceManager,
        [Parameter(Mandatory = $true)][string]$TemplateOutPath
    )

    $allPageNodes = @($TemplateXml.SelectNodes('//pnp:ClientSidePage', $XmlNamespaceManager))
    foreach ($candidatePageNode in $allPageNodes) {
        if ([object]::ReferenceEquals($candidatePageNode, $PageNode)) {
            continue
        }

        $null = $candidatePageNode.ParentNode.RemoveChild($candidatePageNode)
    }

    $TemplateXml.Save($TemplateOutPath)
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

Set-TemplateToSinglePage -TemplateXml $templateXml -PageNode $pageNode -XmlNamespaceManager $script:XmlNamespaceManager -TemplateOutPath $resolvedTemplateOutPath

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

$externalTemplateEntries = @(Save-ExternalTemplates -ScenarioPages $scenarioObject.pages -ScenarioOutPath $resolvedOutPath -TenantUrl $resolvedTenantUrl -ResolvedClientId $ClientId -PageSiteUrl $pageIdentity.SiteUrl -Connection $connection)
if ($externalTemplateEntries.Count -gt 0) {
    $scenarioObject.externalTemplates = @($externalTemplateEntries)
}

$scenarioObject | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $resolvedOutPath -Encoding utf8
Write-Host "Scenario exported to $resolvedOutPath" -ForegroundColor Green
Write-Host "Provisioning template exported to $resolvedTemplateOutPath" -ForegroundColor Green
if ($externalTemplateEntries.Count -gt 0) {
    Write-Host "Exported $($externalTemplateEntries.Count) external template file(s) referenced by search result layouts." -ForegroundColor Green
}