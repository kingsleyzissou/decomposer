# decomposer

A lightweight TypeScript HTTP server that acts as a shim for image-builder-cli. Built with Bun and Hono, it provides a Unix socket-based API with automatic OpenAPI type generation from the image-builder-crc repo.

## Architecture

decomposer serves as a lightweight proxy/shim that:

1. **Fetches OpenAPI specs** from the [image-builder-crc](https://github.com/osbuild/image-builder-crc) repository
2. **Filters and processes** the OpenAPI specification to include only relevant endpoints
3. **Generates TypeScript types** and Zod validation schemas
4. **Serves HTTP API** endpoints via Unix socket at `/run/decomposer-httpd.sock`

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Node.js >= 18 (for TypeScript compilation)

### Installing Bun

```bash
npm install -g bun
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd decomposer
```

2. Install dependencies:
```bash
bun install
```

3. Generate OpenAPI types:
```bash
bun run generate
```

## Usage

### Development

Start the development server with hot reload:
```bash
bun run dev
```

### Custom Configuration

You can specify a custom store path:
```bash
STORE_PATH=/custom/path/to/store bun run start
```

Or pass it as a command-line argument:
```bash
bun run start --store /custom/path/to/store
```
Or in a .env file:
```.env
STORE_PATH=/custom/path/to/store
```

## API Endpoints

The server exposes the following endpoints on `/api/image-builder-composer/v2`:

### Meta Endpoints

- `GET /api/image-builder-composer/v2/ready` - Health check endpoint
- `GET /api/image-builder-composer/v2/openapi.json` - OpenAPI specification

#### Examples

```bash
curl --unix-socket /run/decomposer-httpd.sock \
  -X GET 'http://localhost/api/image-builder-composer/v2/ready'
```

### Compose Endpoints

- `GET /api/image-builder-composer/v2/composes` - Get collection of compose requests
- `POST /api/image-builder-composer/v2/compose` - Create a new compose request
- `DELETE /api/image-builder-composer/v2/compose/:id` - Delete a specific compose

#### Examples

```bash
curl --unix-socket /run/decomposer-httpd.sock \
  -X GET 'http://localhost/api/image-builder-composer/v2/composes'
```

```bash
curl --unix-socket /run/decomposer-httpd.sock \
  -H "Content-Type: application/json" \
  -X POST 'http://localhost/api/image-builder-composer/v2/compose' \
  -d '{
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
```


```bash
curl --unix-socket /run/decomposer-httpd.sock \
  -X DELETE 'http://localhost/api/image-builder-composer/v2/compose/YOUR-COMPOSE-ID'
```

### Socket Location

The server listens on a Unix socket at `/run/decomposer-httpd.sock` with permissions set to `775` for multi-user access.

## Development Workflow

### Code Generation

The project includes tools to automatically generate TypeScript types from OpenAPI specifications:

1. **Filter OpenAPI spec**:
   ```bash
   bun run api:filter
   ```
   This downloads the latest OpenAPI spec from image-builder-crc and filters it to include only relevant endpoints.

2. **Generate TypeScript types**:
   ```bash
   bun run api:generate
   ```
   This generates TypeScript interfaces and Zod schemas from the filtered OpenAPI spec.

3. **Run both steps**:
   ```bash
   bun run generate
   ```

### Code Quality

- **Linting**: `bun run lint`
- **Formatting**: `bun run format`
- **Format Check**: `bun run format:check`
- **Testing**: `bun run test`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the test suite: `bun run test`
5. Ensure code quality: `bun run lint && bun run format:check`
6. Submit a pull request

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Related Projects

- [image-builder-cli](https://github.com/osbuild/image-builder-cli) - The command line tool used to build the images
- [image-builder-crc](https://github.com/osbuild/image-builder-crc) - The upstream image builder service
