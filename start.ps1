# Script PowerShell pour gérer l'application Docker
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod", "stop", "clean", "logs", "status", "build")]
    [string]$Action
)

function Show-Help {
    Write-Host "Usage: .\start.ps1 -Action <action>" -ForegroundColor Green
    Write-Host ""
    Write-Host "Actions disponibles:" -ForegroundColor Yellow
    Write-Host "  dev     - Démarrer en mode développement"
    Write-Host "  prod    - Démarrer en mode production"
    Write-Host "  stop    - Arrêter l'application"
    Write-Host "  clean   - Nettoyer les containers et volumes"
    Write-Host "  logs    - Voir les logs"
    Write-Host "  status  - Voir le statut des containers"
    Write-Host "  build   - Construire les images"
}

function Start-Development {
    Write-Host "🚀 Démarrage en mode développement..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml up --build
}

function Start-Production {
    Write-Host "🚀 Démarrage en mode production..." -ForegroundColor Green
    docker-compose up --build -d
    Write-Host "✅ Application démarrée!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:5001" -ForegroundColor Cyan
}

function Stop-Application {
    Write-Host "🛑 Arrêt de l'application..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Application arrêtée!" -ForegroundColor Green
}

function Clean-Application {
    Write-Host "🧹 Nettoyage des containers et volumes..." -ForegroundColor Yellow
    docker-compose down -v
    docker system prune -f
    Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📋 Affichage des logs..." -ForegroundColor Blue
    docker-compose logs -f
}

function Show-Status {
    Write-Host "📊 Statut des containers:" -ForegroundColor Blue
    docker-compose ps
}

function Build-Images {
    Write-Host "🔨 Construction des images..." -ForegroundColor Blue
    docker-compose build
    Write-Host "✅ Images construites!" -ForegroundColor Green
}

# Vérifier si Docker est installé
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier si le fichier .env existe
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Fichier .env non trouvé. Copie du fichier .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Veuillez modifier le fichier .env avec vos vraies valeurs!" -ForegroundColor Red
}

switch ($Action) {
    "dev" { Start-Development }
    "prod" { Start-Production }
    "stop" { Stop-Application }
    "clean" { Clean-Application }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "build" { Build-Images }
    default { Show-Help }
}
