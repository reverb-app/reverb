FROM node:alpine3.18

ENV NODE_ENV production
env PORT 3000
EXPOSE 3000
WORKDIR /usr/ingress
COPY package.json .
RUN npm install
ADD dist .

CMD ["node", "./src/index.js"]
