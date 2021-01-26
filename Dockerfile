FROM node:alpine as builder

ARG mock
ARG backendAddr

WORKDIR /sources
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY ./ ./
ENV GAME_IS_MOCK=$mock
ENV BACKEND_ADDR=$backendAddr
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN echo "=> build mock: $mock, backendAddr: $backendAddr" && yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY --from=builder /sources/build .
COPY --from=builder /sources/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
