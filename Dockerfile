FROM node:lts-buster
RUN git clone https://github.com/xhclintohn/Toxic-v5/root/Toxic-v4
WORKDIR /root/Toxic-v4
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1
COPY . .
EXPOSE 9090
CMD ["npm", "start"]
