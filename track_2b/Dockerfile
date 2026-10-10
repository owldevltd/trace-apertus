# Trace runs on Node with one library, pdf-lib for writing the filled PDF; no build step. The model is reached
# over the network (LLM_BASE_URL).
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY src ./src
COPY data ./data

ENV PORT=8080
EXPOSE 8080
VOLUME [ "/app/storage" ]

CMD [ "node", "src/server.js" ]
