#!/usr/bin/env bash

# Install main modules
npm install --${1:-production}

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    echo
    echo '-----------------------'
    echo "==> ${folder}"
    echo '-----------------------'
    cd $folder; npm install --${1:-production}; cd ../..;
  fi
done
