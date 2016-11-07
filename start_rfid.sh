#!/bin/bash

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/feig

cd plugins/rfid/device
java -jar rfid.jar
