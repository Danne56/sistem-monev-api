# Build stage - compiles the application
FROM node:lts-alpine AS base

# Development stage
# =============================================================================
# Create a development stage based on the "base" image
FROM base AS development

# Change the working directory to /node
WORKDIR /app

# Copy the package.json and package-lock.json files to /node
COPY package*.json ./

# Install all dependencies and clean the cache
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci && npm cache clean --force

USER node
COPY --chown=node:node . .

# Document the port that may need to be published
EXPOSE 5000

# Run the `dev` script for auto-reloading
CMD ["npm", "run", "dev"]

# Production stage
# =============================================================================
# Create a production stage based on the "base" image
FROM base AS production

# Change the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the /app directory
COPY package*.json .

# Install production dependencies and clean the cache
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci --omit=dev && npm cache clean --force

# Copy the entire source code into the container
USER node
COPY --chown=node:node . .

# Document the port that may need to be published
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
