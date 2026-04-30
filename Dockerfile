FROM node:22-alpine

# Install build essentials for native modules if needed
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy server package files to preserve structure for postinstall
COPY server/package*.json ./server/

# Install ALL dependencies (including devDependencies for build)
# Root postinstall will handle server/npm install
RUN npm install

# Copy all source code
COPY . .

# Set dummy DATABASE_URL for build phase (Next.js build sometimes needs it)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NODE_ENV=production

# Build both frontend and backend
RUN npm run build

# Expose the port (Render uses PORT env var, but defaults to 3000)
EXPOSE 3000

# Start both using the root start script we just configured
# This will run migrations and then start both servers concurrently
CMD ["npm", "start"]