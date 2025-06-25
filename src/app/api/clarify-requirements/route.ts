import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// 配置OpenRouter客户端
const openrouter = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log('=== 开始处理澄清需求请求 ===');
    const requestBody = await request.json();
    const { conversationHistory, userMessage } = requestBody;
    
    console.log('请求参数:', {
      conversationHistoryLength: conversationHistory?.length || 0,
      userMessage: userMessage?.substring(0, 100) + (userMessage?.length > 100 ? '...' : ''),
      hasConversationHistory: !!conversationHistory
    });

    // 构建对话历史
    const conversationText = conversationHistory 
      ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    console.log('对话历史长度:', conversationText.length);

    // 构建对话式澄清需求的AI提示词
    const prompt = `
## 你的身份
你是一名资深「项目制学习规划师」。

## 会话目标
通过分步提问，依次收集并最终确认以下四类信息：
1. 学习者画像（起点、每周可投入时间、偏好）
2. 学习目标（结果导向，一句话）
3. 时间 / 资源约束（总时长、阶段数、硬性限制）
4. 评估方式（验收标准、反馈频率）

## 对话流程
循环执行以下步骤，直至四类信息全部收集完毕：
1. ** 根据当前用户提供的信息,判断还缺少什么信息,构造相关引导问题。引导问题里包含用户可以借用的建议。 **
2. 等待学习者回答  
3. 如果信息收集完整就到下一阶段否则回到第一步 

## 结束与确认
- 当四类信息均已收集完整后，输出 \`[需求澄清完成]\`  
- 紧接着用 \`\`\`json\`\`\` 包裹完整需求摘要：  
  \`\`\`json
  {
    "learner": {
      "background": "...",
      "weekly_hours": ...,
      "preferences": "..."
    },
    "goal": "...",
    "constraints": {
      "total_hours": ...,
      "stages": ...,
      "hard_limits": "..."
    },
    "evaluation": {
      "acceptance_criteria": "...",
      "feedback_cycle": "..."
    }
  }
  \`\`\`

## 对话历史
${conversationText}

## 当前用户消息
user: ${userMessage}

请根据对话历史和当前用户消息，继续对话。记住：每次只问一个问题，目标是收集完整的四类信息。
`;

    console.log('提示词长度:', prompt.length);
    console.log('开始调用AI API...');

    // 调用AI生成对话回复
    const startTime = Date.now();
    const { text } = await generateText({
      model: openrouter('openai/gpt-4o'),
      prompt,
      maxTokens: 1000, // 限制输出长度
      temperature: 0.7,
      abortSignal: AbortSignal.timeout(30000), // 30秒超时
    });
    const endTime = Date.now();

    console.log('AI API调用成功:', {
      duration: endTime - startTime + 'ms',
      responseLength: text.length,
      responsePreview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      isComplete: text.includes('[需求澄清完成]')
    });

    return Response.json({ 
      message: text,
      isComplete: text.includes('[需求澄清完成]')
    });
  } catch (error) {
    console.error('=== 对话处理失败 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    
    if (error.cause) {
      console.error('错误原因:', error.cause);
    }
    
    if (error.data) {
      console.error('错误数据:', error.data);
    }

    if (error.url) {
      console.error('请求URL:', error.url);
    }

    if (error.statusCode) {
      console.error('状态码:', error.statusCode);
    }

    if (error.responseHeaders) {
      console.error('响应头:', error.responseHeaders);
    }

    return Response.json(
      { error: '对话失败，请稍后重试' },
      { status: 500 }
    );
  }
}