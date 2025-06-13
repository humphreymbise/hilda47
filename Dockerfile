FROM node:lts-buster
WORKDIR /root/Toxic-v4
COPY . .
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1
EXPOSE 9090
CMD ["npm", "start"]
