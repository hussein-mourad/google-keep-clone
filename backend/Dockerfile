# Use Bun official image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the project
COPY . .

# Expose port (Render will override it anyway)
EXPOSE 3000

RUN bun build:css

# Start the app
CMD ["bun", "start"]
