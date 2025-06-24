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

// 对话式澄清相关类型
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ClarificationResponse {
  message: string;
  isComplete: boolean;
}

export interface RequirementsSummary {
  learner: {
    background: string;
    weekly_hours: number;
    preferences: string;
  };
  goal: string;
  constraints: {
    total_hours: number;
    stages: number;
    hard_limits: string;
  };
  evaluation: {
    acceptance_criteria: string;
    feedback_cycle: string;
  };
}

// 学习大纲相关类型
export interface LearningPhase {
  phase: number;
  title: string;
  duration: string;
  objective: string;
  keyMilestones: string[];
  description: string;
}

export interface LearningOutline {
  overview: {
    title: string;
    description: string;
    totalWeeks: number;
    expectedOutcome: string;
  };
  phases: LearningPhase[];
}

// 三阶段生成流程的状态类型
export type GenerationStage = 'clarification' | 'outline' | 'detailed_plan';

export interface GenerationState {
  stage: GenerationStage;
  conversationHistory?: ConversationMessage[];
  requirementsSummary?: RequirementsSummary;
  approvedOutline?: LearningOutline;
  finalPlan?: LearningPlan;
}
