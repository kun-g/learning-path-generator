'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Target, Clock, ExternalLink } from 'lucide-react';
import type { LearningGoal, LearningPlan } from '@/types';

export default function Home() {
  const [formData, setFormData] = useState<LearningGoal>({
    goal: '',
    level: 'beginner',
    timeCommitment: 5,
    currentSkills: '',
  });
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const plan = await response.json();
      setLearningPlan(plan);
    } catch (err) {
      setError('生成学习计划失败，请检查网络连接或稍后重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const levelLabels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '精通',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题区域 */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI学习路径生成器
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于项目驱动的个性化学习计划，让你在6周内掌握新技能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入表单 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                设定学习目标
              </CardTitle>
              <CardDescription>
                告诉我们你想学什么，我们为你定制专属学习路径
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">学习目标</label>
                  <Input
                    placeholder="例如：Web前端开发、Python数据分析、UI/UX设计..."
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">技能水平</label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">入门（零基础）</SelectItem>
                      <SelectItem value="intermediate">进阶（有一定基础）</SelectItem>
                      <SelectItem value="advanced">精通（想要深入）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">每周投入时间（小时）</label>
                  <Input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.timeCommitment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeCommitment: Number.parseInt(e.target.value) || 5,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">学习背景（可选）</label>
                  <Textarea
                    placeholder="描述你的学习背景、相关经验或期望达到的具体目标，帮助我们更好地定制计划..."
                    value={formData.currentSkills}
                    onChange={(e) =>
                      setFormData({ ...formData, currentSkills: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !formData.goal.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      生成学习计划
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 右侧：学习计划展示 */}
          <div className="space-y-6">
            {learningPlan ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>你的6周学习计划</CardTitle>
                    <CardDescription>
                      目标: {formData.goal} | 水平: {levelLabels[formData.level]} |
                      每周 {formData.timeCommitment} 小时
                    </CardDescription>
                  </CardHeader>
                </Card>

                {learningPlan.plan.map((week) => (
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
                  <p>填写左侧表单，生成你的专属学习计划</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
