FROM node:lts-buster
RUN git clone https://github.com/xhclintohn/Toxic-v4/root/Toxic-MD
WORKDIR /root/Toxic-MD
RUN npm install && npm install -g pm2 || yarn install --network-concurrency 1
COPY . .
EXPOSE 9090
CMD ["npm", "start"]
