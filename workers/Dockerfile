FROM node:alpine3.18

ENV NODE_ENV production
WORKDIR /usr/ingress
COPY package.json .
RUN npm install
COPY . .

RUN npx tsc
CMD ["node", "./dist/index.js"]
