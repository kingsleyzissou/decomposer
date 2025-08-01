import path from 'node:path';

export { customizations, name } from './customizations';
export { composeRequest } from './compose-request';

export const blueprint = await Bun.file(
  path.join(__dirname, 'blueprint.json'),
).json();

export const blueprintRequest = await Bun.file(
  path.join(__dirname, 'blueprint-request.json'),
).json();

export { createTestStore } from './store';

export { imageTypes } from './imagetype-list';
