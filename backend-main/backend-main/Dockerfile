FROM node:18-alpine

COPY . .

RUN npm install

ENV NODE_ENV="production"

EXPOSE 8080
CMD ["npm", "run", "start"]
