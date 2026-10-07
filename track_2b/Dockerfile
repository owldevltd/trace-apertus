# Trace runs on Node alone: no install step, no build step. The model is reached over the network (BASE_URL).
FROM node:20-alpine

WORKDIR /app
COPY package.json ./
COPY src ./src
COPY data ./data

ENV PORT=8080
EXPOSE 8080
VOLUME [ "/app/storage" ]

CMD [ "node", "src/server.js" ]
