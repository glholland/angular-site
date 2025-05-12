# Angular Hello World Application

This repository contains a simple Angular Hello World application with CI/CD automation using GitHub Actions.

## Features

- Basic Angular application setup
- Containerized using Docker
- CI/CD pipeline with GitHub Actions
- Automated deployment to Google Artifact Registry

## Project Structure

- `hello-world/`: Angular application directory
- `Dockerfile`: Container definition for the application
- `.github/workflows/build-deploy.yml`: GitHub Actions workflow definition

## Getting Started

### Local Development

```bash
cd hello-world
npm install
npm start
```

The application will be available at <http://localhost:4200>

### Container Build

```bash
docker build -t angular-hello-world .
docker run -p 8080:80 angular-hello-world
```

The application will be available at <http://localhost:8080>

## CI/CD Setup

This project uses GitHub Actions for CI/CD to build and deploy the application to Google Artifact Registry.

For detailed setup instructions, see [CI_CD_SETUP.md](CI_CD_SETUP.md)
