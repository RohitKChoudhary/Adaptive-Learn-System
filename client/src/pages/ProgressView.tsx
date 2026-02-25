import { useRoute } from "wouter";
import { useProgress, useCourse } from "@/hooks/use-courses"; // Fixed import: useProgress is in quiz, useCourse is in courses
import { useProgress as useQuizProgress } from "@/hooks/use-quiz";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, BrainCircuit } from "lucide-react";

export default function ProgressView() {
  const [, params] = useRoute("/progress/:course_id");
  const courseId = params?.course_id || "";

  const { data: course } = useCourse(courseId);
  const { data: progressData } = useQuizProgress(courseId);

  if (!course || !progressData) return null;

  const topics = course.topics || [];
  const completed = progressData.filter((p: any) => p.isCompleted).length;
  const total = topics.length;
  const overallPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Prepare chart data
  const chartData = topics.map((t: any, i: number) => {
    const prog = progressData.find((p: any) => p.topicId === t.id);
    const score = prog?.score || 0;
    const totalQ = prog?.totalQuestions || 5;
    const accuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
    
    return {
      name: `Ch ${i+1}`,
      accuracy,
      difficulty: prog?.difficulty || 'Not Started',
      isCompleted: !!prog?.isCompleted
    };
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Analytics & Progress</h1>
        <p className="text-muted-foreground mt-2 text-lg">{course.title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="glass-panel border-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Completion</p>
              <h3 className="text-3xl font-bold">{overallPercent}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <Target className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Chapters Mastered</p>
              <h3 className="text-3xl font-bold">{completed} <span className="text-xl text-muted-foreground">/ {total}</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg Accuracy</p>
              <h3 className="text-3xl font-bold">
                {chartData.length > 0 ? Math.round(chartData.reduce((acc: number, curr: any) => acc + curr.accuracy, 0) / chartData.length) : 0}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 glass-panel border-white/5">
          <CardHeader>
            <CardTitle>Chapter Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.isCompleted ? 'hsl(199 100% 50%)' : 'hsl(217 32% 30%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>Chapter Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {topics.map((t: any, i: number) => {
              const prog = progressData.find((p: any) => p.topicId === t.id);
              const diff = prog?.difficulty || 'Easy';
              return (
                <div key={t.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium line-clamp-1 flex-1 pr-4">{i+1}. {t.title}</span>
                    <span className={`font-semibold ${diff === 'Hard' ? 'text-red-400' : diff === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {diff}
                    </span>
                  </div>
                  <Progress value={prog?.isCompleted ? 100 : 0} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
