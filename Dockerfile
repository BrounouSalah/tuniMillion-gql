# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install --save-dev @types/ioredis
# Copy the rest of the project files
COPY . .
RUN npm run gen
# Set the command to run when the container starts
CMD [ "npm","run", "start" ]