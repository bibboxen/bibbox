#!/usr/bin/env bash

# Install main modules
rm -rf node_modules
npm install --${1:-production}

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    cd $folder
    rm -rf node_modules
    npm install --${1:-production}
    cd ../..
  fi
done
