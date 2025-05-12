# Angular Site with GitHub Actions CI/CD

This repository contains an Angular application with automated CI/CD using GitHub Actions to build and deploy the application to Google Artifact Registry.

## GitHub Actions Workflow

The GitHub Actions workflow will:

1. Build the Angular application
2. Create a Docker container with the built application
3. Push the container image to Google Artifact Registry

## Required GitHub Secrets

To use the GitHub Actions workflow, you need to set up the following secrets in your GitHub repository:

- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `ARTIFACT_REGISTRY_LOCATION`: Region for your Artifact Registry (e.g., `us-east1`)
- `ARTIFACT_REGISTRY_REPOSITORY`: Name of your Artifact Registry repository
- `WORKLOAD_IDENTITY_PROVIDER`: The Workload Identity Provider for GitHub Actions (format: `projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider`)
- `SERVICE_ACCOUNT`: The email address of your GCP service account that has permissions to push to Artifact Registry

## Setting Up Google Cloud for GitHub Actions

### 1. Enable Required APIs

```bash
gcloud services enable artifactregistry.googleapis.com iam.googleapis.com iamcredentials.googleapis.com
```

### 2. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create [REPOSITORY_NAME] --repository-format=docker --location=[LOCATION] --description="Docker repository for Angular app"
```

### 3. Set Up Workload Identity Federation for GitHub Actions

```bash
# Create a workload identity pool
gcloud iam workload-identity-pools create "github-actions-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create a workload identity provider in that pool
gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get the workload identity pool ID
gcloud iam workload-identity-pools describe "github-actions-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="value(name)"
```

### 4. Create a Service Account and Grant IAM Permissions

```bash
# Store project variables
PROJECT_ID=$(gcloud config get-value project)
REPO_OWNER="[YOUR_GITHUB_USERNAME]"  # Replace with your GitHub username
REPO_NAME="angular-site"
REPOSITORY_NAME="[YOUR_ARTIFACT_REPO_NAME]"  # Replace with your Artifact Registry repository name
LOCATION="[YOUR_LOCATION]"  # Replace with your location, e.g., us-central1

# Create a service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account"

# Grant the service account permission to push to Artifact Registry
gcloud artifacts repositories add-iam-policy-binding ${REPOSITORY_NAME} \
  --location=${LOCATION} \
  --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Grant the service account permission to access its own tokens
# This is required for Workload Identity Federation
gcloud iam service-accounts add-iam-policy-binding github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --project="${PROJECT_ID}" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Allow the GitHub Actions provider to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_ID}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

# Store the service account email for GitHub secret
SERVICE_ACCOUNT="github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"
echo "SERVICE_ACCOUNT: ${SERVICE_ACCOUNT}"
```

## Local Development

To run the application locally:

```bash
cd hello-world
npm install
npm start
```

## Building and Running the Docker Container Locally

```bash
# Build the container
docker build -t angular-hello-world .

# Run the container
docker run -p 8080:80 angular-hello-world
```

Then access the application at <http://localhost:8080>

## Troubleshooting Authentication Issues

If you encounter authentication issues with GitHub Actions and Google Cloud, please refer to the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide for detailed solutions to common problems, including:

- Fixing "Permission 'iam.serviceAccounts.getAccessToken' denied" errors
- Verifying Workload Identity configuration
- Checking IAM permissions and bindings
