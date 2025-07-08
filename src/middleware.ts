import type * as hono from 'hono/types';

export const notFound: hono.NotFoundHandler = (ctx) => {
  return ctx.json(
    {
      message: `The specified path '${ctx.req.path}' does not exist!`,
      ok: false,
    },
    404,
  );
};
