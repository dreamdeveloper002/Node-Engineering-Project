FROM node:alpine

ENV NODE_ENV=development

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package.json package-lock.json* ./

RUN apk add --no-cache tini curl

COPY . /home/node/app/

RUN chown -R node:node /home/node

RUN npm install --no-optional && npm cache clean --force

RUN npm i -g @adonisjs/cli

USER node

EXPOSE 3333

ENTRYPOINT ["tini", "--"]

CMD ["node","ace","serve","--watch"]