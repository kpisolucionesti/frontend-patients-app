FROM node:18-alpine AS base
WORKDIR /app
COPY package.json .
COPY . .
RUN yarn

FROM base AS dev
COPY yarn.lock .
CMD [ "yarn", "start" ]

FROM base AS produ
RUN yarn build

FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/hmtl/*
COPY --from=produ /app/build /usr/share/nginx/html
COPY --from=produ /app/nginx/nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]
