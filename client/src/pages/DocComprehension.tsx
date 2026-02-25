import { useState, useRef, useEffect } from "react";
import { useDocUpload, useDocAsk } from "@/hooks/use-tools";
import { motion } from "framer-motion";
import { UploadCloud, MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DocComprehension() {
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [docText, setDocText] = useState<string>("");
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [input, setInput] = useState("");

  const uploadMutation = useDocUpload();
  const askMutation = useDocAsk();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askMutation.isPending]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    
    uploadMutation.mutate(formData, {
      onSuccess: (data) => {
        setSessionId(data.session_id);
        setDocText(data.text);
        setMessages([{ role: 'ai', content: "Document analyzed! What would you like to know about it?" }]);
      }
    });
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const query = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: query }]);

    askMutation.mutate({ question: query, session_id: sessionId, text: docText }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-400" /> Document Chat
        </h1>
        <p className="text-muted-foreground mt-1">Upload a PDF/TXT to ask questions and extract knowledge.</p>
      </div>

      {!sessionId ? (
        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleUpload} className="w-full max-w-md glass-panel p-8 rounded-3xl border-white/5 text-center">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UploadCloud className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-4">Upload Document</h3>
            <input 
              type="file" 
              id="doc-upload" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.txt"
            />
            <label 
              htmlFor="doc-upload" 
              className="block w-full border-2 border-dashed border-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/5 hover:border-purple-400/50 transition-colors mb-6"
            >
              <span className="font-medium text-sm">{file ? file.name : "Select a file to upload"}</span>
            </label>
            <Button 
              type="submit" 
              disabled={!file || uploadMutation.isPending}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
            >
              {uploadMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Document"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-card rounded-3xl border border-white/5 overflow-hidden shadow-xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-primary/20' : 'bg-purple-500/20'}`}>
                  {m.role === 'user' ? <User className="w-5 h-5 text-primary" /> : <Bot className="w-5 h-5 text-purple-400" />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary rounded-tl-none'}`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </motion.div>
            ))}
            {askMutation.isPending && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <div className="p-4 rounded-2xl bg-secondary rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleAsk} className="p-4 bg-background/50 border-t border-white/5 flex gap-3">
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question about the document..."
              className="flex-1 h-12 bg-secondary border-none rounded-xl focus-visible:ring-purple-500"
              disabled={askMutation.isPending}
            />
            <Button type="submit" disabled={!input.trim() || askMutation.isPending} className="h-12 w-12 p-0 rounded-xl bg-purple-600 hover:bg-purple-700">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

// Need FileText icon
import { FileText } from "lucide-react";
