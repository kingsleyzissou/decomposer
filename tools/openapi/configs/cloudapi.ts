import { changeCase, filterSpec, generateDoc, parse } from './helpers';

// prettier-ignore
const input = 'https://raw.githubusercontent.com/osbuild/osbuild-composer/main/internal/cloudapi/v2/openapi.v2.yml';
const output = './generated/cloudapi/v2/api.json';
const component = 'cloudapi';

const generateFilteredSpec = async (input: string) => {
  const spec = await parse(input);
  const filtered = await filterSpec(spec);
  const cased = await changeCase(filtered);
  return generateDoc(cased);
};

export { generateFilteredSpec as generator, input, output, component };
