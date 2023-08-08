#!/usr/bin/env bash

# Install main modules
rm -rf node_modules
npm install --${1:-omit=dev}

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    echo
    echo '-----------------------'
    echo "==> ${folder}"
    echo '-----------------------'
    cd $folder
    rm -rf node_modules
    npm install --${1:-omit=dev}
    cd ../..
  fi
done
