import { BlueprintService } from './blueprints/service';
import { ComposeService } from './composes/service';
import { DistributionService } from './distributions/service';

export { blueprints } from './blueprints';
export { composes } from './composes';
export { distributions } from './distributions';
export { meta } from './meta';

export const services = {
  Blueprint: BlueprintService,
  Compose: ComposeService,
  Distribution: DistributionService,
};

export type * from './blueprints/types';
export type * from './composes/types';
export type * from './distributions/types';
