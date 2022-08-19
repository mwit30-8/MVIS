#!/bin/bash

MVIS_BACKEND_ADDRESS = $1
SCHEMA_PATH = $2

function setup_schema {
    curl --silent -X POST "${MVIS_BACKEND_ADDRESS}/admin/schema" --data-binary "@${SCHEMA_PATH}"
    echo ""
}

until $(curl --output /dev/null --silent ${MVIS_BACKEND_ADDRESS}/health || exit 1); do
    echo "${MVIS_BACKEND_ADDRESS} is not active"
    sleep 5
done

LTIME=$(stat -c %Z ${SCHEMA_PATH})

setup_schema

while sleep 1; do
    ATIME=$(stat -c %Z ${SCHEMA_PATH})

    if [[ "$ATIME" != "$LTIME" ]]; then
        setup_schema
        LTIME=$ATIME
    fi
done
