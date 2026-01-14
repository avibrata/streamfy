FROM ghcr.io/puppeteer/puppeteer:21.5.2

USER root

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Set Puppeteer to use the installed chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 3000

CMD ["node", "index.js"]
