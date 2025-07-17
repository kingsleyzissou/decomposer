import path from 'node:path';

export const schema = await Bun.file(path.join(__dirname, 'api.json')).json();
