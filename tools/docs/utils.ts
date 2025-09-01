import type { Spec } from 'comment-parser';
import hbs from 'handlebars';
import type { RouterRoute } from 'hono/types';
import path from 'path';

import { args } from '@app/args';
import { API_ENDPOINT, SOCKET_PATH } from '@app/constants';

const CURL_DIR = path.join('generated', 'examples', 'curl');
const HTTP_DIR = path.join('generated', 'examples', 'http');

export const loadTemplate = async (input: string) => {
  const source = await Bun.file(
    path.join(__dirname, 'templates', input),
  ).text();

  return hbs.compile(source);
};

export const commonFields = {
  api: API_ENDPOINT,
  socket: args.socket,
};

export const createTemplate = async (
  type: keyof typeof templates,
  filename: string,
  metadata: Metadata,
  component: string,
) => {
  const input = {
    ...commonFields,
    ...metadata,
    default_socket: SOCKET_PATH,
  };
  const ext = type === 'bash' ? '.sh' : '.http';
  const dir = type === 'bash' ? CURL_DIR : HTTP_DIR;
  input.path = input.path.replace(':id', () =>
    type === 'bash' ? '${1}' : '{{id}}',
  );
  const template = templates[type](input);
  await Bun.file(path.join(dir, component, filename + ext)).write(template);
  return template.trim();
};

export const templates = {
  markdown: await loadTemplate('markdown.hbs'),
  bash: await loadTemplate('shell.hbs'),
  http: await loadTemplate('http.hbs'),
};

const getFilename = (route: RouterRoute, component: string, tags?: Spec[]) => {
  if (component === 'meta') {
    return route.path.split('/')[1]!.split('.')[0];
  }

  const tag = tags && tags.find((t) => t.tag === 'rest');
  if (tag) {
    return tag.name;
  }

  if (route.method === 'GET' && route.path === '/composes/:id') {
    return 'show';
  }

  throw Error(`Unknown route [${component}]: ${route.path}`);
};

export const filterUnique = () => {
  const seen = new Set<string>();
  return (route: RouterRoute) => {
    const key = `${route.method}:${route.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
};

type tsDoc = {
  description: string;
  tags: Spec[];
};

type Metadata = RouterRoute & {
  description: string;
  bash?: string;
  http?: string;
  headers?: string;
  data?: string;
};

export const mapTemplates = (tsDocs: tsDoc[], component: string) => {
  return async (route: RouterRoute, index: number) => {
    const output: Metadata = {
      ...route,
      description: tsDocs[index]!.description,
    };

    const doc = tsDocs[index];
    if (route.method === 'POST') {
      const input = doc?.tags.find((t) => t.tag === 'example');
      const str = input!.name;
      const content = await Bun.file(str).json();
      output.headers = 'Content-Type: application/json';
      output.data = JSON.stringify(content, null, 2);
    }

    const filename = getFilename(route, component, doc?.tags);
    output.bash = await createTemplate('bash', filename!, output, component);
    output.http = await createTemplate('http', filename!, output, component);

    return output;
  };
};
