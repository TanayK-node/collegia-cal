# Stage 1: Build the application
FROM oven/bun:1 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the dependency files
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the Vite React application
RUN bun run build


# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built static files from the builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]