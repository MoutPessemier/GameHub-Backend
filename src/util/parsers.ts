export const stringToDate = (date: string): Date => {
  if (!date) return new Date();
  const stringArray = date.split('-');
  const numberArray = stringArray.map(s => Number.parseInt(s));
  return new Date(numberArray[0], numberArray[1], numberArray[2]);
};
