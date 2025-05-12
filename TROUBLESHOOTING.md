# Troubleshooting GitHub Actions and Google Cloud Authentication

This document provides guidance for resolving common issues with GitHub Actions and Google Cloud authentication.

## Issue: Permission 'iam.serviceAccounts.getAccessToken' denied

When you see this error:

```bash
Error: google-github-actions/auth failed with: failed to generate Google Cloud OAuth 2.0 Access Token: 
Permission 'iam.serviceAccounts.getAccessToken' denied on resource (or it may not exist)
```

This usually means one of the following:

1. The service account doesn't have the necessary permissions
2. The Workload Identity Federation is not properly set up
3. The GitHub repository identity doesn't match what's configured in the Workload Identity Provider

### Step 1: Verify the Service Account Exists

```bash
gcloud iam service-accounts describe github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Step 2: Grant Required Permissions to the Service Account

Make sure your service account has the appropriate permissions:

```bash
# For Artifact Registry access
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

# For accessing the service account tokens (needed by Workload Identity Federation)
gcloud iam service-accounts add-iam-policy-binding github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com \
    --project=YOUR_PROJECT_ID \
    --role="roles/iam.serviceAccountTokenCreator" \
    --member="serviceAccount:github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

### Step 3: Verify Workload Identity Pool Configuration

```bash
gcloud iam workload-identity-pools describe github-pool \
    --project=YOUR_PROJECT_ID \
    --location=global
```

### Step 4: Verify Workload Identity Provider Configuration

```bash
gcloud iam workload-identity-pools providers describe github-provider \
    --project=YOUR_PROJECT_ID \
    --location=global \
    --workload-identity-pool=github-pool
```

### Step 5: Fix the IAM Binding Between GitHub Actions and the Service Account

The most important step is to ensure that the GitHub repository's identity is allowed to impersonate the service account:

```bash
REPO_OWNER="YOUR_GITHUB_USERNAME"
REPO_NAME="angular-site"
PROJECT_ID="YOUR_PROJECT_ID"

# Remove any existing incorrect bindings
gcloud iam service-accounts get-iam-policy github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
    --format=json > policy.json

# Update to create correct binding - edit policy.json as needed
# Then apply the updated policy:
gcloud iam service-accounts set-iam-policy github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com policy.json

# Add the correct binding
gcloud iam service-accounts add-iam-policy-binding github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
    --project=${PROJECT_ID} \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_ID}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${REPO_OWNER}/${REPO_NAME}"
```

Note the format of the `member` parameter, which must include the correct project ID, pool name, and repository path.

## Additional IAM Troubleshooting

If you're still having issues, you can check the IAM policy bindings on the service account:

```bash
gcloud iam service-accounts get-iam-policy github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

And verify all the relevant APIs are enabled:

```bash
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com artifactregistry.googleapis.com
```

## GitHub Actions Workflow Configuration

Ensure your GitHub Actions workflow has:

1. The correct environment variables and secrets
2. The correct permissions (id-token: write)
3. The correct formatting of the workload identity provider string
