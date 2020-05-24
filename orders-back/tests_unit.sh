#!/usr/bin/env bash

WATCH=

if [[ $* == *--watch* ]]; then
	WATCH="--watch --watch-extensions ts"
fi

#./node_modules/mocha/bin/mocha build/**/*_test.js  --require source-map-support/register -R list
./node_modules/ts-mocha/bin/ts-mocha  -R list -p tsconfig.json --require source-map-support/register  --paths  src/**/*_test.ts ${WATCH}
