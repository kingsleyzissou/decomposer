import { generateZodClientFromOpenAPI } from 'openapi-zod-client';
import { resolveConfig } from 'prettier';

const input = './generated/ibcrc/v1/api.json';
const output = './generated/ibcrc/v1/zod.ts';
const template = './tools/openapi/zod.schemas.hbs';
const exists = await Bun.file(input).exists();

if (!exists) {
  console.warn(
    '❗ OpenAPI schema has not been created, please run `bun api:filter` first',
  );
  process.exit();
}

console.log('🤖 Generating zod schema');
await generateZodClientFromOpenAPI({
  openApiDoc: await Bun.file(input).json(),
  prettierConfig: await resolveConfig('./.prettierrc.js'),
  distPath: output,
  templatePath: template,
});
