import { z } from 'zod';

export const Readiness = z.object({ readiness: z.string() }).passthrough();
