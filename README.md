# core

## Installing

`$ yarn`

## Run web

`$ dotenv yarn dev`

## Run worker

`$ dotenv yarn dev-worker`

---

## Environment variables

```
REDISCLOUD_URL=
BONSAI_URL=
UNTAPPED_CLIENT_ID=
UNTAPPED_CLIENT_SECRET=
```

---

## Create and install self-signed certificate

```
sudo cp /System/Library/OpenSSL/openssl.cnf /etc/ssh/openssl.cnf
```

```
cp /System/Library/OpenSSL/openssl.cnf /tmp
echo '[ subject_alt_name ]' >> /tmp/openssl.cnf
echo -n 'subjectAltName = ' >> /tmp/openssl.cnf
echo -n 'DNS:core.newbeers.se, DNS:web.newbeers.se' >> /tmp/openssl.cnf
openssl req -x509 -days 1000 -nodes -newkey rsa:2048 \
  -config /tmp/openssl.cnf \
  -extensions subject_alt_name \
  -keyout newbeers.key \
  -out newbeers.crt \
  -subj '/C=SE/ST=XXXX/L=XXXX/O=newbeers/OU=XXXX/CN=newbeers.se/emailAddress=daniel.halldin@newbeers.se'
```

### Open the new cert:

```
open /Applications/Utilities/Keychain\ Access.app newbeers.key
```

### Add hosts to /etc/hosts:

```
127.0.0.1   www.newbeers.se core.newbeers.se
```

### Copy the certificate files (newbeers.crt and newbeers.key) to /usr/local/etc/nginx/:

```
$ cp dev.cmore.* /usr/local/etc/nginx/
```

### Add this section to the http section of /usr/local/etc/nginx/nginx.conf:

```
$ code /usr/local/etc/nginx/nginx.conf
```

```
################################################################################
    # New beers
    ################################################################################
    server {
        listen 80;
        listen 443 ssl;
        server_name web.newbeers.se;
        ssl_certificate      newbeers.crt;
        ssl_certificate_key  newbeers.key;
        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;
        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;
    	location / {
            proxy_set_header        Host $host;
            proxy_set_header        X-Real-IP $remote_addr;
            proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header        X-Forwarded-Proto $scheme;
            proxy_pass http://localhost:6666;
            proxy_redirect          default;
        }
    }

    ################################################################################
    # Core
    ################################################################################
    server {
        listen 80;
        listen 443 ssl;
        server_name core.newbeers.se;
        ssl_certificate      newbeers.crt;
        ssl_certificate_key  newbeers.key;
        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;
        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;
    	location / {
            proxy_set_header        Host $host;
            proxy_set_header        X-Real-IP $remote_addr;
            proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header        X-Forwarded-Proto $scheme;
            proxy_pass http://localhost:6667;
            proxy_redirect          default;
        }
    }
```
