FROM node:alpine3.18

ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000
WORKDIR /usr/ingress
COPY package.json .
RUN npm install
COPY . .

RUN npx tsc
CMD ["node", "./dist/src/index.js"]
