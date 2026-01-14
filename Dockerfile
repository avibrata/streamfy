FROM ghcr.io/puppeteer/puppeteer:21.5.2

USER root

WORKDIR /app

# Copy package.json from the backend folder
COPY backend/package.json ./

RUN npm install

# Copy the rest of the backend folder
COPY backend/ .

# Set Puppeteer to use the installed chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 3000

CMD ["node", "index.js"]
