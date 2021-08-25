FROM node:14 as site-builder
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .
RUN ./node_modules/.bin/astro build

FROM nginx:stable-alpine
COPY --from=site-builder /app/dist /usr/share/nginx/html
