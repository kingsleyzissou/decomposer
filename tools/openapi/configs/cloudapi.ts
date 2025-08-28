import {
  applyOverlay,
  changeCase,
  filterSpec,
  generateDoc,
  parse,
} from './helpers';

// prettier-ignore
const input = 'https://raw.githubusercontent.com/osbuild/osbuild-composer/main/internal/cloudapi/v2/openapi.v2.yml';
const output = './generated/cloudapi/v2/api.json';
const component = 'cloudapi';

const filterOptions = {
  filterSet: {
    operationIds: ['getVersion'],
    inverseOperationIds: ['postCompose'],
    unusedComponents: [
      'schemas',
      'parameters',
      'examples',
      'headers',
      'requestBodies',
      'responses',
    ],
  },
};

const overlayOptions = {
  overlaySet: {
    actions: [
      {
        // prettier-ignore
        target: '$.components.schemas.Directory.properties.ensure_parents.default',
        // The default value breaks the optionality of this option, so just leave
        remove: true,
      },
    ],
  },
};

const generateFilteredSpec = async (input: string) => {
  const spec = await parse(input);
  const filtered = await filterSpec(spec, filterOptions);
  const overlay = await applyOverlay(filtered, overlayOptions);
  const cased = await changeCase(overlay);
  return generateDoc(cased);
};

export { generateFilteredSpec as generator, input, output, component };
