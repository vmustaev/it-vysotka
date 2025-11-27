# Use the official Node.js image as the base image
FROM node:14 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application
COPY . .

# Build the application
RUN npm run build

# Stage 2 - nginx
FROM nginx:alpine

# Copy build artifacts from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]