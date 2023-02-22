FROM node:12.13.0

# Set working dir in the container to /
WORKDIR /app

# Copy application to / directory and install dependencies
COPY package*.json ./
RUN npm install
COPY . .
RUN npm i typescript@latest
RUN npm i ts-node@latest
RUN npm run gen
RUN npm run build
# Expose port 8081 to the outside once the container has launched
EXPOSE 4040

# what should be executed when the Docker image is launching
CMD [ "npm", "run", "start" ]
