export const API_ENDPOINT = '/api/image-builder-composer/v2';
export const SOCKET_PATH = '/run/decomposer-httpd.sock';

// Default store
export const STORE_PATH = '/var/lib/osbuild-composer/artifacts';

export enum Status {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  BUILDING = 'building',
}
