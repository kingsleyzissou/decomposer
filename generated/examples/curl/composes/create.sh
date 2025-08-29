SOCKET="${SOCKET_PATH:-'/run/decomposer-httpd.sock'}"

curl --silent --unix-socket $SOCKET \
  --request POST "http://localhost/api/image-builder-composer/v2/compose" \
  --header 'Content-Type: application/json' \
  --data '{
  "distribution": "centos-9",
  "client_id": "api",
  "image_requests": [
    {
      "image_type": "guest-image",
      "architecture": "x86_64",
      "upload_request": {
        "type": "aws.s3",
        "options": {}
      }
    }
  ]
}'
