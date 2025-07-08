import openapi from 'openapi-format';
import { OpenAPIV3 } from 'openapi-types';
import { format, resolveConfig } from 'prettier';

// prettier-ignore
const input = 'https://raw.githubusercontent.com/osbuild/image-builder-crc/refs/heads/main/internal/v1/api.yaml';
const output = './generated/ibcrc/v1/api.json';

const parse = async (input: string) => {
  return (await openapi.parseFile(input)) as OpenAPIV3.Document;
};

const filterSpec = async (document: OpenAPIV3.Document) => {
  const { data } = await openapi.openapiFilter(document, {
    filterSet: {
      operationIds: ['getVersion'],
      inverseOperationIds: ['getReadiness', 'getOpenapiJson'],
      unusedComponents: [
        'schemas',
        'parameters',
        'examples',
        'headers',
        'requestBodies',
        'responses',
      ],
    },
  });

  return data as OpenAPIV3.Document;
};

const changeCase = async (document: OpenAPIV3.Document) => {
  const { data } = await openapi.openapiChangeCase(document, {
    casingSet: {
      operationId: 'camelCase',
      properties: 'snake_case',
    },
  });

  return data as OpenAPIV3.Document;
};

const generateDoc = async (document: OpenAPIV3.Document) => {
  const { data } = await openapi.openapiGenerate(document, {});

  return data as OpenAPIV3.Document;
};

const generateFilteredSpec = async (input: string) => {
  const spec = await parse(input);
  const filtered = await filterSpec(spec);
  const cased = await changeCase(filtered);
  return generateDoc(cased);
};

const schema = await generateFilteredSpec(input);
const prettierrc = await resolveConfig('./.prettierrc.js');

console.log('📄 Generating filtered openapi spec file');
await Bun.write(
  output,
  await format(JSON.stringify(schema, null, 2), {
    ...prettierrc,
    filepath: output,
  }),
);
