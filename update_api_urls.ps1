$files = Get-ChildItem -Path "c:\stageWave\smartHome\client\src\" -Recurse -Include "*.js" | Select-String -Pattern "http://localhost:5000" | Group-Object Path | Select-Object -ExpandProperty Name

foreach ($file in $files) {
    Write-Host "Processing $file"
    $content = Get-Content -Path $file -Raw
    $updatedContent = $content -replace 'http://localhost:5000', '${config.API_URL}'
    
    # Check if the file imports config
    if (-not ($content -match "import config from")) {
        # Add config import after other imports
        if ($updatedContent -match "(import .+;[\r\n]+)+") {
            $lastImport = $Matches[0]
            $updatedContent = $updatedContent -replace [regex]::Escape($lastImport), "$lastImport`nimport config from '../config';"
        }
    }
    
    Set-Content -Path $file -Value $updatedContent
}

Write-Host "Done updating files."
