import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useDocUpload() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return apiFetch(api.comprehension.docUpload.path, {
        method: "POST",
        body: formData,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useDocAsk() {
  return useMutation({
    mutationFn: async (data: { question: string, session_id: string, text: string }) => {
      return apiFetch(api.comprehension.docAsk.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useVideoExtract() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (url: string) => {
      return apiFetch(api.comprehension.videoExtract.path, {
        method: "POST",
        body: JSON.stringify({ url }),
      });
    },
    onError: (err: Error) => {
      toast({ title: "Extraction failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useVideoAsk() {
  return useMutation({
    mutationFn: async (data: { question: string, session_id: string, text: string }) => {
      return apiFetch(api.comprehension.videoAsk.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}
