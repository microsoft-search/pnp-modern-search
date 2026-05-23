[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ScenarioPath,

    [string]$ClientId,

    [switch]$UseUniquePageNames,

    [string]$PageName
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

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 100
}

function Ensure-PnPModule {
    if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
        throw 'PnP.PowerShell is not installed. Install it with: Install-Module PnP.PowerShell -Scope CurrentUser'
    }

    Import-Module PnP.PowerShell -ErrorAction Stop | Out-Null
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
        $keys = $Object.Keys
        if ($null -ne $keys -and $keys -contains $PropertyName) {
            return $Object[$PropertyName]
        }

        return $null
    }

    $keysProperty = $Object.PSObject.Properties['Keys']
    if ($null -ne $keysProperty) {
        $keys = $keysProperty.Value
        if ($null -ne $keys -and $keys -contains $PropertyName) {
            return $Object[$PropertyName]
        }

        return $null
    }

    $containsKeyMethod = $Object.PSObject.Methods['ContainsKey']
    if ($null -ne $containsKeyMethod) {
        if ([bool]$Object.ContainsKey($PropertyName)) {
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

function Get-AuthSettings {
    param(
        [Parameter(Mandatory = $true)]$Scenario,
        [Parameter(Mandatory = $true)][bool]$HasClientIdOverride
    )

    $scenarioAuth = $null
    if ($null -ne $Scenario.auth) {
        $scenarioAuth = $Scenario.auth
    }

    $scenarioClientId = $null
    if ($null -ne $scenarioAuth) {
        $scenarioClientId = $scenarioAuth.PSObject.Properties['clientId']
    }

    $resolvedClientId = $ClientId
    if (-not $HasClientIdOverride -and $null -ne $scenarioClientId -and -not [string]::IsNullOrWhiteSpace([string]$scenarioClientId.Value)) {
        $resolvedClientId = [string]$scenarioClientId.Value
    }

    if ([string]::IsNullOrWhiteSpace($resolvedClientId)) {
        throw 'A PnP client id must be provided either via -ClientId or scenario.auth.clientId.'
    }

    return [pscustomobject]@{ ClientId = $resolvedClientId }
}

function Get-SiteDefinition {
    param([Parameter(Mandatory = $true)]$Scenario)

    if ($null -eq $Scenario.site -or [string]::IsNullOrWhiteSpace([string]$Scenario.site.url)) {
        throw 'scenario.site.url is required.'
    }

    return [pscustomobject]@{ Url = [string]$Scenario.site.url }
}

function Connect-InteractivePnP {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$ResolvedClientId
    )

    return Connect-PnPOnline -Url $Url -Interactive -ClientId $ResolvedClientId -ReturnConnection
}

function Get-ScenarioPageNames {
    param([Parameter(Mandatory = $true)]$Scenario)

    $names = [System.Collections.Generic.List[string]]::new()
    foreach ($pageDefinition in @($Scenario.pages)) {
        $name = [string](Get-OptionalPropertyValue -Object $pageDefinition -PropertyName 'name')
        if (-not [string]::IsNullOrWhiteSpace($name)) {
            $names.Add($name)
        }
    }

    return $names
}

function Get-LatestMatchingPageItem {
    param(
        [Parameter(Mandatory = $true)][string]$RequestedPageName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($RequestedPageName)
    $extension = [System.IO.Path]::GetExtension($RequestedPageName)
    $viewXml = @"
<View>
  <ViewFields>
    <FieldRef Name='FileLeafRef'/>
    <FieldRef Name='FileRef'/>
    <FieldRef Name='Modified'/>
    <FieldRef Name='CheckoutUser'/>
    <FieldRef Name='_ModerationStatus'/>
    <FieldRef Name='Editor'/>
    <FieldRef Name='GUID'/>
  </ViewFields>
  <Query>
    <Where>
      <BeginsWith>
        <FieldRef Name='FileLeafRef'/>
        <Value Type='File'>$baseName</Value>
      </BeginsWith>
    </Where>
    <OrderBy>
      <FieldRef Name='Modified' Ascending='FALSE' />
    </OrderBy>
  </Query>
</View>
"@

    $items = @(Get-PnPListItem -List 'Site Pages' -Query $viewXml -Connection $SiteConnection)
    foreach ($item in $items) {
        $leafName = [string](Get-OptionalPropertyValue -Object $item.FieldValues -PropertyName 'FileLeafRef')
        if ($leafName -eq $RequestedPageName -or ($leafName -like "$baseName-*$extension")) {
            return $item
        }
    }

    return $null
}

function Write-RecentSitePages {
        param([Parameter(Mandatory = $true)]$SiteConnection)

        $viewXml = @"
<View>
    <ViewFields>
        <FieldRef Name='FileLeafRef'/>
        <FieldRef Name='Modified'/>
        <FieldRef Name='CheckoutUser'/>
        <FieldRef Name='_ModerationStatus'/>
    </ViewFields>
    <Query>
        <OrderBy>
            <FieldRef Name='Modified' Ascending='FALSE' />
        </OrderBy>
    </Query>
    <RowLimit>10</RowLimit>
</View>
"@

        $items = @(Get-PnPListItem -List 'Site Pages' -Query $viewXml -Connection $SiteConnection)
        if ($items.Count -eq 0) {
                Write-Host 'Recent Site Pages    : none returned'
                return
        }

        $summary = foreach ($item in $items) {
                [pscustomobject]@{
                        FileLeafRef = [string](Get-OptionalPropertyValue -Object $item.FieldValues -PropertyName 'FileLeafRef')
                        Modified = Get-OptionalPropertyValue -Object $item.FieldValues -PropertyName 'Modified'
                        ModerationStatus = Get-OptionalPropertyValue -Object $item.FieldValues -PropertyName '_ModerationStatus'
                        CheckoutUser = Get-OptionalPropertyValue -Object $item.FieldValues -PropertyName 'CheckoutUser'
                }
        }

        $summary | Format-Table -AutoSize | Out-String | Write-Host
}

function Write-ItemState {
    param([Parameter(Mandatory = $true)]$Item)

    $fieldValues = $Item.FieldValues
    $checkoutUser = Get-OptionalPropertyValue -Object $fieldValues -PropertyName 'CheckoutUser'
    $editor = Get-OptionalPropertyValue -Object $fieldValues -PropertyName 'Editor'

    [pscustomobject]@{
        Id = $Item.Id
        FileLeafRef = [string](Get-OptionalPropertyValue -Object $fieldValues -PropertyName 'FileLeafRef')
        FileRef = [string](Get-OptionalPropertyValue -Object $fieldValues -PropertyName 'FileRef')
        Modified = Get-OptionalPropertyValue -Object $fieldValues -PropertyName 'Modified'
        ModerationStatus = Get-OptionalPropertyValue -Object $fieldValues -PropertyName '_ModerationStatus'
        CheckoutUser = if ($null -ne $checkoutUser) { [string](Get-OptionalPropertyValue -Object $checkoutUser -PropertyName 'LookupValue') } else { $null }
        Editor = if ($null -ne $editor) { [string](Get-OptionalPropertyValue -Object $editor -PropertyName 'LookupValue') } else { $null }
        Guid = [string](Get-OptionalPropertyValue -Object $fieldValues -PropertyName 'GUID')
    } | Format-List | Out-String | Write-Host
}

function Write-CheckedOutState {
    param(
        [Parameter(Mandatory = $true)][string]$PageFileName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $checkedOutPages = @(Get-PnPFileCheckedOut -List 'Site Pages' -Connection $SiteConnection -ErrorAction SilentlyContinue)
    $matchingCheckedOutPage = $checkedOutPages |
        Where-Object {
            $leafName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'FileLeafRef')
            $fileName = [string](Get-OptionalPropertyValue -Object $_ -PropertyName 'FileName')
            $PageFileName -eq $leafName -or $PageFileName -eq $fileName
        } |
        Select-Object -First 1

    if ($null -eq $matchingCheckedOutPage) {
        Write-Host 'CheckedOutInSitePages : False'
        return
    }

    $checkedOutBy = [string](Get-OptionalPropertyValue -Object $matchingCheckedOutPage -PropertyName 'CheckedOutBy')
    if ([string]::IsNullOrWhiteSpace($checkedOutBy)) {
        $checkedOutBy = [string](Get-OptionalPropertyValue -Object $matchingCheckedOutPage -PropertyName 'CheckedOutByUserName')
    }

    Write-Host "CheckedOutInSitePages : True"
    Write-Host "CheckedOutBy         : $checkedOutBy"
}

function Write-ComponentState {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)]$SiteConnection
    )

    $components = @(Get-PnPPageComponent -Page $PageName -Connection $SiteConnection -ErrorAction SilentlyContinue)
    if ($components.Count -eq 0) {
        Write-Host 'Components          : none returned'
        return
    }

    $summary = foreach ($component in $components) {
        [pscustomobject]@{
            Id = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Id')
            Name = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Name')
            Title = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'Title')
            InstanceId = [string](Get-OptionalPropertyValue -Object $component -PropertyName 'InstanceId')
        }
    }

    $summary | Format-Table -AutoSize | Out-String | Write-Host
}

