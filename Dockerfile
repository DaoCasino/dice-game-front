# TODO: need change
FROM sham1316/jenkins-jnlp-slave:3 as builder

WORKDIR /sources
COPY package.json ./
RUN yarn install

COPY ./ ./
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN yarn build

FROM nginx:1.15.8-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY --from=builder /sources/dist .

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]