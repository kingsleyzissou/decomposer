const processRequest = async (request: string) => {
  await new Promise((resolve) => {
    console.log('Processing request: ', request);
    setTimeout(resolve, 200);
  });
};

self.onmessage = async (event) => {
  const { type } = event.data;

  if (type === 'process') {
    await processRequest(event.data.request);
    postMessage({ type: 'ready', message: 'Worker is ready' });
  }
};
