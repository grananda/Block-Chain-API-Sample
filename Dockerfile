# Step 1: Build the app in image 'builder'
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json ./

RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY . .

ARG PORT='3000'

EXPOSE ${PORT}

CMD ["node", "index.js"]