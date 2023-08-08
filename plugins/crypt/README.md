# Crypt
See https://whyboobo.com/devops/tutorials/asymmetric-encryption-with-nodejs/ for more information this private/public
RSA crypto setup.

This is mainly used to protect user data in offline mode.

# Developer mode.

Generate a local key pair for debugging offline mode in local setup i folder and use it by setting CERTS_DEBUG 
environment variable.

```shell
openssl genrsa -out private.pem 4096
openssl rsa -pubout -in private.pem -out public.pem
```

Run in total debug mode, with certs generated in the certs folder in project root.
```shell
NODE_TLS_REJECT_UNAUTHORIZED=0 CERTS_DEBUG=/app/certs RFID_DEBUG=true DEBUG=bibbox:* node bootstrap.js
```
