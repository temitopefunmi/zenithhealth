#!/bin/bash
echo "Running custom startup"
ls -al ./node_modules/.bin/
exec ./node_modules/.bin/next start
