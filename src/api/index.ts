import { ComposeService } from './composes/service';
import { DistributionService } from './distributions/service';

export { composes } from './composes';
export { distributions } from './distributions';
export { meta } from './meta';

export const services = {
  Compose: ComposeService,
  Distribution: DistributionService,
};

export * from './composes/types';
export * from './distributions/types';
