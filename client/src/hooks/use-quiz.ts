import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useChapterQuiz(topicId: string) {
  return useQuery({
    queryKey: [api.quiz.getChapterQuiz.path, topicId],
    queryFn: () => apiFetch(buildUrl(api.quiz.getChapterQuiz.path, { topic_id: topicId })),
    enabled: !!topicId,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.quiz.submit.input>) => {
      return apiFetch(api.quiz.submit.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate progress queries to update UI
      queryClient.invalidateQueries({ queryKey: [api.quiz.getProgress.path] });
      toast({ title: "Quiz Submitted", description: "Your progress has been saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useFullTest(topicId: string) {
  return useQuery({
    queryKey: [api.quiz.getFullTest.path, topicId],
    queryFn: () => apiFetch(buildUrl(api.quiz.getFullTest.path, { topic_id: topicId })),
    enabled: !!topicId,
  });
}

export function useProgress(courseId: string) {
  return useQuery({
    queryKey: [api.quiz.getProgress.path, courseId],
    queryFn: () => apiFetch(buildUrl(api.quiz.getProgress.path, { course_id: courseId })),
    enabled: !!courseId,
  });
}
