#!/bin/bash

function setup_schema {
    curl --silent -X POST "${DEPLOYMENT_URL}/admin/schema" --data-binary "@/app/schema.graphql"
    echo ""
}

until $(curl --output /dev/null --silent ${DEPLOYMENT_URL}/health || exit 1); do
    echo "${DEPLOYMENT_URL} is not active"
    sleep 5
done

LTIME=$(stat -c %Z /app/schema.graphql)

setup_schema

while sleep 1; do
    ATIME=$(stat -c %Z /app/schema.graphql)

    if [[ "$ATIME" != "$LTIME" ]]; then
        setup_schema
        LTIME=$ATIME
    fi
done
