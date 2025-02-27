export const centerRect = (
  centroid: [number, number],
  width: number,
  height: number
): [number, number] => {
  const x = centroid[0] - width / 2;
  const y = centroid[1] - height / 2;

  return [x, y];
};
