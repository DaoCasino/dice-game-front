FROM node:alpine as builder

ARG mock

WORKDIR /sources
COPY package.json ./
RUN yarn install

COPY ./ ./
ENV GAME_IS_MOCK=$mock
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN echo "=> build mock: ${mock}" && yarn build

FROM nginx:1.15.8-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY --from=builder /sources/dist .

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]