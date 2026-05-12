export type UserVector = {
  performance: number;
  portability: number;
  batteryEfficiency: number;
};

export const calculateMatchScore = (userVector: UserVector, productVector: UserVector) => {
  const performanceDelta = productVector.performance - userVector.performance;
  const portabilityDelta = productVector.portability - userVector.portability;
  const batteryDelta = productVector.batteryEfficiency - userVector.batteryEfficiency;

  return Math.sqrt(
    performanceDelta * performanceDelta +
      portabilityDelta * portabilityDelta +
      batteryDelta * batteryDelta
  );
};

const maxDistance = Math.sqrt(9 * 9 * 3);

export const getMatchPercentage = (distance: number) => {
  const rawScore = 100 - (distance / maxDistance) * 100;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
};
