FROM kallikrein/sails:0.11.0

RUN npm install nodemon -g

EXPOSE 1337

WORKDIR /usr/src/app

CMD ["sails", "lift"]
