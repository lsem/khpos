#!/usr/bin/env bash

WATCH=

if [[ $* == *--watch* ]]; then
	WATCH="--watch --watch-extensions ts"
fi

# Note, without quotes it does not work

 ./node_modules/ts-mocha/bin/ts-mocha --recursive  -R list -p tsconfig.json --require source-map-support/register  --paths  "src/**/*_test.ts" ${WATCH}
