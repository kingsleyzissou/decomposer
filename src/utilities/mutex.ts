const locks = new Map();

export async function withMutex(key: string, fn: () => Promise<void>) {
  while (locks.get(key)) {
    await locks.get(key); // wait for previous lock
  }

  let unlock;
  const promise = new Promise((res) => (unlock = res));
  locks.set(key, promise);

  try {
    return await fn();
  } finally {
    locks.delete(key);
  }
}
