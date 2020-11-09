FROM node:14

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./src/index*.json ./

RUN npm install

COPY . .

EXPOSE 3000

#lunch app production/development
#CMD [ "npm", "run", "start" ]
CMD [ "npm", "run", "dev" ]
