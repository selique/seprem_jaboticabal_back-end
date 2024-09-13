# Stage 1: Build stage
FROM debian:bullseye as builder

# Set Node.js version
ENV PATH=/usr/local/node/bin:$PATH
ARG NODE_VERSION=20.11.1

# Install Node.js, Python, and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python-is-python3 \
    pkg-config \
    build-essential \
    && curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ \
    && /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node \
    && rm -rf /tmp/node-build-master

# Create and set working directory
RUN mkdir /app
WORKDIR /app

# Copy project files and install dependencies
COPY . .
RUN npm install

# Stage 2: Production image
FROM debian:bullseye-slim

# Install Ghostscript in the slim production image
RUN apt-get update && apt-get install -y \
    ghostscript \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Node.js and the app from the build stage
COPY --from=builder /usr/local/node /usr/local/node
COPY --from=builder /app /app

# Set environment variables
WORKDIR /app
ENV NODE_ENV production
ENV PATH /usr/local/node/bin:$PATH

# Start the application
CMD ["npm", "run", "start"]