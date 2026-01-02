# Check if git is available
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/downloads and try again."
    exit 1
}

# Initialize Git
if (-not (Test-Path ".git")) {
    items "Initializing Git repository..."
    git init
}

# Add all files
Write-Host "Adding files..."
git add .

# Commit
Write-Host "Committing..."
git commit -m "Initial commit of AskLyn RAG app"

# Branch rename to main
git branch -M main

# Add remote
$remoteUrl = "https://github.com/Kishore2723/asklyn.git"
if (git remote | Select-String "origin") {
    Write-Host "Remote origin already exists. Updating..."
    git remote set-url origin $remoteUrl
}
else {
    Write-Host "Adding remote origin..."
    git remote add origin $remoteUrl
}

# Push
Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Done!" -ForegroundColor Green
