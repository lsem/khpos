# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/
FROM node:12
WORKDIR /usr/src/orders_back
COPY package*.json ./
COPY . .
RUN npm install
RUN ls -l
RUN ./tests_unit.sh
RUN ./build.sh
EXPOSE 5500
ENV NODE_PATH ./build/src/
CMD ["node", "./build/src/webMain.js"]

