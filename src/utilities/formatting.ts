export const prettyPrint = (o: object) => {
  return Object.entries(o)
    .map(([key, value]) => {
      return `  ${key}: ${value}\n`;
    })
    .join('');
};

export const jsonFormat = (o: object) => {
  return JSON.stringify(o, null, 2);
};
