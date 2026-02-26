import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useCourse } from "@/hooks/use-courses";
import { useProgress } from "@/hooks/use-quiz";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  Brain,
  PlayCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function CourseView() {
  const [, params] = useRoute("/course/:id");
  const courseId = params?.id || "";

  const { data: course, isLoading } = useCourse(courseId);
  const { data: progressData } = useProgress(courseId);

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // Set initial active topic once loaded
  useEffect(() => {
    if (course?.topics?.length && !activeTopicId) {
      // Find first incomplete topic, or default to first
      const firstIncomplete = course.topics.find((t: any) => {
        const prog = progressData?.find((p: any) => p.topicId === t.id);
        return !prog?.isCompleted;
      });
      setActiveTopicId(firstIncomplete?.id || course.topics[0].id);
    }
  }, [course, progressData, activeTopicId]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 border-r border-white/10 p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex-1 p-10">
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!course)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Course not found
      </div>
    );

  const topics = [...course.topics].sort(
    (a: any, b: any) => a.orderIndex - b.orderIndex,
  );
  const activeTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  const totalTopics = topics.length;
  const completedTopics =
    progressData?.filter((p: any) => p.isCompleted).length || 0;
  const progressPercent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar Navigation */}
      <div className="w-80 flex-shrink-0 border-r border-white/10 bg-card/30 overflow-y-auto hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10 sticky top-0 bg-background/95 backdrop-blur z-10">
          <h2 className="font-display font-bold text-lg leading-tight mb-4">
            {course.title}
          </h2>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Course Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-secondary" />
          </div>
        </div>

        <div className="p-4 space-y-2">
          {topics.map((topic, idx) => {
            const isActive = topic.id === activeTopicId;
            const prog = progressData?.find((p: any) => p.topicId === topic.id);
            const isCompleted = prog?.isCompleted;
            // Simplified unlock logic: first topic unlocked, or previous topic completed
            const prevProg =
              idx > 0
                ? progressData?.find(
                    (p: any) => p.topicId === topics[idx - 1].id,
                  )
                : { isCompleted: true };
            const isUnlocked = idx === 0 || prevProg?.isCompleted;

            return (
              <button
                key={topic.id}
                onClick={() => isUnlocked && setActiveTopicId(topic.id)}
                disabled={!isUnlocked}
                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                  isActive
                    ? "bg-primary/10 border border-primary/30"
                    : isUnlocked
                      ? "hover:bg-white/5 border border-transparent"
                      : "opacity-50 cursor-not-allowed border border-transparent"
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isUnlocked ? (
                    <Circle
                      className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium text-sm leading-tight ${isActive ? "text-primary" : "text-foreground"}`}
                  >
                    {idx + 1}. {topic.title}
                  </p>
                  {isCompleted && prog?.difficulty && (
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Level: {prog.difficulty}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <Link href={`/progress/${course.id}`}>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl border-white/10"
            >
              <BarChart3 className="mr-2 w-4 h-4" />
              Detailed Progress
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative scroll-smooth">
        {activeTopic ? (
          <div className="max-w-4xl mx-auto px-6 py-12 md:px-12">
            <motion.div
              key={activeTopic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                    Chapter{" "}
                    {topics.findIndex((t) => t.id === activeTopic.id) + 1}
                  </span>
                  {activeTopic.notebook && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> Interactive
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                  {activeTopic.title}
                </h1>

                {/* AI Summary Pill */}
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-white/10 rounded-2xl p-5 flex gap-4 items-start">
                  <Brain className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      AI Summary
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {activeTopic.aiSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="prose-custom">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeTopic.content}
                </ReactMarkdown>
              </div>

              {/* Action Bar at Bottom */}
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center pb-20">
                <div>
                  <h4 className="font-semibold text-lg">
                    Ready to test your knowledge?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Take the adaptive quiz to unlock the next chapter.
                  </p>
                </div>
                <Link href={`/quiz/${activeTopic.id}?courseId=${courseId}`}>
                  <Button
                    size="lg"
                    className="rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 text-base font-bold w-full sm:w-auto"
                  >
                    Take Chapter Quiz
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a chapter to begin.
          </div>
        )}
      </div>
    </div>
  );
}
