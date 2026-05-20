FROM php:8.3-cli-alpine

RUN apk add --no-cache librdkafka-dev $PHPIZE_DEPS \
    && pecl install rdkafka \
    && docker-php-ext-enable rdkafka \
    && apk del $PHPIZE_DEPS

WORKDIR /app

COPY consume.php /app/consume.php

CMD ["php", "/app/consume.php"]
