export type HealthDeclarationAnswer = "yes" | "no" | null;

export type HealthDeclarationAnswers = {
  heartCondition: HealthDeclarationAnswer;
  chestPain: HealthDeclarationAnswer;
  dizziness: HealthDeclarationAnswer;
  boneJointIssue: HealthDeclarationAnswer;
  highBloodPressure: HealthDeclarationAnswer;
  pregnancy: HealthDeclarationAnswer;
  recentBirth: HealthDeclarationAnswer;
  recentSurgery: HealthDeclarationAnswer;
};

export const healthDeclarationQuestionIds = [
  "heartCondition",
  "chestPain",
  "dizziness",
  "boneJointIssue",
  "highBloodPressure",
  "pregnancy",
  "recentBirth",
  "recentSurgery",
] as const satisfies readonly (keyof HealthDeclarationAnswers)[];

export function emptyHealthDeclarationAnswers(): HealthDeclarationAnswers {
  return {
    heartCondition: null,
    chestPain: null,
    dizziness: null,
    boneJointIssue: null,
    highBloodPressure: null,
    pregnancy: null,
    recentBirth: null,
    recentSurgery: null,
  };
}

export function isHealthDeclarationComplete(answers: HealthDeclarationAnswers): boolean {
  return healthDeclarationQuestionIds.every((id) => answers[id] !== null);
}

export function hasHealthDeclarationYes(answers: HealthDeclarationAnswers): boolean {
  return healthDeclarationQuestionIds.some((id) => answers[id] === "yes");
}

export function normalizeHealthDeclarationAnswers(
  answers: HealthDeclarationAnswers,
): Record<keyof HealthDeclarationAnswers, "yes" | "no"> | null {
  if (!isHealthDeclarationComplete(answers)) return null;
  return answers as Record<keyof HealthDeclarationAnswers, "yes" | "no">;
}
