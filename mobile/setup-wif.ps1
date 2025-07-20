# Workload Identity Federation Setup Script for FailShare
param(
    [Parameter(Mandatory=$true)]
    [string]$RepoOwner,
    [string]$RepoName = "FailShare"
)

$ErrorActionPreference = "Stop"

# Set UTF-8 encoding
$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding

# Color functions
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }

# Configuration
$ProjectId = "failshare-app"
$PoolId = "github-actions-pool"
$ProviderId = "github-actions-provider"
$ServiceAccountName = "github-actions-sa"

Write-Info "Starting Workload Identity Federation setup..."
Write-Info "GitHub Repository: $RepoOwner/$RepoName"

# Step 1: Create Service Account
Write-Info "Creating service account..."
$saExists = gcloud iam service-accounts list --filter="displayName:'GitHub Actions FailShare'" --format="value(email)" 2>$null
if ($saExists) {
    Write-Warning "Service account already exists: $saExists"
} else {
    gcloud iam service-accounts create $ServiceAccountName --description="GitHub Actions service account for FailShare" --display-name="GitHub Actions FailShare"
    Write-Success "Service account created successfully"
}

# Step 2: Grant permissions
Write-Info "Granting permissions..."
$serviceAccountEmail = "${ServiceAccountName}@${ProjectId}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$serviceAccountEmail" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$serviceAccountEmail" --role="roles/storage.admin"
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$serviceAccountEmail" --role="roles/artifactregistry.admin"

Write-Success "Permissions granted successfully"

# Step 3: Create Workload Identity Pool
Write-Info "Creating Workload Identity Pool..."
$poolExists = gcloud iam workload-identity-pools describe $PoolId --location="global" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Warning "Workload Identity Pool already exists"
} else {
    gcloud iam workload-identity-pools create $PoolId --location="global" --description="GitHub Actions pool for FailShare" --display-name="GitHub Actions Pool"
    Write-Success "Workload Identity Pool created successfully"
}

# Step 4: Create Workload Identity Provider
Write-Info "Creating Workload Identity Provider..."
$providerExists = gcloud iam workload-identity-pools providers describe $ProviderId --location="global" --workload-identity-pool=$PoolId 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Warning "Workload Identity Provider already exists"
} else {
    gcloud iam workload-identity-pools providers create-oidc $ProviderId --location="global" --workload-identity-pool=$PoolId --display-name="GitHub Actions Provider" --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" --issuer-uri="https://token.actions.githubusercontent.com"
    Write-Success "Workload Identity Provider created successfully"
}

# Step 5: Get project number
Write-Info "Getting project information..."
$ProjectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
Write-Success "Project number: $ProjectNumber"

# Step 6: Grant service account permissions
Write-Info "Setting up service account permissions..."
$principalSet = "principalSet://iam.googleapis.com/projects/${ProjectNumber}/locations/global/workloadIdentityPools/${PoolId}/attribute.repository/${RepoOwner}/${RepoName}"
gcloud iam service-accounts add-iam-policy-binding $serviceAccountEmail --role="roles/iam.workloadIdentityUser" --member=$principalSet
Write-Success "Service account permissions configured"

# Step 7: Output configuration
Write-Host ""
Write-Success "Setup completed successfully!"
Write-Host ""
Write-Info "GitHub Secrets configuration:"
Write-Host ""

$WifProvider = "projects/${ProjectNumber}/locations/global/workloadIdentityPools/${PoolId}/providers/${ProviderId}"
$WifServiceAccount = $serviceAccountEmail

Write-Host "WIF_PROVIDER=$WifProvider" -ForegroundColor Yellow
Write-Host "WIF_SERVICE_ACCOUNT=$WifServiceAccount" -ForegroundColor Yellow

Write-Host ""
Write-Info "Please add these values to your GitHub repository secrets."
Write-Host "" 