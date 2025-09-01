SOCKET="${SOCKET_PATH:-'/run/decomposer-httpd.sock'}"

curl --silent --unix-socket $SOCKET \
  --request GET "http://localhost/api/image-builder-composer/v2/composes/${1}"
