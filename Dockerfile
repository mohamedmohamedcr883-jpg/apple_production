FROM node:20-alpine

# Set working directory
WORKDIR /app

EXPOSE 3000

# Copy the backend package.json files
COPY BE/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend source code
COPY BE/ ./

# Build the TypeScript code
RUN npm run build

# Start the Express server
CMD ["npm", "start"]
