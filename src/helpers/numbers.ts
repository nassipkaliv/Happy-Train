export const randomNumber = () => Math.floor(100000000 + Math.random() * 900000000000000);

export const round = (num: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
};

export const repairPrecision = (num: number) => round(num, 10);

export const roundUp = (num: any, decimals: number) => {
  num = repairPrecision(num);
  const factor = 10 ** decimals;
  const magnified = repairPrecision(num * factor);
  return Math.ceil(magnified) / factor;
};

export const roundDown = (num: any, decimals: number) => {
  num = repairPrecision(num);
  const factor = 10 ** decimals;
  const magnified = repairPrecision(num * factor);
  return Math.floor(magnified) / factor;
};
