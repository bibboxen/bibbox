#!/bin/bash

# Install main modules
npm install

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    cd $folder
    npm-check-updates -u
    rm -rf node_modules
    npm install --production
    cd ../..
  fi
done
