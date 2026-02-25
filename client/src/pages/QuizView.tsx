import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useChapterQuiz, useSubmitQuiz } from "@/hooks/use-quiz";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle, XCircle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function QuizView() {
  const [, params] = useRoute("/quiz/:topic_id");
  const topicId = params?.topic_id || "";
  const [, setLocation] = useLocation();

  const { data: quizData, isLoading } = useChapterQuiz(topicId);
  const submitQuiz = useSubmitQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (isLoading) return <div className="h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!quizData) return <div className="text-center p-10 text-muted-foreground">Quiz not found</div>;

  const questions = quizData.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedOption(option);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    setShowExplanation(true);
    setUserAnswers([...userAnswers, selectedOption]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Submit Quiz
      submitQuiz.mutate({
        topic_id: topicId,
        answers: userAnswers,
        correct_answers: questions.map((q: any) => q.correct_answer),
      }, {
        onSuccess: () => setIsFinished(true)
      });
    }
  };

  if (isFinished) {
    const score = userAnswers.filter((a, i) => a === questions[i].correct_answer).length;
    const percent = Math.round((score / questions.length) * 100);
    
    return (
      <div className="container max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <Brain className="w-12 h-12 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-4">Quiz Completed!</h1>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 mb-6 text-glow">
          {percent}%
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          {percent >= 80 ? "Excellent work! You've mastered this chapter." : 
           percent >= 60 ? "Good job! A little more review and you'll be perfect." : 
           "Keep practicing! Review the material and try again."}
        </p>
        <Button onClick={() => setLocation(`/dashboard`)} size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/25">
          Return to Course
        </Button>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuestion?.correct_answer;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => window.history.back()} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">
              Level: <span className={quizData.difficulty === 'Hard' ? 'text-red-400' : quizData.difficulty === 'Medium' ? 'text-yellow-400' : 'text-green-400'}>{quizData.difficulty}</span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
        
        <Progress value={((currentIndex) / questions.length) * 100} className="h-2 mb-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-display font-semibold mb-8 leading-snug">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-3 mb-8">
              {currentQuestion?.options.map((option: string, i: number) => {
                const isSelected = selectedOption === option;
                const isCorrectOption = option === currentQuestion.correct_answer;
                
                let borderClass = "border-white/10 hover:border-primary/50 bg-secondary/30";
                if (showExplanation) {
                  if (isCorrectOption) borderClass = "border-green-500 bg-green-500/10";
                  else if (isSelected) borderClass = "border-red-500 bg-red-500/10";
                  else borderClass = "border-white/5 opacity-50";
                } else if (isSelected) {
                  borderClass = "border-primary bg-primary/10";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(option)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${borderClass}`}
                  >
                    <span className="text-lg">{option}</span>
                    {showExplanation && isCorrectOption && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {showExplanation && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-500" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-6 rounded-2xl mb-8 ${isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
                >
                  <h4 className={`font-bold mb-2 flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-white/80">{currentQuestion?.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              {!showExplanation ? (
                <Button 
                  onClick={handleCheck} 
                  disabled={!selectedOption}
                  size="lg"
                  className="rounded-xl px-8 font-semibold bg-primary text-primary-foreground"
                >
                  Check Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  size="lg"
                  disabled={submitQuiz.isPending}
                  className="rounded-xl px-8 font-semibold bg-white text-black hover:bg-white/90"
                >
                  {submitQuiz.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
