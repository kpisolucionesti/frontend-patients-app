FROM node:18-alpine AS build
WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY . .
RUN yarn
RUN yarn build
# CMD [ "yarn", "start" ]

FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/hmtl/*
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]

# FROM httpd:alpine
# COPY --from=build /app/build /usr/local/apache2/htdocs
# # COPY /apache/httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf
# COPY /apache/httpd.conf /usr/local/apache2/conf/httpd.conf
# EXPOSE 80
# CMD ["httpd-foreground"]