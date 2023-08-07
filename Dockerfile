# Building app
FROM node:16 as build

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Using the build
FROM node:16

COPY docker-entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
# add app
COPY --from=build /home/node/app/dist /home/node/app/dist
COPY --from=build /home/node/app/node_modules /home/node/app/node_modules
COPY package*.json ./

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD [ "npm", "run", "start:prod" ]
