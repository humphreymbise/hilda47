FROM node:lts-buster

RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    imagemagick \
    webp \
    git && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /root/Toxic-v4

COPY package.json ./
RUN npm install && npm install -g qrcode-terminal pm2

COPY . .

EXPOSE 9090

CMD ["pm2-runtime", "start", "npm", "--", "start"]