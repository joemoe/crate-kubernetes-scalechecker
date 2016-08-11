FROM node:4.4
COPY check.js .
COPY config.json .
COPY package.json .
RUN npm install
CMD node check.js