import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useFullCourses() {
  return useQuery({
    queryKey: [api.courses.listFull.path],
    queryFn: () => apiFetch(api.courses.listFull.path),
  });
}

export function useOneShotCourses() {
  return useQuery({
    queryKey: [api.courses.listOneShot.path],
    queryFn: () => apiFetch(api.courses.listOneShot.path),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: [api.courses.getSingle.path, id],
    queryFn: () => apiFetch(buildUrl(api.courses.getSingle.path, { course_id: id })),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, formData }: { type: 'FULL' | 'ONESHOT', formData: FormData }) => {
      const path = type === 'FULL' ? api.courses.createFull.path : api.courses.createOneShot.path;
      return apiFetch(path, {
        method: "POST",
        body: formData, // FormData handles its own Content-Type boundary
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [variables.type === 'FULL' ? api.courses.listFull.path : api.courses.listOneShot.path] 
      });
      toast({ title: "Course Created!", description: "Your AI-generated course is ready." });
      if (data?.id) {
        setLocation(`/course/${data.id}`);
      } else {
        setLocation('/dashboard');
      }
    },
    onError: (err: Error) => {
      toast({ title: "Creation failed", description: err.message, variant: "destructive" });
    },
  });
}