Ensure-PnPModule

$scenarioFullPath = Resolve-AbsolutePath -Path $ScenarioPath -BasePath (Get-Location).Path
$scenario = Read-JsonFile -Path $scenarioFullPath
$authSettings = Get-AuthSettings -Scenario $scenario -HasClientIdOverride $PSBoundParameters.ContainsKey('ClientId')
$siteDefinition = Get-SiteDefinition -Scenario $scenario

Write-Step "Connecting to $($siteDefinition.Url)"
$siteConnection = Connect-InteractivePnP -Url $siteDefinition.Url -ResolvedClientId $authSettings.ClientId

$pageNames = if (-not [string]::IsNullOrWhiteSpace($PageName)) { @($PageName) } else { @(Get-ScenarioPageNames -Scenario $scenario) }

foreach ($requestedPageName in $pageNames) {
    Write-Step "Inspecting page based on $requestedPageName"

    $pageItem = if ($UseUniquePageNames) {
        Get-LatestMatchingPageItem -RequestedPageName $requestedPageName -SiteConnection $siteConnection
    }
    else {
        Get-LatestMatchingPageItem -RequestedPageName $requestedPageName -SiteConnection $siteConnection
    }

    if ($null -eq $pageItem) {
        Write-Host "No Site Pages item found for '$requestedPageName'." -ForegroundColor Yellow
        Write-Host ''
        Write-Host 'Recent Site Pages items:'
        Write-RecentSitePages -SiteConnection $siteConnection
        continue
    }

    Write-ItemState -Item $pageItem

    $resolvedPageName = [string](Get-OptionalPropertyValue -Object $pageItem.FieldValues -PropertyName 'FileLeafRef')
    Write-CheckedOutState -PageFileName $resolvedPageName -SiteConnection $siteConnection
    Write-Host ''
    Write-Host 'Components:'
    Write-ComponentState -PageName $resolvedPageName -SiteConnection $siteConnection
}