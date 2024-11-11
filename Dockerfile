FROM node:18
LABEL maintainer="ITK Dev <itkdev@mkb.aarhus.dk>"

ENV TZ="Europe/Copenhagen"

# Ensure packages are avaiable.
RUN apt-get update \
 && apt-get upgrade -y

RUN DEBIAN_FRONTEND=noninteractive \
    apt-get install -yq \
    libudev-dev \
    tzdata \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


RUN ln -fs /usr/share/zoneinfo/Europe/Copenhagen /etc/localtime  \
 && dpkg-reconfigure -f noninteractive tzdata

# Install upgrader helper (https://chektek.com/code/update-all-node-packages-to-latest/)
RUN npm install -g npm-check-updates


WORKDIR /app
