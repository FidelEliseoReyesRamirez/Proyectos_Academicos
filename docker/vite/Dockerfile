FROM node:20-alpine

RUN apk add --no-cache \
    php84 \
    php84-phar \
    php84-mbstring \
    php84-tokenizer \
    php84-xml \
    php84-xmlwriter \
    php84-dom \
    php84-openssl \
    php84-pdo \
    php84-session \
    php84-fileinfo \
    php84-ctype \
    php84-json \
    curl \
    bash

RUN ln -sf /usr/bin/php84 /usr/bin/php

WORKDIR /app

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
