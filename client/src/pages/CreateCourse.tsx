import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateCourse } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UploadCloud, FileText, BrainCircuit, ArrowRight, Loader2 } from "lucide-react";

export default function CreateCourse() {
  const [type, setType] = useState<'FULL' | 'ONESHOT'>('FULL');
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const createCourse = useCreateCourse();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("course_type", type); // Usually good practice to include type in form

    createCourse.mutate({ type, formData });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-foreground">Generate Course</h1>
        <p className="text-muted-foreground mt-2 text-lg">Let AI build a personalized curriculum from your syllabus or document.</p>
      </div>

      <Card className="glass-panel p-8 sm:p-10 border-white/10 rounded-[2rem]">
        <AnimatePresence mode="wait">
          {createCourse.isPending ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-glow">Analyzing Syllabus...</h3>
              <p className="text-muted-foreground">Extracting topics, generating markdown content, and creating quizzes. This may take a minute.</p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-8"
            >
              <div className="space-y-4">
                <Label className="text-base text-foreground font-semibold">Course Type</Label>
                <RadioGroup defaultValue={type} onValueChange={(v) => setType(v as 'FULL' | 'ONESHOT')} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${type === 'FULL' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20 bg-secondary/50'}`} onClick={() => setType('FULL')}>
                    <RadioGroupItem value="FULL" id="full" className="sr-only" />
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <Label htmlFor="full" className="font-bold cursor-pointer">Full Curriculum</Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">Deep dive with multiple chapters, progressive difficulty, and comprehensive testing.</p>
                  </div>
                  
                  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${type === 'ONESHOT' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20 bg-secondary/50'}`} onClick={() => setType('ONESHOT')}>
                    <RadioGroupItem value="ONESHOT" id="oneshot" className="sr-only" />
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-purple-400" />
                      </div>
                      <Label htmlFor="oneshot" className="font-bold cursor-pointer">One-Shot Lesson</Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">Quick, focused lesson on a specific topic with immediate assessment.</p>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Course Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g., Advanced React Patterns" 
                  className="h-14 bg-secondary/50 border-white/10 text-lg rounded-xl focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Upload Syllabus (PDF, TXT, DOCX)</Label>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center hover:bg-white/5 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.txt,.docx"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-lg font-medium mb-1">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-sm text-muted-foreground">PDF, TXT, or DOCX up to 10MB</span>
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={!title || !file}
                className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
              >
                Generate Course
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
