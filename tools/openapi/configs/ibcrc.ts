import {
  applyOverlay,
  changeCase,
  filterSpec,
  generateDoc,
  parse,
} from './helpers';

// prettier-ignore
const input = 'https://raw.githubusercontent.com/osbuild/image-builder-crc/refs/heads/main/internal/v1/api.yaml';
const output = './generated/ibcrc/v1/api.json';
const component = 'image-builder-crc';

const filterOptions = {
  filterSet: {
    operationIds: ['getVersion'],
    inverseOperationIds: [
      'getReadiness',
      'getOpenapiJson',
      'getComposes',
      'composeImage',
      'deleteCompose',
      'getComposeStatus',
      'createBlueprint',
      'getBlueprints',
      'getDistributions',
      'getArchitectures',
    ],
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
        target: '$.components.schemas.UploadTypes',
        update: {
          enum: ['local'],
        },
      },
      {
        // prettier-ignore
        target: '$.components.schemas.AWSUploadRequestOptions.properties.share_with_accounts',
        remove: true,
      },
      {
        // prettier-ignore
        target: '$.components.schemas.AWSUploadRequestOptions.properties.share_with_sources',
        remove: true,
      },
      {
        target: '$.components.schemas.AWSUploadRequestOptions.properties',
        update: {
          region: {
            type: 'string',
            default: 'us-east-1',
          },
          bucket: {
            type: 'string',
          },
        },
      },
      {
        target: '$.components.schemas.Filesystem.properties.min_size',
        update: {
          // only the go type was set, we need to fix this
          type: 'integer',
        },
      },
      {
        // prettier-ignore
        target: '$.components.schemas.Directory.properties.ensure_parents.default',
        // The default value breaks the optionality of this option, so just leave
        remove: true,
      },
      {
        // prettier-ignore
        target: '$.components.schemas.File.properties.ensure_parents.default',
        // The default value breaks the optionality of this option, so just leave
        remove: true,
      },
      {
        // prettier-ignore
        target: '$.components.schemas.File.properties.data_encoding.default',
        // The default value breaks the optionality of this option, so just leave
        remove: true,
      },
      {
        // prettier-ignore
        target: '$.components.schemas.ArchitectureItem.required',
        remove: true,
      },
      {
        // prettier-ignore
        target: '$.components.schemas.ArchitectureItem',
        update: {
          required: ['arch', 'image_types'],
        },
      },
      {
        // prettier-ignore
        target: '$.components.schemas.ArchitectureItem.properties.repositories',
        remove: true,
      },
    ],
  },
};

const generateFilteredSpec = async (input: string) => {
  const spec = await parse(input);
  const filtered = await filterSpec(spec, filterOptions);
  const overlayed = await applyOverlay(filtered, overlayOptions);
  const cased = await changeCase(overlayed);
  return generateDoc(cased);
};

export { generateFilteredSpec as generator, input, output, component };
