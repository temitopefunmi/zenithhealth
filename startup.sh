#!/bin/bash
echo "Running custom startup"
#ls -al ./node_modules/.bin/
exec node .next/standalone/server.js

