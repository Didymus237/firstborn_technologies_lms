FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --production || bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "src/server.ts"]
# Use the official Bun image
FROM oven/bun:latest

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the backend port (matches process.env.PORT or default 3000)
EXPOSE 3000

# Start the server
CMD ["bun", "src/server.ts"]
