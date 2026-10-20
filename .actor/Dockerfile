FROM apify/actor-node-playwright-chrome:22 AS builder
COPY --chown=myuser package*.json ./
RUN npm install --include=dev --audit=false
COPY --chown=myuser . ./
RUN npm run build
FROM apify/actor-node-playwright-chrome:22
COPY --chown=myuser package*.json ./
RUN npm --quiet set progress=false && npm install --omit=dev --audit=false
COPY --from=builder --chown=myuser /home/myuser/dist ./dist
COPY --chown=myuser . ./
CMD npm run start --silent
