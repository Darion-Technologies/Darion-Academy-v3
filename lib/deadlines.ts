export function calculateModuleDeadlines(
  assignedAt: Date,
  deadlineDays: number | null | undefined,
  modules: { id: string; lessons: { estimatedMinutes: number }[] }[]
) {
  if (!deadlineDays) return [];

  // Calculate total estimated minutes across all lessons
  const totalMinutes = modules.reduce((total, module) => {
    return total + module.lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
  }, 0);

  let cumulativeMinutes = 0;
  const moduleDeadlines = modules.map((module) => {
    const moduleMinutes = module.lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
    cumulativeMinutes += moduleMinutes;
    
    // Fraction of the total time for this module (including previous modules)
    const fraction = totalMinutes === 0 ? 0 : cumulativeMinutes / totalMinutes;
    
    // Calculate the exact deadline date
    const deadlineMs = assignedAt.getTime() + fraction * deadlineDays * 24 * 60 * 60 * 1000;
    
    return {
      moduleId: module.id,
      deadlineAt: new Date(deadlineMs),
    };
  });

  return moduleDeadlines;
}

export function isDeadlineApproaching(deadlineAt: Date, daysThreshold: number = 1) {
  const now = new Date();
  const timeDifference = deadlineAt.getTime() - now.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  
  // Return true if the deadline is within the threshold days and hasn't passed yet
  return daysDifference > 0 && daysDifference <= daysThreshold;
}
