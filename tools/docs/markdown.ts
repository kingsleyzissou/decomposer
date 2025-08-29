import { parse } from 'comment-parser';
import path from 'path';

import { composes } from '@app/api/composes';
import { meta } from '@app/api/meta';

import { commonFields, filterUnique, mapTemplates, templates } from './utils';

const components = {
  meta: {
    title: 'Meta Endpoints',
    routes: meta.routes,
  },
  composes: {
    title: 'Compose Endpoints',
    routes: composes.routes,
  },
};

const getComponentDetails = async (key: keyof typeof components) => {
  const file = Bun.file(path.join('src', 'api', key, 'index.ts'));
  const tsDocs = parse(await file.text()).map(({ description, tags }) => {
    return { description, tags };
  });
  const component = components[key];
  const routes = component.routes
    .filter(filterUnique())
    .map(mapTemplates(tsDocs, key));
  return {
    title: component.title,
    routes: await Promise.all(routes),
  };
};

const metaDetails = await getComponentDetails('meta');
const composesDetails = await getComponentDetails('composes');

const data = {
  ...commonFields,
  endpoint: [metaDetails, composesDetails],
};

console.log('📄 Generating API Docs');
const markdown = templates.markdown(data).trim() + '\n';

console.log('✅ All docs generated');
await Bun.file(path.join('src', 'api', 'README.md')).write(markdown);
