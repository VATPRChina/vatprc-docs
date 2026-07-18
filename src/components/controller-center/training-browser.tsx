export const sortTrainings = <T extends { start_at: string }>(trainings: T[], now: Date): T[] => {
  const future = trainings
    .filter((t) => new Date(t.start_at) >= now)
    .sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at));
  const past = trainings
    .filter((t) => new Date(t.start_at) < now)
    .sort((a, b) => +new Date(b.start_at) - +new Date(a.start_at));
  return [...future, ...past];
};
