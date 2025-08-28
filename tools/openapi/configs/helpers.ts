import openapi, {
  type OpenAPIFilterOptions,
  type OpenAPIOverlayOptions,
} from 'openapi-format';
import type { OpenAPIV3 } from 'openapi-types';

export const parse = async (input: string) => {
  return (await openapi.parseFile(input)) as OpenAPIV3.Document;
};

export const filterSpec = async (
  document: OpenAPIV3.Document,
  options: OpenAPIFilterOptions = {},
) => {
  const { data } = await openapi.openapiFilter(document, options);

  return data as OpenAPIV3.Document;
};

export const applyOverlay = async (
  document: OpenAPIV3.Document,
  options: OpenAPIOverlayOptions,
) => {
  const { data } = await openapi.openapiOverlay(document, options);

  return data as OpenAPIV3.Document;
};

export const changeCase = async (document: OpenAPIV3.Document) => {
  const { data } = await openapi.openapiChangeCase(document, {
    casingSet: {
      operationId: 'camelCase',
      properties: 'snake_case',
    },
  });

  return data as OpenAPIV3.Document;
};

export const generateDoc = async (document: OpenAPIV3.Document) => {
  const { data } = await openapi.openapiGenerate(document, {});

  return data as OpenAPIV3.Document;
};
