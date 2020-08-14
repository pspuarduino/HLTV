export const getRandomInteger = (min: number, max: number) => {
  const rand: number = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};
