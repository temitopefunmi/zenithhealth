#!/bin/bash
echo "Running custom startup"
ls -al ./node_modules/.bin/
exec node node_modules/next/dist/bin/next start

