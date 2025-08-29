import type { Maybe } from 'true-myth/maybe';

export const paginate = <T extends { id: string }>(
  items: T[],
  limit: Maybe<string>,
  offset: Maybe<string>,
) => {
  const length = items.length;
  const first = length > 0 ? items[0]!.id : '';
  const last = length > 0 ? items[length - 1]!.id : '';

  const l = limit.map((v) => parseInt(v)).unwrapOr(100);
  const o = offset.map((v) => parseInt(v)).unwrapOr(0);

  return {
    meta: { count: length },
    links: {
      first,
      last,
    },
    data: items.slice(o, o + l),
  };
};
