FROM node:alpine

WORKDIR /usr/src/solar
COPY . /usr/src/solar 

RUN npm install

EXPOSE 3000
EXPOSE 80
EXPOSE 8080
EXPOSE 443

CMD [ "node", "app.js" ]
