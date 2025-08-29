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
  route: RouterRoute,
  component: string,
) => {
  const template = templates[type]({
    ...commonFields,
    ...route,
    default_socket: SOCKET_PATH,
  });
  const ext = type === 'bash' ? '.sh' : '.http';
  const dir = type === 'bash' ? CURL_DIR : HTTP_DIR;
  await Bun.file(path.join(dir, component, filename + ext)).write(template);
  return template.trim();
};

export const templates = {
  markdown: await loadTemplate('markdown.hbs'),
  bash: await loadTemplate('shell.hbs'),
  http: await loadTemplate('http.hbs'),
};

const getFilename = (route: RouterRoute, component: string) => {
  if (component === 'meta') {
    return route.path.split('/')[1]!.split('.')[0];
  }

  if (
    component === 'composes' &&
    route.method === 'GET' &&
    route.path === '/composes'
  ) {
    return 'index';
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

export const mapTemplates = (tsDocs: string[], component: string) => {
  return async (route: RouterRoute, index: number) => {
    const filename = getFilename(route, component);
    const bash = await createTemplate('bash', filename!, route, component);
    const http = await createTemplate('http', filename!, route, component);
    return {
      ...route,
      description: tsDocs[index],
      bash,
      http,
    };
  };
};
