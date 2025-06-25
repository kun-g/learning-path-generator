'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Target, Clock, ExternalLink, CheckCircle, ArrowRight, ArrowLeft, MessageSquare, FileText } from 'lucide-react';
import type { 
  LearningPlan, 
  GenerationState, 
  ClarificationResponse,
  LearningOutline,
  ConversationMessage,
  RequirementsSummary
} from '@/types';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>({
    stage: 'clarification',
  });
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      content: '你好！我是AI学习规划师，专门帮助大家制定个性化的学习计划。\n\n请告诉我你想学什么？比如："我想学React前端开发"、"想掌握Python数据分析"等等。',
      timestamp: Date.now()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [requirementsSummary, setRequirementsSummary] = useState<RequirementsSummary | null>(null);
  const [learningOutline, setLearningOutline] = useState<LearningOutline | null>(null);
  const [finalPlan, setFinalPlan] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);


  // 调试模式：预设对话和需求数据，但保留手动操作
  const runDebugMode = async () => {
    setIsLoading(true);
    setError('');
    
    // 模拟需求澄清对话
    const debugConversation: ConversationMessage[] = [
      {
        role: 'assistant',
        content: '你好！我是AI学习规划师，专门帮助大家制定个性化的学习计划。\n\n请告诉我你想学什么？比如："我想学React前端开发"、"想掌握Python数据分析"等等。',
        timestamp: Date.now()
      },
      {
        role: 'user',
        content: '我要调试',
        timestamp: Date.now() + 1000
      },
      {
        role: 'assistant',
        content: '🔧 调试模式已启动！正在使用预设的iOS移动端开发学习需求...',
        timestamp: Date.now() + 2000
      },
      {
        role: 'user',
        content: '我想学习移动端开发，特别是iOS开发',
        timestamp: Date.now() + 3000
      },
      {
        role: 'assistant',
        content: '很好！你想学习iOS开发。为了给你制定最合适的学习计划，我需要了解一些情况：\n\n1. 你目前的编程基础如何？是否有其他编程语言经验？\n2. 每周大概能投入多少时间学习？\n3. 你的学习目标是什么？是希望找工作还是个人兴趣？',
        timestamp: Date.now() + 4000
      },
      {
        role: 'user',
        content: '我有一些Java基础，每周能投入15小时，目标是能开发一个完整的iOS应用',
        timestamp: Date.now() + 5000
      },
      {
        role: 'assistant',
        content: '明白了！根据你的情况，我来总结一下你的需求：\n\n## 📋 需求摘要\n\n### 🎯 学习目标\n**学习iOS开发，能够独立开发完整的移动应用**\n\n### 👤 学习者画像\n- **背景**：有Java编程基础，对移动端开发感兴趣\n- **每周时间**：15小时\n- **学习偏好**：希望通过实际项目来学习，偏好循序渐进的方式\n\n### ⏰ 约束条件\n- **总时长**：90小时\n- **阶段数**：3个阶段\n- **限制**：每周最多15小时，希望6周内完成基础学习\n\n### 📊 评估方式\n- **验收标准**：能够独立开发一个包含基本功能的iOS应用\n- **反馈频率**：每周检查学习进度和项目完成情况\n\n---\n\n✅ **需求澄清完成！** 点击"生成学习大纲"按钮继续下一步。',
        timestamp: Date.now() + 6000
      }
    ];

    // 预设的需求摘要
    const debugRequirementsSummary: RequirementsSummary = {
      goal: "学习iOS开发，能够独立开发完整的移动应用",
      learner: {
        background: "有Java编程基础，对移动端开发感兴趣",
        weekly_hours: 15,
        preferences: "希望通过实际项目来学习，偏好循序渐进的方式"
      },
      constraints: {
        total_hours: 90,
        stages: 3,
        hard_limits: "每周最多15小时，希望6周内完成基础学习"
      },
      evaluation: {
        acceptance_criteria: "能够独立开发一个包含基本功能的iOS应用",
        feedback_cycle: "每周检查学习进度和项目完成情况"
      }
    };

    try {
      // 模拟对话历史，逐条显示
      setConversationHistory([debugConversation[0]]);
      
      for (let i = 1; i < debugConversation.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setConversationHistory(debugConversation.slice(0, i + 1));
      }
      
      // 设置需求摘要，但停留在澄清阶段，等待手动操作
      setRequirementsSummary(debugRequirementsSummary);
      setGenerationState({
        stage: 'clarification',
        conversationHistory: debugConversation,
        requirementsSummary: debugRequirementsSummary
      });

    } catch (err) {
      setError('调试模式执行失败：' + err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    // 检查调试模式
    if (currentMessage.trim() === '我要调试') {
      await runDebugMode();
      return;
    }

    const userMessage: ConversationMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: Date.now()
    };

    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);
    setCurrentMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/clarify-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: newHistory,
          userMessage: currentMessage
        }),
      });

      if (!response.ok) throw new Error('发送消息失败');

      const result = await response.json();
      
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: result.message,
        timestamp: Date.now()
      };

      setConversationHistory([...newHistory, assistantMessage]);

      // 检查是否完成需求澄清
      if (result.isComplete) {
        // 从Markdown中解析需求摘要
        try {
          const content = result.message;
          
          // 提取各个部分的信息
          const goalMatch = content.match(/### 🎯 学习目标\s*\*\*(.*?)\*\*/);
          const backgroundMatch = content.match(/- \*\*背景\*\*：(.*?)(?=\n|$)/);
          const weeklyHoursMatch = content.match(/- \*\*每周时间\*\*：(\d+)小时/);
          const preferencesMatch = content.match(/- \*\*学习偏好\*\*：(.*?)(?=\n|$)/);
          const totalHoursMatch = content.match(/- \*\*总时长\*\*：(\d+)小时/);
          const stagesMatch = content.match(/- \*\*阶段数\*\*：(\d+)个阶段/);
          const limitsMatch = content.match(/- \*\*限制\*\*：(.*?)(?=\n|$)/);
          const criteriaMatch = content.match(/- \*\*验收标准\*\*：(.*?)(?=\n|$)/);
          const feedbackMatch = content.match(/- \*\*反馈频率\*\*：(.*?)(?=\n|$)/);

          const summary = {
            goal: goalMatch?.[1]?.trim() || '',
            learner: {
              background: backgroundMatch?.[1]?.trim() || '',
              weekly_hours: parseInt(weeklyHoursMatch?.[1] || '0'),
              preferences: preferencesMatch?.[1]?.trim() || ''
            },
            constraints: {
              total_hours: parseInt(totalHoursMatch?.[1] || '0'),
              stages: parseInt(stagesMatch?.[1] || '0'),
              hard_limits: limitsMatch?.[1]?.trim() || ''
            },
            evaluation: {
              acceptance_criteria: criteriaMatch?.[1]?.trim() || '',
              feedback_cycle: feedbackMatch?.[1]?.trim() || ''
            }
          };

          setRequirementsSummary(summary);
          setGenerationState({
            ...generationState,
            conversationHistory: [...newHistory, assistantMessage],
            requirementsSummary: summary,
            stage: 'clarification'
          });
        } catch (parseError) {
          console.error('解析需求摘要失败:', parseError);
        }
      }
    } catch (err) {
      setError('发送消息失败，请重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 第二阶段：生成大纲
  const handleGenerateOutline = async () => {
    if (!requirementsSummary) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementsSummary,
        }),
      });

      if (!response.ok) throw new Error('生成大纲失败');

      const outline = await response.json();
      setLearningOutline(outline);
      setGenerationState({
        ...generationState,
        requirementsSummary,
        stage: 'outline'
      });
    } catch (err) {
      setError('生成学习大纲失败，请重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 第三阶段：生成详细计划
  const handleGeneratePlan = async () => {
    if (!requirementsSummary || !learningOutline) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementsSummary,
          approvedOutline: learningOutline,
        }),
      });

      if (!response.ok) throw new Error('生成计划失败');

      const plan = await response.json();
      setFinalPlan(plan);
      setGenerationState({
        ...generationState,
        approvedOutline: learningOutline,
        finalPlan: plan,
        stage: 'detailed_plan'
      });
    } catch (err) {
      setError('生成详细计划失败，请重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 重新开始
  const handleRestart = () => {
    setGenerationState({ stage: 'clarification' });
    setConversationHistory([
      {
        role: 'assistant',
        content: '你好！我是AI学习规划师，专门帮助大家制定个性化的学习计划。\n\n请告诉我你想学什么？比如："我想学React前端开发"、"想掌握Python数据分析"等等。',
        timestamp: Date.now()
      }
    ]);
    setCurrentMessage('');
    setRequirementsSummary(null);
    setLearningOutline(null);
    setFinalPlan(null);
    setError('');
  };

  // 渲染对话消息
  const renderMessage = (message: ConversationMessage) => {
    return (
      <div key={message.timestamp} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 min-w-0 w-full`}>
        <div className={`max-w-[80%] min-w-0 p-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="text-sm break-words hyphens-auto" style={{wordWrap: 'break-word', overflowWrap: 'anywhere'}}>{message.content}</div>
          {mounted && (
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 进度指示器
  const getProgressStep = () => {
    switch (generationState.stage) {
      case 'clarification': return 1;
      case 'outline': return 2;
      case 'detailed_plan': return 3;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题和进度 */}
        <div className="text-center py-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI学习路径生成器
          </h1>
          
          {/* 进度条 */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            {[
              { step: 1, label: '澄清需求', icon: MessageSquare },
              { step: 2, label: '设计大纲', icon: FileText },
              { step: 3, label: '详细计划', icon: BookOpen }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  getProgressStep() >= step 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {getProgressStep() > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  getProgressStep() >= step ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  {label}
                </span>
                {step < 3 && <ArrowRight className="w-4 h-4 mx-3 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-600 text-sm">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* 澄清需求阶段：单独布局 */}
        {generationState.stage === 'clarification' && (
          <div className="max-w-4xl mx-auto">
            <Card className="min-h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  第一步：澄清需求
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col p-3 flex-1">
                {/* 对话区域：可滚动 */}
                <div className="flex-1 overflow-y-auto mb-4 min-h-0">
                  {conversationHistory.map(renderMessage)}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  
                  {/* 如果有需求摘要，在对话区域内显示 */}
                  {requirementsSummary && (
                    <div className="mt-4 mb-4">
                      <Card className="border-gray-200 bg-white shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-900">需求摘要</CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            基于对话收集的需求信息
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">学习者画像</h4>
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">背景：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.learner.background}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">每周时间：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.learner.weekly_hours}小时</span>
                              </div>
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">偏好：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.learner.preferences}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">学习目标</h4>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-800">{requirementsSummary.goal}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">约束条件</h4>
                            <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">总时长：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.constraints.total_hours}小时</span>
                              </div>
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">阶段数：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.constraints.stages}个阶段</span>
                              </div>
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">限制：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.constraints.hard_limits}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">评估方式</h4>
                            <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">验收标准：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.evaluation.acceptance_criteria}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="font-medium text-sm text-gray-700 min-w-20">反馈频率：</span>
                                <span className="text-sm text-gray-800">{requirementsSummary.evaluation.feedback_cycle}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
                
                {/* 底部固定区域 */}
                <div className="border-t pt-4 flex-shrink-0">
                  {/* 如果完成了澄清，在输入框上方显示操作按钮 */}
                  {requirementsSummary && (
                    <div className="flex gap-3 mb-4">
                      <Button
                        variant="outline"
                        onClick={handleRestart}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        重新开始
                      </Button>
                      <Button
                        onClick={handleGenerateOutline}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        生成学习大纲
                      </Button>
                    </div>
                  )}
                  
                  {/* 输入框始终保留 */}
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder={requirementsSummary ? "继续优化需求..." : "输入您的回答..."}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || !currentMessage.trim()}
                    >
                      发送
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 其他阶段：双栏布局 */}
        {generationState.stage !== 'clarification' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：当前阶段操作 */}
            <div className="space-y-6">

            {/* 第二步：设计大纲 */}
            {learningOutline && generationState.stage === 'outline' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    第二步：确认大纲
                  </CardTitle>
                  <CardDescription>
                    请确认学习大纲，然后生成详细计划
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      {learningOutline.overview.title}
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      {learningOutline.overview.description}
                    </p>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      预期成果：{learningOutline.overview.expectedOutcome}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {learningOutline.phases.map((phase) => (
                      <div key={phase.phase} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">
                            第{phase.phase}阶段：{phase.title}
                          </h5>
                          <Badge variant="secondary">{phase.duration}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{phase.objective}</p>
                        <div className="flex flex-wrap gap-2">
                          {phase.keyMilestones.map((milestone) => (
                            <Badge key={milestone} variant="outline" className="text-xs">
                              {milestone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGenerationState({ ...generationState, stage: 'clarification' });
                        setLearningOutline(null);
                      }}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      重新设计
                    </Button>
                    <Button
                      onClick={handleGeneratePlan}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          生成详细计划中...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          生成详细计划
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 完成状态 */}
            {finalPlan && generationState.stage === 'detailed_plan' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      学习计划生成完成！
                    </h3>
                    <p className="text-sm text-green-600 mb-6">
                      您的专属6周学习路径已准备就绪
                    </p>
                    <Button 
                      onClick={handleRestart}
                      variant="outline" 
                      className="bg-white"
                    >
                      重新开始
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：结果展示 */}
          <div className="space-y-6">
              {requirementsSummary && !finalPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle>需求摘要</CardTitle>
                    <CardDescription>
                      基于对话收集的需求信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">学习者画像</h4>
                      <div className="bg-blue-50 p-3 rounded-md space-y-1">
                        <p className="text-sm"><strong>背景：</strong>{requirementsSummary.learner.background}</p>
                        <p className="text-sm"><strong>每周时间：</strong>{requirementsSummary.learner.weekly_hours}小时</p>
                        <p className="text-sm"><strong>偏好：</strong>{requirementsSummary.learner.preferences}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">学习目标</h4>
                      <p className="text-sm bg-green-50 p-3 rounded-md">{requirementsSummary.goal}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">约束条件</h4>
                      <div className="bg-yellow-50 p-3 rounded-md space-y-1">
                        <p className="text-sm"><strong>总时长：</strong>{requirementsSummary.constraints.total_hours}小时</p>
                        <p className="text-sm"><strong>阶段数：</strong>{requirementsSummary.constraints.stages}个阶段</p>
                        <p className="text-sm"><strong>限制：</strong>{requirementsSummary.constraints.hard_limits}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">评估方式</h4>
                      <div className="bg-purple-50 p-3 rounded-md space-y-1">
                        <p className="text-sm"><strong>验收标准：</strong>{requirementsSummary.evaluation.acceptance_criteria}</p>
                        <p className="text-sm"><strong>反馈频率：</strong>{requirementsSummary.evaluation.feedback_cycle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {finalPlan ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>你的学习计划</CardTitle>
                      <CardDescription>
                        目标: {requirementsSummary?.goal} | 
                        每周投入: {requirementsSummary?.learner.weekly_hours} 小时
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {finalPlan.plan.map((week) => (
                    <Card key={week.week} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            第 {week.week} 周: {week.title}
                          </CardTitle>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            第 {week.week} 周
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 核心技能 */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">
                            核心技能
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {week.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* 关键产物 */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">
                            项目成果
                          </h4>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-md">
                            {week.deliverable}
                          </p>
                        </div>

                        {/* 学习资源 */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">
                            推荐资源
                          </h4>
                          <div className="space-y-2">
                            {week.resources.map((resource) => (
                              <a
                                key={resource.url}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {resource.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>按照左侧步骤，生成你的专属学习计划</p>
                    <p className="text-xs mt-2">澄清需求 → 设计大纲 → 详细计划</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}