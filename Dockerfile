FROM node

WORKDIR /usr/share
COPY . .

RUN npm install

ENV PORT=8080
EXPOSE ${PORT}

CMD [ "npm", "start" ]