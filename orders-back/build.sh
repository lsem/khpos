#!/usr/bin/env bash

WATCH=

if [[ $* == *--watch* ]]; then
	WATCH=--watch
fi

./node_modules/.bin/tsc ${WATCH}
