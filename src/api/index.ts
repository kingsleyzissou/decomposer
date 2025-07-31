import { ComposeService } from './composes/service';

export { composes } from './composes';
export { meta } from './meta';

export const services = {
  Compose: ComposeService,
};

export * from './composes/types';
