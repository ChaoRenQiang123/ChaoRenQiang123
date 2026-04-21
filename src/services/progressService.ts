export interface DailyProgress {
  date: string;
  points: number;
  actions: Set<string>; // Track unique actions to prevent double counting
}

const DAILY_GOAL = 30;

export const getDailyProgress = (): DailyProgress => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem('sakura_daily_progress');
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        return {
          ...parsed,
          actions: new Set(parsed.actions || [])
        };
      }
    } catch (e) {
      console.error("Failed to parse progress", e);
    }
  }
  
  return {
    date: today,
    points: 0,
    actions: new Set()
  };
};

export const saveProgress = (progress: DailyProgress) => {
  const dataToStore = {
    ...progress,
    actions: Array.from(progress.actions)
  };
  localStorage.setItem('sakura_daily_progress', JSON.stringify(dataToStore));
  
  // Dispatch a custom event to notify App.tsx
  window.dispatchEvent(new CustomEvent('sakura_progress_update', { detail: progress }));
};

export const addProgressPoint = (actionId: string) => {
  const progress = getDailyProgress();
  
  if (!progress.actions.has(actionId)) {
    progress.actions.add(actionId);
    progress.points = Math.min(progress.points + 1, DAILY_GOAL);
    saveProgress(progress);
  }
};

export const getProgressPercentage = (points: number): number => {
  return Math.round((points / DAILY_GOAL) * 100);
};
