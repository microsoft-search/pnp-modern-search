[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$searchPartsRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))

Push-Location $searchPartsRoot
try {
    & pnpm build
    if ($LASTEXITCODE -ne 0) {
        throw "pnpm build failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}