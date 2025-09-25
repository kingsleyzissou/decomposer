import { BlueprintService } from './blueprints/service';
import { ComposeService } from './composes/service';
import { ContentService } from './content/service';
import { DistributionService } from './distributions/service';

export { blueprints } from './blueprints';
export { composes } from './composes';
export { distributions } from './distributions';
export { meta } from './meta';
export { content } from './content';

export const services = {
  Blueprint: BlueprintService,
  Compose: ComposeService,
  Distribution: DistributionService,
  Content: ContentService,
};

export type * from './blueprints/types';
export type * from './composes/types';
export type * from './distributions/types';
export type * from './content/types';
