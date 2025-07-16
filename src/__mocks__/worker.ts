self.onmessage = async (event) => {
  const { type } = event.data;

  if (type === 'process') {
    // simulate a job processing
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    postMessage({ type: 'ready', message: 'Worker is ready' });
  }
};
