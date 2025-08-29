# API Endpoints

The server exposes the following endpoints on `/api/image-builder-composer/v2`:

## Meta Endpoints

-- `GET /api/image-builder-composer/v2/ready - Health check endpoint`
-- `GET /api/image-builder-composer/v2/openapi.json - OpenAPI specification`

### Health check endpoint

Example curl request:

```bash
SOCKET="${SOCKET_PATH:-'/run/decomposer-httpd.sock'}"

curl --silent --unix-socket $SOCKET \
  --request GET "http://localhost/api/image-builder-composer/v2/ready"
```

Example HTTP request:

```http
# use .env SOCKET_PATH or fallback to default
@socket={{SOCKET_PATH ?? '/run/decomposer-httpd.sock' }}
@host=http://unix{{ socket }}:

GET /api/image-builder-composer/v2/ready HTTP/1.1
```

### OpenAPI specification

Example curl request:

```bash
SOCKET="${SOCKET_PATH:-'/run/decomposer-httpd.sock'}"

curl --silent --unix-socket $SOCKET \
  --request GET "http://localhost/api/image-builder-composer/v2/openapi.json"
```

Example HTTP request:

```http
# use .env SOCKET_PATH or fallback to default
@socket={{SOCKET_PATH ?? '/run/decomposer-httpd.sock' }}
@host=http://unix{{ socket }}:

GET /api/image-builder-composer/v2/openapi.json HTTP/1.1
```

## Compose Endpoints

-- `GET /api/image-builder-composer/v2/composes - List composes`

### List composes

Example curl request:

```bash
SOCKET="${SOCKET_PATH:-'/run/decomposer-httpd.sock'}"

curl --silent --unix-socket $SOCKET \
  --request GET "http://localhost/api/image-builder-composer/v2/composes"
```

Example HTTP request:

```http
# use .env SOCKET_PATH or fallback to default
@socket={{SOCKET_PATH ?? '/run/decomposer-httpd.sock' }}
@host=http://unix{{ socket }}:

GET /api/image-builder-composer/v2/composes HTTP/1.1
```
