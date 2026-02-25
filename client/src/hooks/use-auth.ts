import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type LoginInput = z.infer<typeof api.auth.login.input>;
type RegisterInput = z.infer<typeof api.auth.register.input>;

export function useAuth() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      if (!localStorage.getItem("learnai_token")) return null;
      try {
        return await apiFetch(api.auth.me.path);
      } catch (err) {
        return null;
      }
    },
    retry: false,
  });
}

export function useLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await apiFetch(api.auth.login.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem("learnai_token", data.access_token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useRegister() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await apiFetch(api.auth.register.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem("learnai_token", data.access_token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ title: "Account created!", description: "Welcome to LearnAI." });
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useLogout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return () => {
    localStorage.removeItem("learnai_token");
    queryClient.setQueryData([api.auth.me.path], null);
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    setLocation("/");
  };
}
