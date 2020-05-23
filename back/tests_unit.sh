#!/usr/bin/env bash

./node_modules/mocha/bin/mocha build/**/*_test.js  --require source-map-support/register -R list
