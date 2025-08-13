import { Maybe } from 'true-myth/maybe';

export const asPaginatedResponse = <T extends { id: string }>(
  items: T[],
  limit: Maybe<string>,
  offset: Maybe<string>,
) => {
  const length = items.length;
  const first = Maybe.of<T>(items[0])
    .map((item: T) => item.id)
    .unwrapOr('');
  const last = Maybe.of<T>(items[length - 1])
    .map((item: T) => item.id)
    .unwrapOr('');

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
