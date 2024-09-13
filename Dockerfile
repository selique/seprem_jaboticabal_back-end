# Stage 1: Build stage
FROM node:slim AS builder

# Create and set working directory
WORKDIR /app

# Copy project files and install dependencies
COPY . .
RUN npm install

# Stage 2: Production image
FROM node:slim

# Install Ghostscript
RUN apt-get update && apt-get install -y ghostscript && rm -rf /var/lib/apt/lists/*

# Copy Node.js and the app from the build stage
COPY --from=builder /app /app

# Set environment variables
WORKDIR /app
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
