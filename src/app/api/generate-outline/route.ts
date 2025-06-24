import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// 配置OpenRouter客户端
const openrouter = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

// 定义学习大纲的数据结构
const learningOutlineSchema = z.object({
  overview: z.object({
    title: z.string(),
    description: z.string(),
    totalWeeks: z.number(),
    expectedOutcome: z.string(),
  }),
  phases: z.array(
    z.object({
      phase: z.number(),
      title: z.string(),
      duration: z.string(),
      objective: z.string(),
      keyMilestones: z.array(z.string()),
      description: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const { requirementsSummary } = await request.json();

    // 构建设计大纲的AI提示词
    const prompt = `
## 你的身份
你是一名资深「学习路径架构师」，擅长设计循序渐进的项目制学习大纲。

## 任务
基于用户澄清的需求信息，设计一个Project-Based Learning大纲框架。

## 用户需求摘要
### 学习者画像
- 背景：${requirementsSummary.learner.background}
- 每周投入时间：${requirementsSummary.learner.weekly_hours}小时
- 学习偏好：${requirementsSummary.learner.preferences}

### 学习目标
${requirementsSummary.goal}

### 时间与资源约束
- 总时长：${requirementsSummary.constraints.total_hours}小时
- 阶段数：${requirementsSummary.constraints.stages}个阶段
- 硬性限制：${requirementsSummary.constraints.hard_limits}

### 评估方式
- 验收标准：${requirementsSummary.evaluation.acceptance_criteria}
- 反馈频率：${requirementsSummary.evaluation.feedback_cycle}

## 设计要求
1. 将6周学习分为2-3个阶段（Phase），每个阶段2-3周
2. 每个阶段要有明确的学习目标和关键里程碑
3. 阶段之间要有逻辑递进关系：基础→进阶→实战
4. 考虑用户的时间投入和技能水平
5. 确保每个阶段都有可验证的学习成果

## 输出格式
- 学习概览：标题、描述、总周数、预期成果
- 各阶段详情：阶段号、标题、持续时间、目标、关键里程碑、详细描述

返回JSON格式数据。
`;

    // 调用AI生成学习大纲
    const { object } = await generateObject({
      model: openrouter('openai/gpt-4o'),
      schema: learningOutlineSchema,
      prompt,
    });

    return Response.json(object);
  } catch (error) {
    console.error('生成学习大纲失败:', error);
    return Response.json(
      { error: '生成学习大纲失败，请稍后重试' },
      { status: 500 }
    );
  }
}