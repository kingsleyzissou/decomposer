import path from 'node:path';

export { customizations, name } from './customizations';
export { composeRequest } from './compose-request';

export const blueprint = await Bun.file(
  path.join(__dirname, 'blueprint.json'),
).json();
