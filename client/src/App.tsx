import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Navbar } from "./components/layout/Navbar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateCourse from "./pages/CreateCourse";
import CourseView from "./pages/CourseView";
import QuizView from "./pages/QuizView";
import ProgressView from "./pages/ProgressView";
import DocComprehension from "./pages/DocComprehension";
import VideoComprehension from "./pages/VideoComprehension";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login"><Auth mode="login" /></Route>
          <Route path="/register"><Auth mode="register" /></Route>
          
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/create" component={CreateCourse} />
          <Route path="/course/:id" component={CourseView} />
          <Route path="/quiz/:topic_id" component={QuizView} />
          <Route path="/progress/:course_id" component={ProgressView} />
          
          <Route path="/tools/document" component={DocComprehension} />
          <Route path="/tools/video" component={VideoComprehension} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
