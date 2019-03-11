/**
 * Normalize class name.
 */
export const normalizeClass = (
  classOne: string | string[],
  classTwo: string | string[]
): string => {
  classOne = classOne || [];
  classTwo = classTwo || [];

  if (!Array.isArray(classOne)) {
    classOne = classOne.replace(/\s+/g, ' ').split(' ');
  }
  if (!Array.isArray(classTwo)) {
    classTwo = classTwo.replace(/\s+/g, ' ').split(' ');
  }

  return classOne.concat(classTwo).join(' ');
};
