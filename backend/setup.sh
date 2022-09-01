#!/bin/bash

function setup_schema {
    curl --silent -X POST "${DEPLOYMENT_URL}" --data-binary "@/app/schema.graphql"
    echo ""
}

LTIME=$(stat -c %Z /app/schema.graphql)

setup_schema

while sleep 1; do
    ATIME=$(stat -c %Z /app/schema.graphql)

    if [[ "$ATIME" != "$LTIME" ]]; then
        setup_schema
        LTIME=$ATIME
    fi
done
