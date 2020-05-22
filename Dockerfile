FROM node:alpine as builder

ARG mock
ARG backendAddr

WORKDIR /sources
COPY package.json ./
RUN yarn install

COPY ./ ./
ENV GAME_IS_MOCK=$mock
ENV BACKEND_ADDR=$backendAddr
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN echo "=> build mock: $mock, backendAddr: $backendAddr" && yarn build

FROM nginx:1.15.8-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY --from=builder /sources/dist .
COPY --from=builder /sources/manifest.json .

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]