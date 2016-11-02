#!/bin/bash

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/bibbox/feig-linux/drivers

cd plugins/rfid/device
java -jar rfid.jar
