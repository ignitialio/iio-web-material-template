#!/bin/sh

export IIOS_APP_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo "app version: ${IIOS_APP_VERSION}"

export IIOS_AUTH_VERSION=1.0.2
export IIOS_DLAKE_VERSION=3.0.3

export IIOS_REST_LOGLEVEL=error
export IIOS_NAMESPACE=ignitialio
export IIOS_SERVER_PATH="public"
export IIOS_MONGODB_DBNAME=ignitialio
export IIOS_DROP_FILES_PATH="public/dropped"

docker-compose -f ${PWD}/tools/docker/docker-compose-dev.yml stop
docker-compose -f ${PWD}/tools/docker/docker-compose-dev.yml rm -f

if command -v iio 2>/dev/null; then
  iio infra dev --rm
  if [ $? -ne 0 ]
  then
    echo "iio version must be >=2.2.1: 'npm i -g @ignitial/iio-cli'"
    exit 1
  fi
else
  echo "iio not installed: 'npm i -g @ignitial/iio-cli'"
  exit 1
fi
