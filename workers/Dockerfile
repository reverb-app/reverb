FROM node:alpine3.18

ENV NODE_ENV production
WORKDIR /usr/workers
COPY package.json .
RUN npm install
ADD dist .

CMD ["node", "./index.js"]
