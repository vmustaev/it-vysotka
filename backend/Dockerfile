# Use Node.js image as base
FROM node:20-alpine

# Install postgresql-client for pg_dump
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 4000

# Command to run the application
CMD ["node", "server.js"]