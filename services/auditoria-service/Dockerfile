FROM php:8.3-cli-alpine

RUN apk add --no-cache \
        librdkafka-dev \
        libpq-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
    && pecl install rdkafka \
    && docker-php-ext-enable rdkafka \
    && apk del $PHPIZE_DEPS

WORKDIR /app

COPY . /app

CMD ["php", "/app/consume.php"]
