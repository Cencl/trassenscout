upstream app {
  server localhost:3000;
}

server {
  listen 80 default_server;

  location / {
    proxy_pass http://app;
  }
  location /health {
    # don't log health checks
    access_log off;
    error_log /dev/stderr error;
    proxy_pass http://app;
  }
  location ~ ^/moses/(query|send)$ {
    resolver 8.8.8.8;
    proxy_pass https://api.moses-security.de/v1/$1;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header MOSES-API-KEY 2b904385897de6d42bc5eec4da0f7177;
  }
  location /assets/ {
      resolver 8.8.8.8;
      proxy_http_version     1.1;
      proxy_redirect off;
      proxy_set_header       Connection "";
      proxy_set_header       Authorization '';
      proxy_set_header       Host ${ASSETS_BUCKET_HOST};
      proxy_set_header       X-Real-IP $remote_addr;
      proxy_set_header       X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_hide_header      x-amz-id-2;
      proxy_hide_header      x-amz-request-id;
      proxy_hide_header      x-amz-meta-server-side-encryption;
      proxy_hide_header      x-amz-server-side-encryption;
      proxy_hide_header      Set-Cookie;
      proxy_ignore_headers   Set-Cookie;
      proxy_intercept_errors on;
      error_page             403 =404 /404.html;
      add_header             Cache-Control max-age=31536000;
      proxy_pass             http://${ASSETS_BUCKET_HOST}${ASSETS_BUCKET_PATH};
  }
  location /moses/query {
    proxy_pass https://api.moses-security.de/v1/query;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  location = /404.html {
      internal;
  }
}