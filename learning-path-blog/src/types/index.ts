export interface LearningGoal {
  goal: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: number;
  currentSkills: string; // 学习背景和补充信息
}

export interface Resource {
  name: string;
  url: string;
}

export interface WeeklyPlan {
  week: number;
  title: string;
  skills: string[];
  deliverable: string;
  resources: Resource[];
}

export interface LearningPlan {
  plan: WeeklyPlan[];
}
