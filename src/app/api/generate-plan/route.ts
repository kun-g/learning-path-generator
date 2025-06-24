import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// 配置OpenRouter客户端
const openrouter = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

// 定义学习计划的数据结构
const learningPlanSchema = z.object({
  plan: z.array(
    z.object({
      week: z.number(),
      title: z.string(),
      skills: z.array(z.string()),
      deliverable: z.string(),
      resources: z.array(
        z.object({
          name: z.string(),
          url: z.string(),
        })
      ),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const { 
      requirementsSummary,
      approvedOutline 
    } = await request.json();

    const outlineText = approvedOutline 
      ? `
学习概览：${approvedOutline.overview.title}
${approvedOutline.overview.description}

各阶段安排：
${approvedOutline.phases.map(phase => `
第${phase.phase}阶段：${phase.title}（${phase.duration}）
目标：${phase.objective}
关键里程碑：${phase.keyMilestones.join('、')}
`).join('\n')}
`
      : '无大纲信息';

    // 构建AI提示词
    const prompt = `
## 你的身份
你是一名资深「项目制学习规划师」。

## 任务
基于用户澄清的需求和已确认的学习大纲，生成详细的Project-Based Learning执行计划。

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

## 已确认学习大纲
${outlineText}

## 详细计划要求
1. 严格按照确认的大纲框架生成6周详细计划
2. 每周包含：
   - **项目标题**（<= 10字，体现该周核心任务）
   - **核心技能**（3-5个技能点）
   - **可交付成果**（具体的项目产物）
   - **学习资源**（3个高质量资源链接）
3. 确保每周项目与大纲阶段目标对应
4. 项目难度递进，技能逐步深入
5. 资源要真实有效，优先官方文档和知名平台

## 输出格式要求
返回JSON格式，包含字段：week, title, skills, deliverable, resources
`;

    // 调用AI生成结构化内容
    const { object } = await generateObject({
      model: openrouter('openai/gpt-4o'),
      schema: learningPlanSchema,
      prompt,
    });

    return Response.json(object);
  } catch (error) {
    console.error('生成学习计划失败:', error);
    return Response.json(
      { error: '生成学习计划失败，请稍后重试' },
      { status: 500 }
    );
  }
}
