#!/usr/bin/env bash

#./node_modules/mocha/bin/mocha build/**/*_test.js  --require source-map-support/register -R list
./node_modules/ts-mocha/bin/ts-mocha  -R list -p tsconfig.json --paths  src/**/*_test.ts
