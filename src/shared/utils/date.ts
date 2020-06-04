export const getUnixTimestamp = (x?: number): number =>
  x ? Math.round(x / 1000) : Math.round(Date.now() / 1000);
