# Build stage
FROM registry.access.redhat.com/ubi9/nodejs-22@sha256:9594067bd622662b760fbf4f9075362ee372a307a90bd28041e59428fa82d205 AS build

USER root
WORKDIR /app

# Copy package.json and package-lock.json
COPY hello-world/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY hello-world/ ./

# Build the application
RUN npm run build

# Production stage
FROM registry.access.redhat.com/ubi9/nginx-124@sha256:6465906193329d883dfe2de4077e5618420fa39885107f6dacd87fe00629ef4c

# Copy built artifacts to nginx html directory
COPY --from=build /app/dist/hello-world/browser /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
