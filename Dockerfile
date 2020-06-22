FROM node:10
LABEL maintainer="ITK Dev <itkdev@mkb.aarhus.dk>"

# Ensure packages are avaiable.
RUN apt-get update

RUN DEBIAN_FRONTEND=noninteractive \
    apt-get install -y \
    libudev-dev \
&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app