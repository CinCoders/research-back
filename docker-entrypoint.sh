#!/bin/bash
echo `date +%FT%T%Z` "- docker-entrypoint.sh started !"
set -e

cd /home/node/app
cp /run/secrets/research_back_env /home/node/app/.env

# Copying certificates to the project directory, to use TLS
mkdir /home/node/app/certs
cp /run/secrets/cert /home/node/app/certs/certificate.crt
cp /run/secrets/cert_key /home/node/app/certs/certificate.key
cp /run/secrets/cert_intermediate /home/node/app/certs/intermediate.pem

echo `date +%FT%T%Z` "- docker-entrypoint.sh finished..."

exec "$@"