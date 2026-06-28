FROM node:18-alpine

# Install Python and ffmpeg (required by yt-dlp)
RUN apk add --no-cache python3 py3-pip ffmpeg

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose the API port
EXPOSE 8080

# Start the server
CMD [ "npm", "start" ]
