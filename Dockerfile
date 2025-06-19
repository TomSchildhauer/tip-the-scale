# ---- Stage 1: Build ----
# Use a Node.js image to build our assets
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=development

# Copy the rest of the source files
# (Ensure you've restructured your project into a 'src' directory as discussed)
COPY src/ ./src/

# Run the build script defined in package.json
# This will compile SCSS, copy JS, HTML, images, and other assets to a 'dist' folder
RUN npm run build

# Serve
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.25-alpine

# Copy the built assets from the 'builder' stage's 'dist' folder
# to Nginx's default web root directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]