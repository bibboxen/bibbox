#!/bin/bash

# Install main modules
npm install --${0:=production}

# Install plugin dependencies.
for folder in plugins/*; do
  if [ -d $folder ]; then
    cd $folder; npm install --${0:=production}; cd ../..;
  fi
done
