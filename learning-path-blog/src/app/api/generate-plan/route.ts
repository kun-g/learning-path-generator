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
    const { goal, level, timeCommitment, currentSkills } = await request.json();

    // 构建AI提示词
    const prompt = `
## 你的身份
你是一名资深「项目制学习规划师」。

## 任务
请根据用户给出的学习目标，输出一份为期 6 周的 Project-Based Learning 计划。

## 用户信息
- 学习目标：${goal}
- 技能水平：${level}
- 每天投入时间：${timeCommitment}小时
- 学习背景：${currentSkills}

## 要求
1. 计划分 6 个 Sprint（每周一个）。
2. 每个 Sprint 包含：
   - **挑战性项目标题**（<= 10 字）
   - **核心技能**（3-5 个 bullet）
   - **关键产物**（可验证交付物，1-2 句）
   - **资源清单**（教程 / 开源 repo / 文章 3 条，提供真实可访问的URL）
3. 项目难度应该递进，从简单到复杂
4. 确保每个项目都有明确的可交付成果
5. 技能应该围绕学习目标循序渐进
6. 资源链接要真实有效，优先推荐官方文档、知名教程网站

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
