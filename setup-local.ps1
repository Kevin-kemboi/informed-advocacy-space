# PowerShell script for setting up local development

Write-Host "Setting up CivicConnect for local development..." -ForegroundColor Cyan

# Ensure dependencies are installed
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Start development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "You can access the application at http://localhost:5173" -ForegroundColor Cyan
npm run dev
