import { parse } from 'comment-parser';
import path from 'path';

import { composes } from '@app/api/composes';
import { meta } from '@app/api/meta';

import { commonFields, filterUnique, mapTemplates, templates } from './utils';

const metaFile = Bun.file(path.join('src', 'api', 'meta', 'index.ts'));
const metaDocs = parse(await metaFile.text()).map((b) => b.description);
const metaRoutes = meta.routes
  .filter(filterUnique())
  .map(mapTemplates(metaDocs, 'meta'));

const composesFile = Bun.file(path.join('src', 'api', 'composes', 'index.ts'));
const composeDocs = parse(await composesFile.text()).map((b) => b.description);
const composeRoutes = composes.routes
  .filter(filterUnique())
  .map(mapTemplates(composeDocs, 'composes'));

const data = {
  ...commonFields,
  endpoint: [
    {
      title: 'Meta Endpoints',
      routes: await Promise.all(metaRoutes),
    },
    {
      title: 'Compose Endpoints',
      routes: await Promise.all(composeRoutes),
    },
  ],
};

console.log('📄 Generating API Docs');
const markdown = templates.markdown(data).trim() + '\n';

console.log('✅ All docs generated');
await Bun.file(path.join('src', 'api', 'README.md')).write(markdown);
