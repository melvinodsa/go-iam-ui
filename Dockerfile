FROM node:20-alpine

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy only package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm dependencies
RUN corepack prepare pnpm@8.15.4 --activate && pnpm install --frozen-lockfile

# Copy entire project including source files
COPY . .

# Expose the preview port
EXPOSE 4173

# Entry script to build using VITE_API_SERVER and preview
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
